export type ThemeMode = "light" | "dark" | "system";
export const themeStorageKey = "jasblog:theme";

export const themeBootstrap = `(()=>{const saved=localStorage.getItem(${JSON.stringify(themeStorageKey)});const mode=saved==='light'||saved==='dark'?saved:'system';const root=document.documentElement;root.dataset.themeMode=mode;root.classList.toggle('dark',mode==='dark'||mode==='system'&&matchMedia('(prefers-color-scheme: dark)').matches)})()`;

export function applyThemeMode(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.themeMode = mode;
  root.classList.toggle("dark", mode === "dark" || mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
}
