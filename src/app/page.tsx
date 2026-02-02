import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { getAllProjects } from "@/lib/projects";
import ArticleCard from "@/components/ArticleCard";
import SectionTitle from "@/components/SectionTitle";
import Hero from "@/components/Hero";

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 3);
  const projects = getAllProjects().slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Hero />

      {/* 最新笔记 */}
      <section className="mb-16">
        <SectionTitle subtitle="最近的学习记录">学习笔记</SectionTitle>
        {recentPosts.length > 0 ? (
          <div className="grid gap-6">
            {recentPosts.map((post) => (
              <ArticleCard
                key={post.slug}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                date={post.date}
                tags={post.tags}
              />
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-gray)] text-center py-12">
            暂无文章，敬请期待...
          </p>
        )}
      </section>

      {/* 开源项目 */}
      <section>
        <SectionTitle subtitle="我的开源作品">开源项目</SectionTitle>
        {projects.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="card-hover block rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold hover:text-[var(--color-vermilion)]">
                    {project.name}
                  </h3>
                </div>
                <p className="text-[var(--color-gray)] text-sm mb-3 line-clamp-2">
                  {project.description}
                </p>
                {project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.techStack.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-0.5 rounded bg-[var(--color-paper-dark)] text-[var(--color-gray)]"
                      >
                        {tech.name}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="text-xs px-2 py-0.5 text-[var(--color-gray)]">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-gray)] text-center py-12">
            暂无项目，敬请期待...
          </p>
        )}
      </section>
    </div>
  );
}
