"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { ResolvedNavigationItem, SectionId, SiteConfig } from "@jas/content-core";
import { SectionArtwork, SectionIcon } from "./SectionIcon";

type IntroPhase = "pending" | "typing" | "holding" | "deleting" | "ready" | "static";
const introTiming = { start: 300, type: 85, hold: 900, erase: 45, reveal: 180 };

export default function HomePortal({ name, home, sections, navigation, noteCount }: { name: string; home: SiteConfig["home"]; sections: SiteConfig["sections"]; navigation: ResolvedNavigationItem[]; noteCount: number }) {
  const characters = useMemo(() => Array.from(new Intl.Segmenter("zh-CN", { granularity: "grapheme" }).segment(home.motto), ({ segment }) => segment), [home.motto]);
  const [intro, setIntro] = useState<{ phase: IntroPhase; length: number }>({ phase: "pending", length: characters.length });
  const entries = navigation.filter((item) => item.target !== "home");

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;
    let length = 0;
    const finish = () => { window.clearTimeout(timer); setIntro({ phase: "ready", length: 0 }); };
    const showStatic = () => { window.clearTimeout(timer); setIntro({ phase: "static", length: characters.length }); };
    const erase = () => {
      length--;
      setIntro({ phase: "deleting", length });
      timer = window.setTimeout(length > 0 ? erase : finish, length > 0 ? introTiming.erase : introTiming.reveal);
    };
    const type = () => {
      length++;
      const complete = length === characters.length;
      setIntro({ phase: complete ? "holding" : "typing", length });
      timer = window.setTimeout(complete ? erase : type, complete ? introTiming.hold : introTiming.type);
    };
    const skip = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && !motion.matches && !document.querySelector('dialog[open], [role="search"]:not([hidden])')) finish();
    };

    if (motion.matches) showStatic();
    else if (!characters.length) finish();
    else {
      setIntro({ phase: "typing", length: 0 });
      timer = window.setTimeout(type, introTiming.start);
    }
    motion.addEventListener("change", showStatic);
    window.addEventListener("keydown", skip);
    return () => {
      window.clearTimeout(timer);
      motion.removeEventListener("change", showStatic);
      window.removeEventListener("keydown", skip);
    };
  }, [characters]);

  return <div className="photo-portal" data-phase={intro.phase}>
    <div className="portal-content">
      <div className="portal-heading"><p className="portal-site-name">{name}</p>{home.description && <p className="portal-description">{home.description}</p>}<span className="portal-signature" aria-hidden="true"><span /><span /><span /></span></div>
      <div className="portal-stage">
        <header className="portal-intro"><h1 aria-label={home.motto}>
          <span className="portal-motto-text" aria-hidden="true">{characters.map((character, index) => <span key={index} className="portal-character" data-visible={index < intro.length} data-current={index === intro.length - 1}>{character}</span>)}</span>
        </h1></header>
        <nav className="portal-navigation" aria-label="探索栏目"><ul>
          {entries.map((item, index) => {
            const description = item.target in sections ? sections[item.target as SectionId].description : "";
            return <li key={item.target} style={{ "--portal-order": index } as CSSProperties}>
              <Link href={item.href} className="portal-link" data-section={item.target}>
                <div className="portal-entry-top"><SectionIcon target={item.target} className="portal-icon" /><svg className="portal-arrow" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 19 19 5M5 5h14v14" /></svg></div>
                <SectionArtwork target={item.target} />
                <div className="portal-entry-caption"><span className="portal-entry-title">{item.label}</span>{item.target === "notes" && noteCount > 0 && <span className="portal-count">{noteCount} 篇</span>}{description && <span className="portal-entry-description">{description}</span>}</div>
              </Link>
            </li>;
          })}
        </ul></nav>
      </div>
    </div>
  </div>;
}
