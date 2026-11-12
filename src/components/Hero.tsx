"use client";

import { useState } from "react";
import Typewriter from "./Typewriter";
import type { SiteConfig } from "@jas/content-core";

export default function Hero({ home }: { home: SiteConfig["home"] }) {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  return (
    <section className="text-center mb-16">
      <h1 className="text-4xl font-bold mb-4">
        <Typewriter
          text={home.heading}
          speed={120}
          onComplete={() => setShowSubtitle(true)}
        />
        {showSubtitle && (
          <span className="text-[var(--color-vermilion)]">
            <Typewriter
              text={home.accent}
              speed={120}
              onComplete={() => setShowDescription(true)}
            />
          </span>
        )}
      </h1>
      <p
        className={`text-[var(--color-gray)] max-w-xl mx-auto transition-opacity duration-500 ${
          showDescription ? "opacity-100" : "opacity-0"
        }`}
      >
        {home.description}
      </p>
      <div
        className={`divider-cloud mt-10 transition-opacity duration-500 ${
          showDescription ? "opacity-100" : "opacity-0"
        }`}
      />
    </section>
  );
}
