import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function loadService(supabase) {
  const source = readFileSync(new URL("../src/services/dbService.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require: (name) => {
      assert.equal(name, "@/lib/supabase");
      return { supabase };
    },
  });
  return exports;
}

test("design options include later pages and remove repeated project/reference names", async () => {
  const ranges = [];
  const service = loadService({
    from(table) {
      assert.equal(table, "lab_records");
      return {
        select() { return this; },
        order() { return this; },
        async range(start, end) {
          ranges.push([start, end]);
          return {
            error: null,
            data: start === 0
              ? Array.from({ length: 500 }, () => ({ project_name: "Project B", ref_no: "REF-2" }))
              : [{ project_name: "Project A", ref_no: "REF-1" }],
          };
        },
      };
    },
  });
  const result = await service.fetchDesignOptions();
  assert.deepEqual(Array.from(result.projects), ["Project A", "Project B"]);
  assert.deepEqual(Array.from(result.references), ["REF-1", "REF-2"]);
  assert.deepEqual(ranges, [[0, 499], [500, 999]]);
});

test("a failed option lookup rejects rather than returning an empty list", async () => {
  const failure = new Error("offline");
  const service = loadService({
    from() {
      return {
        select() { return this; },
        order() { return this; },
        async range() { return { data: null, error: failure }; },
      };
    },
  });
  await assert.rejects(service.fetchDesignOptions(), (error) => error === failure);
});

test("submission stores every unit operation in the supplied order", async () => {
  let inserted;
  const service = loadService({
    from(table) {
      assert.equal(table, "designs");
      return { async insert(payload) { inserted = payload; return { error: null }; } };
    },
  });
  const unitOperations = [
    { operation: "Screening", retentionTime: "15 minutes", specialComment: "Coarse screen" },
    { operation: "Equalization", retentionTime: "2 hours", specialComment: "" },
    { operation: "pH Correction", retentionTime: "30 minutes", specialComment: "Monitor pH" },
  ];
  await service.insertDesign({ projectName: "Project A", designValue: "REF-1", treatmentType: "Both", unitOperations });
  assert.deepEqual(JSON.parse(JSON.stringify(inserted)), {
    project_name: "Project A", design_value: "REF-1", treatment_type: "Both", unit_operations: unitOperations,
  });
});

test("failed submission rejects so the form cannot report success", async () => {
  const failure = new Error("save failed");
  const service = loadService({ from: () => ({ insert: async () => ({ error: failure }) }) });
  await assert.rejects(service.insertDesign({}), (error) => error === failure);
});
