import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "../pages/Home";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";

// Mocking axios
vi.mock("axios");

describe("Home Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    axios.get.mockReset();
  });

  it("renders top section correctly", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    //A regex allows anything (including newline characters, spaces, line breaks, or nested elements)) between "Find your next" and "place with ease".
    // Target the heading (h1)
    const heading = screen.getByRole("heading", {
      name: /find your next.*perfect.*place with ease/i,
    });
    expect(heading).toBeInTheDocument();

    // Verify the subtext
    expect(
      screen.getByText(
        /Walid Estate is the best place to find your next perfect place to live/i
      )
    ).toBeInTheDocument();

    // Verify the link
    expect(screen.getByText(/Let's get started.../i)).toBeInTheDocument();
  });
});
