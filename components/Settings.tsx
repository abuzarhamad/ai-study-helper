import { Setting } from "./Setting";

export function Settings({ settings, setSettings }) {
  return (
    <div className="border-b border-white/[0.06] bg-[#171717] px-4 py-4 md:px-6">
      <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
        <Setting
          label="Response style"
          value={settings.style}
          options={[
            ["balanced", "Balanced"],
            ["teacher", "Teacher"],
            ["concise", "Concise"],
          ]}
          onChange={(value) =>
            setSettings((current) => ({
              ...current,
              style: value,
            }))
          }
        />

        <Setting
          label="Response length"
          value={settings.length}
          options={[
            ["short", "Short"],
            ["medium", "Medium"],
            ["long", "Long"],
          ]}
          onChange={(value) =>
            setSettings((current) => ({
              ...current,
              length: value,
            }))
          }
        />

        <Setting
          label="Explanation level"
          value={settings.level}
          options={[
            ["simple", "Simple"],
            ["standard", "Standard"],
            ["advanced", "Advanced"],
          ]}
          onChange={(value) =>
            setSettings((current) => ({
              ...current,
              level: value,
            }))
          }
        />
      </div>
    </div>
  );
}
