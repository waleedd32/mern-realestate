import React from "react";
// following can be removed if wanted because globals is set to true in vite config test
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import About from "../pages/About";

describe("About Component", () => {
  beforeEach(() => {
    render(<About />);
  });

  it("renders the main container with correct class names", () => {
    const mainDiv = screen.getByRole("heading", { level: 1 }).parentElement;
    expect(mainDiv).toHaveClass("py-20", "px-4", "max-w-6xl", "mx-auto");
  });

  it("displays the correct heading text", () => {
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("About Walid Estate");
  });

  it("renders all three paragraphs with correct content", () => {
    const paragraphs = screen.getAllByText(/./i, { selector: "p" });
    expect(paragraphs).toHaveLength(3);

    // Test first paragraph content
    expect(paragraphs[0]).toHaveTextContent(
      /At Walid Estate, we pride ourselves on being a premier real estate agency/i
    );
  });
});