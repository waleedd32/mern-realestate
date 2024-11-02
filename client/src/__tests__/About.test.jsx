import React from "react";
// following can be removed if wanted because globals is set to true in vite config test
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import About from "../pages/About";

describe("About Component", () => {
  beforeEach(() => {
    render(<About />);
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

    // Test second paragraph content
    expect(paragraphs[1]).toHaveTextContent(
      /Our goal is to support you in reaching your real estate aspirations/i
    );

    // Test third paragraph content
    expect(paragraphs[2]).toHaveTextContent(
      /With years of expertise and insight in the real estate market/i
    );
  });

  it("applies correct CSS classes", () => {
    // Check main container classes
    const container = screen.getByRole("heading", { level: 1 }).parentElement;
    expect(container).toHaveClass("py-20", "px-4", "max-w-6xl", "mx-auto");

    // Check heading classes
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass(
      "text-3xl",
      "font-bold",
      "mb-4",
      "text-slate-800"
    );

    // Check paragraph classes
    const paragraphs = screen.getAllByRole("paragraph");
    paragraphs.forEach((paragraph) => {
      expect(paragraph).toHaveClass("mb-4", "text-slate-700");
    });
  });
});
