import { readSite } from "@jas/site-tools";
import type { SectionId } from "@jas/content-core";

export function getSite() { return readSite(); }
export function sectionEnabled(section: SectionId) { return getSite().sections[section].enabled; }
export function sectionMetadata(section: SectionId) { const { title, description } = getSite().sections[section]; return { title, description }; }
