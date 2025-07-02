import React from "react";
import { render, screen } from "@testing-library/react";
import { TestRouter } from "@/testing/testRouter";
import { NavigationContainer } from "../NavigationContainer";

describe("NavigationContainer", () => {
  it("should wrap children in PreservedNavItems", () => {
    render(
      <TestRouter>
        <NavigationContainer>
          <a href="/" data-testid="home-link">
            Home
          </a>
          <a href="/about" data-testid="about-link">
            About
          </a>
        </NavigationContainer>
      </TestRouter>,
    );

    // Verify links exist using test IDs
    expect(screen.getByTestId("home-link").textContent).toBe("Home");
    expect(screen.getByTestId("about-link").textContent).toBe("About");

    // Verify container structure
    const container = screen.getByTestId("navigation-container");
    expect(container).toBeTruthy();

    // Verify preservation attributes
    const navItems = container.querySelectorAll("[data-menu-item]");
    expect(navItems.length).toBe(2);
    expect(navItems[0].getAttribute("data-menu-item")).toBe("nav-item-0");
  });
});
