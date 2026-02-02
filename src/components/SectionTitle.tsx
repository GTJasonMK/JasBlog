interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
}

export default function SectionTitle({ children, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold flex items-center gap-4">
        <span className="w-1.5 h-8 bg-gradient-to-b from-[var(--color-vermilion)] to-[var(--color-vermilion-light)] rounded-full" />
        <span className="section-title">{children}</span>
      </h2>
      {subtitle && (
        <p className="text-sm text-[var(--color-gray)] mt-3 ml-6">
          {subtitle}
        </p>
      )}
    </div>
  );
}
