export default function SectionHeading({
  eyebrow,
  title,
  subtitle
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="text-3xl md:text-4xl font-semibold leading-tight max-w-2xl">{title}</h2>
      {subtitle ? <p className="text-slate-300 max-w-3xl">{subtitle}</p> : null}
    </div>
  );
}
