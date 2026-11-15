import Image from "next/image";
import { publicAssetUrl } from "@/lib/site-config";

export default function SiteBackground({ background }: { background?: { desktop?: string; mobile?: string; alt: string } }) {
  const desktop = background?.desktop ?? "/backgrounds/lake.webp";
  const mobile = background?.mobile ?? desktop;
  return <div className="site-background" aria-hidden="true"><picture>
    <source media="(max-width: 767px)" srcSet={publicAssetUrl(mobile)} type="image/webp" />
    <Image src={publicAssetUrl(desktop)} alt={background?.alt ?? ""} width={2400} height={1600} loading="eager" fetchPriority="high" unoptimized />
  </picture></div>;
}
