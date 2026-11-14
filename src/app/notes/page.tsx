import NotesPage from "@/components/NotesPage";
import { sectionMetadata } from "@/lib/site";

export function generateMetadata() { return sectionMetadata("notes"); }

export default function NotesIndex() { return <NotesPage />; }
