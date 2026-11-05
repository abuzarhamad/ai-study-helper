const settingOptions = {
  style: ["balanced", "teacher", "concise"],
  length: ["short", "medium", "long"],
  level: ["simple", "standard", "advanced"],
} as const;

export type StudySettings = {
  [Key in keyof typeof settingOptions]: (typeof settingOptions)[Key][number];
};

export const defaultStudySettings: StudySettings = {
  style: "balanced",
  length: "medium",
  level: "standard",
};

function isSettingOption<const Options extends readonly string[]>(
  value: unknown,
  options: Options,
): value is Options[number] {
  return typeof value === "string" && options.includes(value);
}

export function normalizeStudySettings(value: unknown): StudySettings | null {
  if (value === undefined || value === null) {
    return { ...defaultStudySettings };
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const settings = value as Record<string, unknown>;
  const style = settings.style ?? defaultStudySettings.style;
  const length = settings.length ?? defaultStudySettings.length;
  const level = settings.level ?? defaultStudySettings.level;

  if (
    !isSettingOption(style, settingOptions.style) ||
    !isSettingOption(length, settingOptions.length) ||
    !isSettingOption(level, settingOptions.level)
  ) {
    return null;
  }

  return { style, length, level };
}
