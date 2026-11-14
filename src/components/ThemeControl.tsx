"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRootTheme } from "@jas/content-ui/host";
import { applyThemeMode, themeStorageKey, type ThemeMode } from "@/lib/theme";

function subscribe(update: () => void) {
  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme-mode"] });
  return () => observer.disconnect();
}
const readMode = () => document.documentElement.dataset.themeMode as ThemeMode;

export default function ThemeControl() {
  const mode = useSyncExternalStore(subscribe, readMode, () => "system");
  const theme = useRootTheme();
  const [error, setError] = useState("");
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const update = () => { if (document.documentElement.dataset.themeMode === "system") applyThemeMode("system"); };
    const sync = (event: StorageEvent) => {
      if (event.key !== themeStorageKey && event.key !== null) return;
      applyThemeMode(event.newValue === "dark" || event.newValue === "light" ? event.newValue : "system");
    };
    media.addEventListener("change", update);
    window.addEventListener("storage", sync);
    return () => { media.removeEventListener("change", update); window.removeEventListener("storage", sync); };
  }, []);
  useEffect(() => {
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      meta.removeAttribute("media");
      meta.content = getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim();
    });
  }, [theme]);
  return <div className="theme-control">
    <label><span className="sr-only">外观主题</span><select value={mode} onChange={(event) => {
      const next = event.target.value as ThemeMode;
      applyThemeMode(next);
      try { localStorage.setItem(themeStorageKey, next); setError(""); }
      catch { setError("主题已切换，本次选择无法保存在浏览器。"); }
    }}><option value="system">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option></select></label>
    {error && <p role="alert" className="theme-error">{error}</p>}
  </div>;
}
