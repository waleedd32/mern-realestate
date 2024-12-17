import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import CreateListing from "../pages/CreateListing";
import userReducer from "../redux/user/userSlice";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import userEvent from "@testing-library/user-event";

// Mocking Firebase storage methods
vi.mock("firebase/storage", () => ({
  getDownloadURL: vi.fn(() => Promise.resolve("https://test.com/image.jpg")),
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(() => ({
    snapshot: { ref: {} },
    on: vi.fn((_, __, ___, complete) => complete()),
  })),
}));

// Mocking the firebase app
vi.mock("../firebase", () => ({
  app: {},
}));

// Mocking react-router-dom's useNavigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mocking axios
vi.mock("axios");

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
    },
    preloadedState: {
      user: {
        currentUser: {
          _id: "test-user-id",
          username: "testuser",
        },
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

describe("CreateListing Component", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it("renders the create listing form correctly", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreateListing />
        </BrowserRouter>
      </Provider>
    );

    // Checking for key form elements
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Address")).toBeInTheDocument();

    // Checking for checkboxes
    expect(screen.getByText("Sell")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.getByText("Parking spot")).toBeInTheDocument();
    expect(screen.getByText("Furnished")).toBeInTheDocument();
    expect(screen.getByText("Offer")).toBeInTheDocument();

    // Checking for number inputs
    expect(screen.getByText("Beds")).toBeInTheDocument();
    expect(screen.getByText("Baths")).toBeInTheDocument();
    expect(screen.getByText("Regular price")).toBeInTheDocument();
  });

  it("handles form submission successfully", async () => {
    const store = createMockStore();

    // Mock file for image upload
    const file = new File(["test image"], "test.png", { type: "image/png" });

    // Mock successful API response
    axios.post.mockResolvedValue({
      data: {
        _id: "new-listing-id",
        success: true,
        name: "Test Listing",
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreateListing />
        </BrowserRouter>
      </Provider>
    );

    // Fill out the form
    await userEvent.type(screen.getByPlaceholderText("Name"), "Test Property");
    await userEvent.type(
      screen.getByPlaceholderText("Description"),
      "A beautiful property"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Address"),
      "123 Test Street"
    );

    // Uploading image
    const fileInput = screen.getByTestId("images-file-input");
    await userEvent.upload(fileInput, file);

    // Clicking upload button
    const uploadButton = screen.getByRole("button", { name: /upload/i });
    await userEvent.click(uploadButton);

    // Submit the form
    const createListingButton = screen.getByRole("button", {
      name: /create listing/i,
    });
    await userEvent.click(createListingButton);

    // Waiting and verify navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/listing/new-listing-id");
    });
  });

  it("handles multiple image uploads", async () => {
    const store = createMockStore();

    // Creating multiple test files
    const files = [
      new File(["test image 1"], "test1.png", { type: "image/png" }),
      new File(["test image 2"], "test2.png", { type: "image/png" }),
    ];

    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreateListing />
        </BrowserRouter>
      </Provider>
    );

    // Uploading multiple images
    const fileInput = screen.getByTestId("images-file-input");
    await userEvent.upload(fileInput, files);

    // Clicking upload button
    const uploadButton = screen.getByRole("button", { name: /upload/i });
    await userEvent.click(uploadButton);

    // Checking that images are displayed
    await waitFor(() => {
      const images = screen.getAllByAltText("listing image");
      expect(images.length).toBe(2);
    });
  });
});
