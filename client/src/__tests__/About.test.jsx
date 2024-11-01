import React from "react";
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
});
