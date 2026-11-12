import { getAllPosts } from "@/lib/posts";
import { getAllProjects } from "@/lib/projects";
import { NoteCard, ProjectCard, SectionTitle } from "@jas/content-ui/lists";
import Hero from "@/components/Hero";
import { getSite } from "@/lib/site";

export default function Home() {
  const site = getSite();
  const recentPosts = getAllPosts().slice(0, 3);
  const projects = getAllProjects().slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Hero home={site.home} />

      {/* 最新笔记 */}
      {site.sections.notes.enabled && <section className="mb-16">
        <SectionTitle subtitle={site.home.notesDescription}>{site.sections.notes.title}</SectionTitle>
        {recentPosts.length > 0 ? (
          <div className="grid gap-6">
            {recentPosts.map((post) => (
              <NoteCard
                key={post.slug}
                note={post}
              />
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-gray)] text-center py-12">
            暂无文章，敬请期待...
          </p>
        )}
      </section>}

      {/* 开源项目 */}
      {site.sections.projects.enabled && <section>
        <SectionTitle subtitle={site.home.projectsDescription}>{site.sections.projects.title}</SectionTitle>
        {projects.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} compact />
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-gray)] text-center py-12">
            暂无项目，敬请期待...
          </p>
        )}
      </section>}
    </div>
  );
}
