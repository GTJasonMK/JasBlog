import { notFound } from "next/navigation";
import Image from "next/image";
import CollectionBrowser from "@/components/CollectionBrowser";
import { getCollectionBySlug, getCollectionDocuments, getCollections } from "@/lib/collections";
import { getFriends } from "@/lib/friends";
import { getSite } from "@/lib/site";
import { getTemplateManifest } from "@/lib/template-manifest";
import { templateById } from "@jas/content-core";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() { return getCollections().filter((collection) => collection.enabled).map((collection) => ({ slug: collection.slug })); }
export function generateMetadata({ params }: Props) { return params.then(({ slug }) => { const collection = getCollectionBySlug(slug); return collection ? { title: collection.title, description: collection.description } : { title: "栏目未找到" }; }); }

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection || !collection.enabled) notFound();
  templateById(getTemplateManifest(), collection.templateId);
  if (collection.templateId === "friends-grid") return <FriendsView collection={collection} />;
  const items = getCollectionDocuments(collection);
  return <CollectionBrowser collection={collection} items={items} />;
}

function FriendsView({ collection }: { collection: Exclude<ReturnType<typeof getCollectionBySlug>, null> }) {
  return <div className="notes-directory"><section className="notes-results"><div className="notes-toolbar"><div className="notes-result-heading"><h1>{collection.title}</h1></div><p className="text-sm text-[var(--color-text-muted)]">{collection.description}</p></div>{getFriends().length ? <div className="grid gap-6 md:grid-cols-2">{getFriends().map((friend) => <a key={friend.id} href={friend.url} target="_blank" rel="noreferrer" className="card-hover block rounded-lg p-6"><div className="flex items-center gap-3"><div className="h-10 w-10 overflow-hidden rounded-full bg-[var(--color-surface-dark)]">{friend.avatar && <Image src={friend.avatar} alt="" width={40} height={40} unoptimized className="h-full w-full object-cover" />}</div><div><h2 className="text-lg font-semibold">{friend.name}</h2><p className="text-sm text-[var(--color-text-muted)]">{friend.description}</p></div></div></a>)}</div> : <p className="notes-empty">暂无友链。</p>}</section></div>;
}

