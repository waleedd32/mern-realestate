import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Listing from "../pages/Listing";

// Mocking the modules
vi.mock("axios");

// Creating mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: (state = initialState) => state,
    },
    preloadedState: {
      user: {
        currentUser: {
          _id: "test-user-id",
        },
        ...initialState,
      },
    },
  });
};

// Mocking listing data
const mockListing = {
  _id: "test-listing-id",
  name: "Test Property",
  description: "A beautiful test property",
  address: "123 Test St",
  type: "rent",
  bedrooms: 3,
  bathrooms: 2,
  regularPrice: 2000,
  discountPrice: 1800,
  offer: true,
  parking: true,
  furnished: true,
  imageUrls: ["image1.jpg", "image2.jpg"],
  userRef: "owner-id",
};

describe("Listing Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state", async () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {}));

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error state when API call fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Failed to fetch"));

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    });
  });

  it("displays listing details correctly", async () => {
    axios.get.mockResolvedValueOnce({ data: mockListing });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    // Waiting for the listing name to appear using data-testid
    const listingName = await screen.findByTestId("listing-name");
    expect(listingName).toBeInTheDocument();
    expect(listingName).toHaveTextContent("Test Property - $ 1,800 / month");

    // Continue with other assertions
    expect(screen.getByText(mockListing.address)).toBeInTheDocument();
    expect(screen.getByText("For Rent")).toBeInTheDocument();
    expect(screen.getByText("3 beds", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("2 baths", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Parking spot")).toBeInTheDocument();
    expect(screen.getByText("Furnished")).toBeInTheDocument();
  });

  it("handles copy link functionality", async () => {
    //  Mocking the Clipboard API
    Object.assign(navigator, {
      clipboard: {
        // here Mocking writeText to return a resolved promise
        writeText: vi.fn().mockResolvedValue(),
      },
    });

    //  Mocking the Axios GET request
    axios.get.mockResolvedValueOnce({ data: mockListing });

    //  Create the mock store
    const store = createMockStore();

    //  Render the Listing component
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    //  Waiting for the Listing to Load
    await waitFor(() => {
      expect(screen.getByTestId("listing-name")).toBeInTheDocument();
    });

    //  Find the share button and click it
    const shareButton = screen.getByTestId("share-button");
    fireEvent.click(shareButton);

    //  Verify that navigator.clipboard.writeText was called with the correct URL
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      window.location.href
    );

    //  Verify that the "Link copied!" message appears
    expect(screen.getByText("Link copied!")).toBeInTheDocument();

    //  Wait for the "Link copied!" message to Disappear
    await waitFor(
      () => {
        expect(screen.queryByText("Link copied!")).not.toBeInTheDocument();
      },
      { timeout: 2100 } // Slightly more than the 2000ms timeout in the component
    );
  });

  it("shows contact landlord button for non-owner users", async () => {
    axios.get.mockResolvedValueOnce({ data: mockListing });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Contact landlord")).toBeInTheDocument();
    });
  });
});
