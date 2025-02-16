import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import UpdateListing from "../pages/UpdateListing";

vi.mock("axios");
vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
}));

// Mock firebase app
vi.mock("../firebase", () => ({
  app: {},
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

  // Test case 1: Listing initially has no images.
  it("adds uploaded image when there are no existing images", async () => {
    // Creating a listing with an empty imageUrls array.
    const emptyListing = { ...mockListing, imageUrls: [] };

    axios.get.mockResolvedValueOnce({ data: emptyListing });

    // Override Firebase storage mocks to simulate successful upload.
    const { uploadBytesResumable, getDownloadURL } = await import(
      "firebase/storage"
    );
    uploadBytesResumable.mockImplementation(() => ({
      on: (event, progressCallback, errorCallback, completeCallback) => {
        progressCallback({ bytesTransferred: 100, totalBytes: 100 });
        completeCallback();
      },
      snapshot: { ref: {} },
    }));
    getDownloadURL.mockResolvedValue("new-image-url.jpg");

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UpdateListing />
        </BrowserRouter>
      </Provider>
    );

    // Waiting for initial listing data to load.
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Property")).toBeInTheDocument();
    });

    // Initially, there should be no images.
    expect(screen.queryAllByAltText("listing image")).toHaveLength(0);

    // Simulating file selection and upload.
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    // Waiting for the new image to appear.
    await waitFor(() => {
      const images = screen.getAllByAltText("listing image");
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute("src", "new-image-url.jpg");
    });
  });
});
