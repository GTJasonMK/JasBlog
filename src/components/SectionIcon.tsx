import type { NavigationItem } from "@jas/content-core";

const paths = {
  projects: "M4 5h16v14H4zM4 9h16M8 12l2 2-2 2m5 0h3",
  notes: "M5 3h14v18H5zM8 3v18m3-13h5m-5 4h5m-5 4h3",
  photography: "M3 7h4l2-3h6l2 3h4v13H3zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  graphs: "M8 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m14 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0m14-14a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 5h8M5 8v8m3 3h8M19 8v8",
  diary: "M12 5C8 2 5 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-1-6-2-10 1Zm0 0v16",
  roadmap: "M3 6 9 3l6 3 6-3v15l-6 3-6-3-6 3zm6-3v15m6-12v15",
  "page:friends": "m9 15 6-6M11 7l1-1a5 5 0 0 1 7 7l-1 1M13 17l-1 1a5 5 0 0 1-7-7l1-1",
  timeline: "M7 3v18m0-16h12M7 12h8m-8 7h12M4 5h6M4 12h6M4 19h6",
};

export function SectionIcon({ target, className }: { target: NavigationItem["target"]; className?: string }) {
  const path = target in paths ? paths[target as keyof typeof paths] : "M5 3h10l4 4v14H5zM15 3v5h4M8 12h8m-8 4h5";
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>;
}

export function SectionArtwork({ target }: { target: NavigationItem["target"] }) {
  return <svg className="portal-artwork" viewBox="0 0 240 160" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
    {target === "photography" ? <><path d="M42 54V24h32m92 0h32v30M42 106v30h32m92 0h32v-30" /><circle cx="120" cy="80" r="38" /><circle cx="120" cy="80" r="26" /><path d="m120 42 21 38-22 38M84 68h44l21 38m-60 0 20-38 44-1" /></>
      : target === "graphs" ? <><path d="m57 48 65 33 64-49M57 48l17 85 48-52 60 42M74 133l108-10 4-91" /><circle cx="57" cy="48" r="13" /><circle cx="122" cy="81" r="18" /><circle cx="186" cy="32" r="9" /><circle cx="74" cy="133" r="8" /><circle cx="182" cy="123" r="12" /></>
      : target === "projects" ? <><rect x="36" y="25" width="172" height="115" rx="9" /><path d="M36 49h172m-151-12h1m9 0h1m9 0h1M62 71l16 14-16 14m32 0h35m-35 15h78m-27-29h27" /><path d="M49 25v-9h139v9" opacity=".5" /></>
      : target === "page:friends" ? <><rect x="28" y="24" width="116" height="82" rx="8" /><path d="M28 44h116M44 34h1m8 0h1m8 0h1M46 64h50m-50 17h35" /><rect x="112" y="70" width="100" height="72" rx="8" /><path d="M112 90h100m-80 18h55m-55 16h35M94 118l-12 12H58m100-80 12-12h24" /></>
      : target === "timeline" ? <><path d="M58 18v124M74 36h126M74 80h98M74 124h120" /><circle cx="58" cy="36" r="8" /><circle cx="58" cy="80" r="8" /><circle cx="58" cy="124" r="8" /><path d="M90 48h72M90 92h48M90 136h80" opacity=".5" /></>
      : <><rect x="64" y="19" width="122" height="133" rx="6" transform="rotate(8 64 19)" opacity=".5" /><rect x="46" y="13" width="122" height="133" rx="6" /><path d="M65 13v133m20-104h62M85 59h50m-50 27h62m-62 17h62m-62 17h36" /><path d="M132 13v37l-11-7-11 7V13" /></>}
  </svg>;
}
