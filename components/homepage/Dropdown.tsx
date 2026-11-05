"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  Settings,
  User,
  UserRound,
} from "lucide-react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

const menuItemSelector = '[role="menuitem"]';

export default function UserDropdown({ user, onOpenSettings }) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(user);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      const menuItems = menuRef.current?.querySelectorAll(menuItemSelector);
      if (!menuItems?.length) {
        return;
      }

      const currentIndex = Array.from(menuItems).indexOf(document.activeElement);
      let nextIndex;

      if (event.key === "ArrowDown") {
        nextIndex =
          currentIndex < 0 ? 0 : (currentIndex + 1) % menuItems.length;
      } else if (event.key === "ArrowUp") {
        nextIndex =
          currentIndex < 0
            ? menuItems.length - 1
            : (currentIndex - 1 + menuItems.length) % menuItems.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = menuItems.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      menuItems[nextIndex].focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || profileLoaded) {
      return undefined;
    }

    const controller = new AbortController();

    async function loadProfile() {
      try {
        const response = await fetch("/api/user", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load your profile.");
        }

        setProfile((current) => ({ ...current, ...data.user }));
        setProfileLoaded(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Load dropdown profile error:", error);
          toast.error("Could not load your profile details.");
        }
      }
    }

    loadProfile();
    return () => controller.abort();
  }, [open, profileLoaded]);

  if (!user) {
    return null;
  }

  function openMenu(focusLast = false) {
    setOpen(true);
    requestAnimationFrame(() => {
      const menuItems = menuRef.current?.querySelectorAll(menuItemSelector);
      if (menuItems?.length) {
        menuItems[focusLast ? menuItems.length - 1 : 0].focus();
      }
    });
  }

  function toggleMenu() {
    if (open) {
      setOpen(false);
    } else {
      openMenu();
    }
  }

  async function handleLogout() {
    setSigningOut(true);

    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Could not log out. Please try again.");
      setSigningOut(false);
    }
  }

  function handleSettings() {
    setOpen(false);
    onOpenSettings?.();
  }

  const displayName = profile?.name || user.name || "Your account";
  const avatar = profile?.profileImage;
  const avatarFailed = Boolean(avatar && failedAvatar === avatar);
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            openMenu(event.key === "ArrowUp");
          }
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="user-account-menu"
        aria-label={`${open ? "Close" : "Open"} account menu for ${displayName}`}
        className="flex items-center gap-2 rounded-full p-1 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-gray-800"
      >
        <Avatar
          src={avatar}
          failed={avatarFailed}
          initials={initials}
          alt=""
          size={40}
          onError={() => setFailedAvatar(avatar)}
        />
        <span className="hidden max-w-32 truncate text-sm font-medium text-gray-700 dark:text-gray-200 sm:block">
          {displayName}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id="user-account-menu"
          ref={menuRef}
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="border-b border-gray-100 p-4 dark:border-gray-800">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                src={avatar}
                failed={avatarFailed}
                initials={initials}
                alt=""
                size={48}
                onError={() => setFailedAvatar(avatar)}
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900 dark:text-white">
                  {displayName}
                </p>
                <p className="truncate text-sm text-gray-500">
                  {profile?.username
                    ? `@${profile.username}`
                    : profile?.email || user.email || ""}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1 p-2">
            <MenuLink
              href="/profile"
              icon={<UserRound size={18} />}
              label="My Profile"
              onClick={() => setOpen(false)}
            />
            <MenuLink
              href="/profile?edit=true"
              icon={<User size={18} />}
              label="Edit Profile"
              onClick={() => setOpen(false)}
            />
            <MenuButton
              icon={<Settings size={18} />}
              label="Settings"
              onClick={handleSettings}
            />
          </div>

          <div className="border-t border-gray-100 p-2 dark:border-gray-800">
            <MenuButton
              icon={<LogOut size={18} />}
              label={signingOut ? "Logging out..." : "Logout"}
              onClick={handleLogout}
              disabled={signingOut}
              destructive
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ src, failed, initials, alt, size, onError }) {
  const sizeClass = size === 48 ? "h-12 w-12 text-base" : "h-10 w-10 text-sm";

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center rounded-full border border-gray-200 bg-indigo-100 font-semibold text-indigo-700 dark:border-gray-700 dark:bg-indigo-950 dark:text-indigo-300 ${sizeClass}`}
      >
        {initials || <UserRound size={size === 48 ? 22 : 18} />}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      onError={onError}
      className={`shrink-0 rounded-full border border-gray-200 object-cover dark:border-gray-700 ${sizeClass}`}
    />
  );
}

function MenuLink({ href, icon, label, onClick }) {
  return (
    <Link
      href={href}
      role="menuitem"
      tabIndex={-1}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 transition hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  disabled = false,
  destructive = false,
}) {
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${
        destructive
          ? "text-red-600 hover:bg-red-50 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 dark:focus:bg-red-950/30"
          : "text-gray-700 hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
