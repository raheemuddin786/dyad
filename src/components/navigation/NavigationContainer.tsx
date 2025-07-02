import React from "react";
import { useNavigationPreservation } from "@/hooks/useNavigationPreservation";
import { PreservedNavItem } from "./PreservedNavItem";

interface NavigationContainerProps {
  children: React.ReactNode;
}

export const NavigationContainer: React.FC<NavigationContainerProps> = ({
  children,
}) => {
  useNavigationPreservation();

  return (
    <nav className="navigation-container" data-testid="navigation-container">
      {React.Children.map(children, (child, index) => (
        <PreservedNavItem id={`nav-item-${index}`}>{child}</PreservedNavItem>
      ))}
    </nav>
  );
};
