
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ProfileForm({ user, onSuccess }) {
  const [form, setForm] = useState({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
    headline: user.headline || "",
    phone: user.phone || "",
    website: user.website || "",
    gender: user.gender || "prefer_not_to_say",
    dateOfBirth: user.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().slice(0, 10)
      : "",
    profileImage: user.profileImage || "",
    coverImage: user.coverImage || "",
    city: user.location?.city || "",
    country: user.location?.country || "",
    skills: user.skills?.join(", ") || "",
    interests: user.interests?.join(", ") || "",
    instagram: user.socialLinks?.instagram || "",
    facebook: user.socialLinks?.facebook || "",
    twitter: user.socialLinks?.twitter || "",
    linkedin: user.socialLinks?.linkedin || "",
    github: user.socialLinks?.github || "",
    theme: user.preferences?.theme || "system",
    emailNotifications:
      user.preferences?.notifications?.email ?? true,
    pushNotifications:
      user.preferences?.notifications?.push ?? true,
    marketingNotifications:
      user.preferences?.notifications?.marketing ?? false,
  });

  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      username: form.username,
      bio: form.bio,
      headline: form.headline,
      phone: form.phone,
      website: form.website,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || null,
      profileImage: form.profileImage,
      coverImage: form.coverImage,

      location: {
        city: form.city,
        country: form.country,
      },

      skills: form.skills
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),

      interests: form.interests
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),

      socialLinks: {
        instagram: form.instagram,
        facebook: form.facebook,
        twitter: form.twitter,
        linkedin: form.linkedin,
        github: form.github,
      },

      preferences: {
        theme: form.theme,
        notifications: {
          email: form.emailNotifications,
          push: form.pushNotifications,
          marketing: form.marketingNotifications,
        },
      },
    };

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Update failed.");
        return;
      }

      onSuccess(data.user);
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Something went wrong while updating your profile.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white";

  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

  function Field({ label, name, ...props }) {
    return (
      <div>
        <label className={labelClass} htmlFor={name}>
          {label}
        </label>
        <input
          id={name}
          name={name}
          value={form[name]}
          onChange={handleChange}
          className={inputClass}
          {...props}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 space-y-8"
    >
      {/* Basic Information */}
      <section>
        <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">
          Basic Information
        </h2>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Full Name" name="name" required />
          <Field label="Username" name="username" />
          <Field label="Headline" name="headline" />
          <Field label="Phone" name="phone" />
          <Field label="Profile Image URL" name="profileImage" />
          <Field label="Cover Image URL" name="coverImage" />
          <Field label="Website" name="website" type="url" />

          <Field
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
          />

          <div>
            <label className={labelClass}>Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">
                Prefer not to say
              </option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label className={labelClass}>Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            maxLength={300}
            rows={4}
            className={inputClass}
            placeholder="Tell us something about yourself..."
          />
          <p className="text-xs text-gray-400 mt-1">
            {form.bio.length}/300 characters
          </p>
        </div>
      </section>

      {/* Location */}
      <section>
        <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">
          Location
        </h2>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="City" name="city" />
          <Field label="Country" name="country" />
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">
          Skills & Interests
        </h2>

        <div className="space-y-5">
          <Field
            label="Skills (comma separated)"
            name="skills"
            placeholder="React, Node.js, MongoDB"
          />

          <Field
            label="Interests (comma separated)"
            name="interests"
            placeholder="Technology, Design, Gaming"
          />
        </div>
      </section>

      {/* Social Links */}
      <section>
        <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">
          Social Links
        </h2>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Instagram" name="instagram" />
          <Field label="Facebook" name="facebook" />
          <Field label="Twitter / X" name="twitter" />
          <Field label="LinkedIn" name="linkedin" />
          <Field label="GitHub" name="github" />
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">
          Preferences
        </h2>

        <div>
          <label className={labelClass}>Theme</label>
          <select
            name="theme"
            value={form.theme}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="mt-5 space-y-3">
          {[
            ["emailNotifications", "Email notifications"],
            ["pushNotifications", "Push notifications"],
            ["marketingNotifications", "Marketing notifications"],
          ].map(([name, label]) => (
            <label
              key={name}
              className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
            >
              <input
                type="checkbox"
                name={name}
                checked={form[name]}
                onChange={handleChange}
                className="w-4 h-4 accent-blue-600"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* Submit */}
      <button
        disabled={saving}
        type="submit"
        className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
