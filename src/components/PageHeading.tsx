import type { ReactNode } from "react";

interface PageHeadingProps {
  title: string;
  description: string;
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
      <p>{description}</p>
    </div>
    {action && <div className="page-heading-action">{action}</div>}
  </div>
);
