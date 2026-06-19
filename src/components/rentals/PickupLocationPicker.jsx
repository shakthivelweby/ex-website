"use client";

const inputClassName =
  "mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20";

const selectClassName = `${inputClassName} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.94a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.65rem_center] bg-no-repeat pr-10`;

export default function PickupLocationPicker({
  options = [],
  selectedName = "",
  onSelect,
  placeholder = "Select pickup location",
  disabled = false,
}) {
  if (!options.length) {
    return (
      <div className={`${inputClassName} bg-gray-50 text-gray-500`}>
        No pickup locations available.
      </div>
    );
  }

  if (options.length === 1) {
    return (
      <div className={`${inputClassName} bg-gray-50`}>{options[0].name}</div>
    );
  }

  return (
    <select
      value={selectedName || ""}
      disabled={disabled}
      onChange={(e) => {
        const opt = options.find((o) => o.name === e.target.value);
        if (opt) onSelect?.(opt);
      }}
      className={selectClassName}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={String(opt.id)} value={opt.name}>
          {opt.name}
          {opt.is_primary ? " (Primary)" : ""}
        </option>
      ))}
    </select>
  );
}
