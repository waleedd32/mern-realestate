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

  it("prevents uploading more than 6 images", async () => {
    const store = createMockStore();

    // Creating 7 test files
    const files = Array(7)
      .fill(null)
      .map(
        (_, index) =>
          new File([`test image ${index}`], `test${index}.png`, {
            type: "image/png",
          })
      );

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

    // Checking for upload error message
    await waitFor(() => {
      expect(
        screen.getByText(/you can only upload 6 images per listing/i)
      ).toBeInTheDocument();
    });
  });

  it("removes an uploaded image", async () => {
    const store = createMockStore();

    // Mocking file for image upload
    const file = new File(["test image"], "test.png", { type: "image/png" });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreateListing />
        </BrowserRouter>
      </Provider>
    );

    // Uploading image
    const fileInput = screen.getByTestId("images-file-input");
    await userEvent.upload(fileInput, file);

    // clicking upload button
    const uploadButton = screen.getByRole("button", { name: /upload/i });
    await userEvent.click(uploadButton);

    // Checking that the image is actually present with the expected alt text before deleting
    const uploadedImage = await screen.findByAltText("listing image");
    expect(uploadedImage).toBeInTheDocument();

    // Finding and clicking delete button
    const deleteButton = await screen.findByRole("button", { name: /delete/i });
    await userEvent.click(deleteButton);

    // Verifying image is removed
    await waitFor(() => {
      const images = screen.queryAllByAltText("listing image");
      expect(images.length).toBe(0);
    });
  });

  //------

  it("displays error when discount price is higher than regular price", async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreateListing />
        </BrowserRouter>
      </Provider>
    );

    // Fill inputs
    await userEvent.type(
      screen.getByPlaceholderText("Name"),
      "Test Property Name"
    ); // at least 10 chars
    await userEvent.type(
      screen.getByPlaceholderText("Description"),
      "A valid description"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Address"),
      "123 Valid Street"
    );

    // Enabling offer so we can set discount
    const offerCheckbox = screen.getByTestId("offer-checkbox");
    await userEvent.click(offerCheckbox);

    // Setting regular price lower than discount to trigger the error
    const regularPriceInput = screen.getByTestId("regular-price");
    await userEvent.clear(regularPriceInput);
    await userEvent.type(regularPriceInput, "100");

    const discountPriceInput = screen.getByTestId("discount-price");
    await userEvent.clear(discountPriceInput);
    await userEvent.type(discountPriceInput, "150");

    // Uploading at least one image (since it's required)
    const file = new File(["test"], "test.png", { type: "image/png" });
    const fileInput = screen.getByTestId("images-file-input");
    await userEvent.upload(fileInput, file);

    // Clicking upload button
    const uploadButton = screen.getByRole("button", { name: /upload/i });
    await userEvent.click(uploadButton);

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /create listing/i,
    });
    await userEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(
        screen.getByText("Discount price must be lower than regular price")
      ).toBeInTheDocument();
    });
  });

  it("displays error when submitting without images", async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreateListing />
        </BrowserRouter>
      </Provider>
    );

    await userEvent.type(screen.getByPlaceholderText("Name"), "Test Property");
    await userEvent.type(
      screen.getByPlaceholderText("Description"),
      "Test Description"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Address"),
      "Test Address"
    );

    // Submit form without uploading images
    const submitButton = screen.getByRole("button", {
      name: /create listing/i,
    });
    await userEvent.click(submitButton);

    // Checking for error message
    expect(
      screen.getByText("You must upload at least one image")
    ).toBeInTheDocument();
  });

  it("handles API error during listing creation", async () => {
    const store = createMockStore();
    const errorMessage = "Server error occurred";

    // Mocking API error
    axios.post.mockRejectedValue({ message: errorMessage });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreateListing />
        </BrowserRouter>
      </Provider>
    );

    // Fill required fields
    await userEvent.type(
      screen.getByPlaceholderText("Name"),
      "Modern Apartment"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Description"),
      "A spacious and well-lit modern apartment with 3 bedrooms and 2 bathrooms."
    );
    await userEvent.type(
      screen.getByPlaceholderText("Address"),
      "123 Main Street, Springfield, USA"
    );

    // Uploading a mock image
    const file = new File(["test"], "test.png", { type: "image/png" });
    const fileInput = screen.getByTestId("images-file-input");
    await userEvent.upload(fileInput, file);

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    await userEvent.click(uploadButton);

    // Submit form
    const submitButton = screen.getByRole("button", {
      name: /create listing/i,
    });
    await userEvent.click(submitButton);

    // Checking for error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
