"use client";

import dynamic from "next/dynamic";

const Annotation = dynamic(() => import("agentation").then((module) => module.Agentation), { ssr: false });

export default function DevelopmentTools() {
  return process.env.NODE_ENV === "development" ? <Annotation /> : null;
}
