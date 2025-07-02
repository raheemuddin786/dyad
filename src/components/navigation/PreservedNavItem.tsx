import React from "react";

interface PreservedNavItemProps {
  id: string;
  children: React.ReactNode;
  expanded?: boolean;
}

export const PreservedNavItem: React.FC<PreservedNavItemProps> = ({
  id,
  children,
  expanded = false,
}) => (
  <div
    data-menu-item={id}
    aria-expanded={expanded}
    className="preserved-nav-item"
  >
    {children}
  </div>
);
