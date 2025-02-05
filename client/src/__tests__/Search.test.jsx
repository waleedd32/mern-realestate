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

  it("displays 'No listing found!' if the response data array is empty", async () => {
    // Mocking an empty array of listings
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    // Waiting for fetch to complete, then check for "No listing found!"
    await waitFor(() => {
      expect(screen.getByText("No listing found!")).toBeInTheDocument();
    });
  });

  it("displays listings when the API returns data", async () => {
    // Mocking some listings data
    axios.get.mockResolvedValueOnce({
      data: [
        {
          _id: "1",
          name: "Cozy Apartment",
          imageUrls: ["apartment.jpg"],
          regularPrice: 800,
          offer: false,
          type: "rent",
        },
        {
          _id: "2",
          name: "Beach House",
          imageUrls: ["beach.jpg"],
          regularPrice: 300000,
          offer: false,
          type: "sale",
        },
      ],
    });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Cozy Apartment")).toBeInTheDocument();
      expect(screen.getByText("Beach House")).toBeInTheDocument();
    });
  });

  it("should update the 'type' when a type checkbox is changed", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    // Initially, the type is "all" so the "all-type" checkbox is checked.
    const allType = screen.getByTestId("all-type");
    const rentType = screen.getByTestId("rent-type");
    const saleType = screen.getByTestId("sale-type");

    expect(allType.checked).toBe(true);
    expect(rentType.checked).toBe(false);
    expect(saleType.checked).toBe(false);

    // Simulating clicking on the "rent" checkbox.
    fireEvent.click(rentType);

    // Waiting for the state update.
    await waitFor(() => {
      expect(rentType.checked).toBe(true);
      expect(allType.checked).toBe(false);
      expect(saleType.checked).toBe(false);
    });
  });

  it("updates searchTerm when input changes", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    await waitFor(() => {
      const searchInput = screen.getByTestId("search-term-input");
      fireEvent.change(searchInput, { target: { value: "apartment" } });

      expect(searchInput.value).toBe("apartment");
    });
  });

  it("updates boolean checkboxes (parking, furnished, offer) when changed", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    const parkingCheckbox = screen.getByTestId("parking");
    const furnishedCheckbox = screen.getByTestId("furnished");
    const offerCheckbox = screen.getByTestId("offer-type");

    // Checking initial values and then click to update them.
    expect(parkingCheckbox.checked).toBe(false);
    fireEvent.click(parkingCheckbox);
    await waitFor(() => {
      expect(parkingCheckbox.checked).toBe(true);
    });

    expect(furnishedCheckbox.checked).toBe(false);
    fireEvent.click(furnishedCheckbox);
    await waitFor(() => {
      expect(furnishedCheckbox.checked).toBe(true);
    });

    expect(offerCheckbox.checked).toBe(false);
    fireEvent.click(offerCheckbox);
    await waitFor(() => {
      expect(offerCheckbox.checked).toBe(true);
    });
  });

  it("updates sort and order when sort select changes", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    await waitFor(() => {
      const sortSelect = screen.getByTestId("sort-order");
      fireEvent.change(sortSelect, { target: { value: "regularPrice_asc" } });

      expect(sortSelect.value).toBe("regularPrice_asc");
    });
  });
});
