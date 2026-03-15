type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold tracking-tight text-white">
        {title}
      </h2>

      {description ? (
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}
