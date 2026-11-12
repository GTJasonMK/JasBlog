export const siteBasePath = process.env.NODE_ENV === "production" && process.env.REPO_NAME && process.env.CUSTOM_DOMAIN !== "true"
  ? `/${process.env.REPO_NAME}` : "";

export function publicAssetUrl(src: string): string {
  return src.startsWith("/") ? siteBasePath + src : src;
}
