interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export function SectionHeading({ title, subtitle, rightElement }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--text-primary)] md:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 font-mono-data text-xs tracking-wide text-[var(--text-muted)]">
            {subtitle}
          </p>
        )}
      </div>
      {rightElement && <div className="shrink-0">{rightElement}</div>}
    </div>
  );
}
