"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const subscribers = new Set();

function subscribe(callback) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

function setTheme(next) {
  const root = document.documentElement;
  root.classList.add("theme-transitioning");
  root.classList.toggle("dark", next);
  try {
    window.localStorage.setItem("theme", next ? "dark" : "light");
  } catch {}
  subscribers.forEach((cb) => cb());
  window.setTimeout(() => {
    root.classList.remove("theme-transitioning");
  }, 350);
}

export function ThemeToggle({ className = "", showLabel = true }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setTheme(!isDark)}
      className={className}
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {showLabel && <span>{isDark ? "Mode terang" : "Mode gelap"}</span>}
    </button>
  );
}
