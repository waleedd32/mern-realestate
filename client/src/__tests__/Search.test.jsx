import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Search from "../pages/Search";

vi.mock("axios");

describe("Search Component", () => {
  beforeEach(() => {
    // Clearing all mocks to ensure no calls from previous tests affect the next
    vi.clearAllMocks();
  });

  it("renders the search form inputs and buttons", async () => {
    // Mocking an empty response so the component doesn't error
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    // Our component will call axios.get on mount so we wait for it to finish.
    await waitFor(() => {
      // Checking the presence of main form elements
      expect(screen.getByTestId("search-term-input")).toBeInTheDocument();
      expect(screen.getByTestId("all-type")).toBeInTheDocument();
      expect(screen.getByTestId("rent-type")).toBeInTheDocument();
      expect(screen.getByTestId("sale-type")).toBeInTheDocument();
      expect(screen.getByTestId("offer-type")).toBeInTheDocument();
      expect(screen.getByTestId("parking")).toBeInTheDocument();
      expect(screen.getByTestId("furnished")).toBeInTheDocument();
      expect(screen.getByTestId("sort-order")).toBeInTheDocument();
      expect(screen.getByTestId("search-button")).toBeInTheDocument();
    });
  });
});
