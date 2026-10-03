"use client";

interface Props {
  id: string;
  label: string;
  options: readonly string[];
  placeholder?: string;
}

export default function SearchableDropdown({ id, label, options, placeholder }: Props) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="required">{label}</label>
      <input
        id={id}
        name={id}
        list={`${id}-options`}
        placeholder={placeholder ?? "Type to search or select an option"}
        autoComplete="off"
        required
        onChange={(event) => {
          const input = event.currentTarget;
          input.setCustomValidity(
            input.value && !options.includes(input.value)
              ? "Choose a value from the available options."
              : ""
          );
        }}
      />
      <datalist id={`${id}-options`}>
        {options.map((option) => <option key={option} value={option} />)}
      </datalist>
    </div>
  );
}
