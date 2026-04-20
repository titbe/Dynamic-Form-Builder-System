import { ReactNode } from "react";

export const PageShell = ({ title, subtitle, actions, children }: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">{title}</h1>
          {subtitle ? <p className="text-sm text-brand-700">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
};
