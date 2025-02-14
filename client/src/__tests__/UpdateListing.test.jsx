import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import UpdateListing from "../pages/UpdateListing";

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
  userRef: "test-user-id",
};

describe("UpdateListing Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads existing listing data on mount", async () => {
    axios.get.mockResolvedValueOnce({ data: mockListing });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UpdateListing />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Property")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("A beautiful test property")
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("123 Test St")).toBeInTheDocument();
    });
  });
});
