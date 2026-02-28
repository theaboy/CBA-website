import { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  body?: string;
  className?: string;
  children?: ReactNode;
};

export function Section({ id, eyebrow, title, body, className, children }: SectionProps) {
  return (
    <section id={id} className={`section-shell ${className ?? ""}`.trim()}>
      <div className="section-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {body ? <p className="section-body">{body}</p> : null}
      </div>
      {children}
    </section>
  );
}
