export const defaultStudySettings = {
  style: "balanced",
  length: "medium",
  level: "standard",
};

const settingOptions = {
  style: ["balanced", "teacher", "concise"],
  length: ["short", "medium", "long"],
  level: ["simple", "standard", "advanced"],
};

export function normalizeStudySettings(value) {
  if (value === undefined || value === null) {
    return { ...defaultStudySettings };
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const settings = {};

  for (const [key, options] of Object.entries(settingOptions)) {
    const option = value[key] ?? defaultStudySettings[key];
    if (!options.includes(option)) {
      return null;
    }
    settings[key] = option;
  }

  return settings;
}
