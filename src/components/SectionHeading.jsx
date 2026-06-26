export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
}) {
  const alignment =
    align === "left" ? "text-left items-start" : "text-center items-center mx-auto";
  return (
    <div className={`flex max-w-2xl flex-col ${alignment} ${className}`}>
      {eyebrow && <span className="eyebrow mb-3">{eyebrow}</span>}
      <h2 className="text-3xl font-bold leading-[1.1] text-charcoal sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-charcoal/60">
          {subtitle}
        </p>
      )}
      <span
        className={`mt-5 block h-0.5 w-16 rounded-full bg-gold ${
          align === "center" ? "mx-auto" : ""
        }`}
      />
    </div>
  );
}
