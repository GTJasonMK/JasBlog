import { readPhotos } from "@jas/site-tools";
import { sectionEnabled } from "./site";

export function getPhotos() { return sectionEnabled("photography") ? readPhotos().filter((photo) => photo.publication === "published") : []; }
