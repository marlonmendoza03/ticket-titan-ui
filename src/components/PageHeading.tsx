import type { ReactNode } from "react";

interface PageHeadingProps {
  title: string;
  description: ReactNode;
  action?: ReactNode;
}

export const PageHeading = ({
  title,
  description,
  action,
}: PageHeadingProps) => (
  <div className="page-heading">
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {action && <div className="page-heading-action">{action}</div>}
  </div>
);