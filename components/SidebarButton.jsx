export function SidebarButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex w-full items-center gap-3
        rounded-lg px-3 py-2.5
        text-left text-sm
        text-zinc-400 transition
        hover:bg-white/[0.06]
        hover:text-zinc-100
      "
    >
      <span className="text-zinc-500">{icon}</span>

      <span>{label}</span>
    </button>
  );
}
