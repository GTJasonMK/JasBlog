import TimelinePage from "@/components/TimelinePage";
import { sectionMetadata } from "@/lib/site";

export function generateMetadata() { return sectionMetadata("timeline"); }
export default function Page() { return <TimelinePage />; }
