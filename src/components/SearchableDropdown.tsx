"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  id: string;
  label: string;
  options: readonly string[];
  placeholder?: string;
}

export default function SearchableDropdown({ id, label, options, placeholder }: Props) {
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [invalid, setInvalid] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const filtered = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));
  const value = options.includes(selected) ? selected : "";

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open) {
      listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex, query]);

  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function choose(option: string) {
    setSelected(option);
    setInvalid(false);
    close();
    triggerRef.current?.focus();
  }

  return (
    <div className="form-group searchable-dropdown" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
    }}>
      <label htmlFor={id} className="required">{label}</label>
      <button
        id={id}
        ref={triggerRef}
        className="searchable-dropdown-trigger"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onClick={() => {
          if (open) close();
          else setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className={value ? "" : "searchable-dropdown-placeholder"}>
          {value || placeholder || "Select an option"}
        </span>
        <span aria-hidden="true">▾</span>
      </button>
      {/* Preserve native required validation and the existing FormData field names. */}
      <select
        className="sr-only"
        name={id}
        aria-label={label}
        tabIndex={-1}
        required
        value={value}
        onChange={(event) => choose(event.target.value)}
        onInvalid={(event) => {
          event.preventDefault();
          setInvalid(true);
          if (event.currentTarget.form?.querySelector(":invalid") === event.currentTarget) {
            triggerRef.current?.focus();
          }
        }}
      >
        <option value="">Select an option</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {open && (
        <div className="searchable-dropdown-menu">
          <input
            ref={searchRef}
            type="search"
            role="combobox"
            aria-label={`Search ${label}`}
            aria-expanded={open}
            aria-controls={`${id}-options`}
            aria-autocomplete="list"
            aria-activedescendant={filtered[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
            placeholder="Search options…"
            autoComplete="off"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) => Math.max(0, Math.min(filtered.length - 1,
                  index + (event.key === "ArrowDown" ? 1 : -1))));
              } else if (event.key === "Enter") {
                event.preventDefault();
                if (filtered[activeIndex]) choose(filtered[activeIndex]);
              } else if (event.key === "Escape") {
                event.preventDefault();
                close();
                triggerRef.current?.focus();
              }
            }}
          />
          <div id={`${id}-options`} ref={listRef} role="listbox" aria-label={label}
            className="searchable-dropdown-options">
            {filtered.map((option, index) => (
              <button
                key={option}
                id={`${id}-option-${index}`}
                type="button"
                role="option"
                aria-selected={value === option}
                data-active={activeIndex === index}
                className="searchable-dropdown-option"
                tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
              >
                <span>{option}</span>
                {value === option && <span aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
          {!filtered.length && <p className="searchable-dropdown-empty" role="status">No matching options</p>}
        </div>
      )}
      {invalid && <span id={`${id}-error`} className="design-error">Please select an option.</span>}
    </div>
  );
}
