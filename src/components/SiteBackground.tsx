import Image from "next/image";
import { publicAssetUrl } from "@/lib/site-config";

export default function SiteBackground() {
  return <div className="site-background" aria-hidden="true"><picture>
    <source media="(max-width: 767px)" srcSet={publicAssetUrl("/backgrounds/lake-mobile.webp")} type="image/webp" />
    <Image src={publicAssetUrl("/backgrounds/lake.webp")} alt="" width={2400} height={1600} loading="eager" fetchPriority="high" unoptimized />
  </picture></div>;
}
