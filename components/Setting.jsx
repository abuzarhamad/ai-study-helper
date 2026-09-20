export function Setting({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-9 w-full rounded-lg
          border border-white/[0.08]
          bg-[#212121]
          px-3 text-xs text-zinc-300
          outline-none
          transition
          focus:border-violet-500/40
        "
      >
        {options.map(([optionValue, optionLabel]) => (
          <option
            key={optionValue}
            value={optionValue}
            className="bg-[#212121]"
          >
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}