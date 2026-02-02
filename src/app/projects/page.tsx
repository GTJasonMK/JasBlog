import { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import SectionTitle from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "开源项目",
  description: "我的开源项目列表",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <SectionTitle subtitle="分享我的开源作品">开源项目</SectionTitle>

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
                  {project.techStack.slice(0, 4).map((tech, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 rounded bg-[var(--color-paper-dark)] text-[var(--color-gray)]"
                    >
                      {tech.name}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="text-xs px-2 py-0.5 text-[var(--color-gray)]">
                      +{project.techStack.length - 4}
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
        <p className="text-[var(--color-gray)] text-center py-16">
          暂无项目，敬请期待...
        </p>
      )}
    </div>
  );
}
