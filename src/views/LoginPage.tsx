"use client";

import { FormEvent, useId, useState } from "react";
import Image from "next/image";
import { useApp } from "@/contexts/AppContext";

export default function LoginPage() {
  const { login, showToast } = useApp();
  const usernameId = useId();
  const passwordId = useId();
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (!ok) showToast("Invalid username or password.", true);
  }

  return (
    <div className="login-wrap">
      {/* ── Form Panel ── */}
      <section className="login-panel">
        <div className="card login-card">
          <div className="brand">
            <Image
              src="/puritas-logo.jpg"
              alt="Puritas logo"
              width={155}
              height={54}
              className="brand-logo login-logo"
              priority
            />
            <span>Puritas Smart Lab</span>
          </div>

          <h1>Welcome back</h1>
          <p>Sign in to manage and review wastewater laboratory test data.</p>

          <form onSubmit={handleLogin} className="form-grid one">
            <div className="form-group">
              <label htmlFor={usernameId} className="required">
                Username
              </label>
              <input
                id={usernameId}
                name="username"
                autoComplete="username"
                required
                placeholder="Enter your username"
              />
            </div>
            <div className="form-group">
              <label htmlFor={passwordId} className="required">
                Password
              </label>
              <input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
              />
            </div>
            <button
              id="login-submit-btn"
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>
        </div>
      </section>

      {/* ── Visual Panel ── */}
      <section className="login-visual" aria-hidden="true">
        <div className="login-visual-content">
          <h2>Smarter laboratory data for better engineering decisions.</h2>
          <p>
            Centralize wastewater test results, maintain traceable laboratory
            records, and give designers instant access to historical project data.
          </p>
          <div className="feature-pills">
            <span className="pill">Wastewater Data</span>
            <span className="pill">Historical Comparison</span>
            <span className="pill">Future AI Ready</span>
          </div>
        </div>
      </section>
    </div>
  );
}
