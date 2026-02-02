import Link from "next/link";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags?: string[];
}

export default function ArticleCard({
  slug,
  title,
  excerpt,
  date,
  tags = [],
}: ArticleCardProps) {
  return (
    <article className="card-hover rounded-lg p-6">
      <Link href={`/notes/${slug}`}>
        <div className="flex items-center gap-3 mb-2">
          <time className="text-xs text-[var(--color-gray-light)]">{date}</time>
          {tags.slice(0, 2).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <h3 className="text-lg font-semibold mb-2 hover:text-[var(--color-vermilion)]">
          {title}
        </h3>
        <p className="text-[var(--color-gray)] text-sm line-clamp-2">{excerpt}</p>
      </Link>
    </article>
  );
}
