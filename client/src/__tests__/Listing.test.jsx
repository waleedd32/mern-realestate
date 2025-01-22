import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Listing from "../pages/Listing";

// Mocking the modules
vi.mock("axios");

// Mocking Swiper components
vi.mock("swiper/react", () => ({
  Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }) => (
    <div data-testid="swiper-slide">{children}</div>
  ),
}));

// Mocking swiper modules
vi.mock("swiper", () => ({
  default: { use: vi.fn() },
}));

vi.mock("swiper/modules", () => ({
  Navigation: vi.fn(),
}));

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

  it("does not show contact button for listing owner", async () => {
    const listingWithCurrentUserAsOwner = {
      ...mockListing,
      userRef: "test-user-id",
    };

    axios.get.mockResolvedValueOnce({ data: listingWithCurrentUserAsOwner });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Contact landlord")).not.toBeInTheDocument();
    });
  });

  it("displays images in swiper", async () => {
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
      const swiperSlides = screen.getAllByTestId("swiper-slide");
      expect(swiperSlides).toHaveLength(mockListing.imageUrls.length);
    });
  });

  it("toggles contact form when contact button is clicked", async () => {
    axios.get
      // First mock handles the listing data fetch in Listing component
      .mockResolvedValueOnce({ data: mockListing })
      // Second mock handles the landlord data fetch in Contact component
      // Without this, the landlord would be null and the form wouldn't render
      .mockResolvedValueOnce({
        data: { username: "Test Landlord", email: "test@example.com" },
      });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    // Waiting for the listing to be rendered
    await waitFor(() => {
      expect(screen.getByText("Contact landlord")).toBeInTheDocument();
    });

    // Clicking the "Contact landlord" button
    fireEvent.click(screen.getByText("Contact landlord"));

    // Now waiting for the contact form to appear
    await waitFor(() => {
      expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    });
  });

  it("shows discount information when offer exists", async () => {
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
      expect(screen.getByText("$200 OFF")).toBeInTheDocument();
    });
  });

  it("shows error message when API returns success: false", async () => {
    // Mocking the API response with success: false
    axios.get.mockResolvedValueOnce({
      data: { success: false, message: "Listing not found" },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    // Initially should show loading
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Waiting for the error message to appear
    await waitFor(() => {
      expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    });

    // Make sure loading message is no longer shown
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();

    // Make sure the API was called
    expect(axios.get).toHaveBeenCalled();
  });

  it("displays rental property without discount correctly", async () => {
    const mockListing = {
      name: "Basic Apartment",
      type: "rent",
      offer: false,
      regularPrice: 1500,
      imageUrls: [],
    };

    axios.get.mockResolvedValueOnce({ data: mockListing });

    render(
      <Provider store={createMockStore()}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    const listingName = await screen.findByTestId("listing-name");
    expect(listingName).toHaveTextContent("Basic Apartment - $ 1,500 / month");
  });

  it("displays rental property with discount price correctly", async () => {
    const mockListing = {
      name: "Luxury Apartment",
      type: "rent",
      offer: true,
      regularPrice: 2500,
      discountPrice: 2000,
      imageUrls: [],
    };

    axios.get.mockResolvedValueOnce({ data: mockListing });

    render(
      <Provider store={createMockStore()}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    const listingName = await screen.findByTestId("listing-name");
    expect(listingName).toHaveTextContent("Luxury Apartment - $ 2,000 / month");
  });

  it("displays property for sale with discount correctly", async () => {
    const mockListing = {
      name: "Family House",
      type: "sale",
      offer: true,
      regularPrice: 500000,
      discountPrice: 450000,
      imageUrls: [],
    };

    axios.get.mockResolvedValueOnce({ data: mockListing });

    render(
      <Provider store={createMockStore()}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    const listingName = await screen.findByTestId("listing-name");
    expect(listingName).toHaveTextContent("Family House - $ 450,000");
    expect(listingName).not.toHaveTextContent("/ month");
  });

  it("displays property for sale without discount correctly", async () => {
    const mockListing = {
      name: "Vacation Home",
      type: "sale",
      offer: false,
      regularPrice: 300000,
      imageUrls: [],
    };

    axios.get.mockResolvedValueOnce({ data: mockListing });

    render(
      <Provider store={createMockStore()}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    const listingName = await screen.findByTestId("listing-name");
    expect(listingName).toHaveTextContent("Vacation Home - $ 300,000");
    expect(listingName).not.toHaveTextContent("/ month");
  });
});
