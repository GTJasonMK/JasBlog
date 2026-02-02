"use client";

import { useState } from "react";
import Typewriter from "./Typewriter";

export default function Hero() {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  return (
    <section className="text-center mb-16">
      <h1 className="text-4xl font-bold mb-4">
        <Typewriter
          text="代码与文字，"
          speed={120}
          onComplete={() => setShowSubtitle(true)}
        />
        {showSubtitle && (
          <span className="text-[var(--color-vermilion)]">
            <Typewriter
              text="皆是修行"
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
        这里记录我的开源项目与学习心得，愿以代码为笔，书写技术人生。
      </p>
      <div
        className={`divider-cloud mt-10 transition-opacity duration-500 ${
          showDescription ? "opacity-100" : "opacity-0"
        }`}
      />
    </section>
  );
}
