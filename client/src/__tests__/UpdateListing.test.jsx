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

  //

  // Test case 2: Listing already has images, so the new image should be appended.
  it("appends uploaded image to the existing imageUrls", async () => {
    // Use the mock listing with preexisting images.
    axios.get.mockResolvedValueOnce({ data: mockListing });

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

    // Waiting for the initial listing data to load.
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Property")).toBeInTheDocument();
    });

    // Verifying that two images are already rendered.
    let images = screen.getAllByAltText("listing image");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "image1.jpg");
    expect(images[1]).toHaveAttribute("src", "image2.jpg");

    // Simulating file selection and upload.
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    // Waiting for the new image to be appended.
    await waitFor(() => {
      images = screen.getAllByAltText("listing image");
      expect(images).toHaveLength(3);
      expect(images[2]).toHaveAttribute("src", "new-image-url.jpg");
    });
  });

  it("handles unsuccessful listing fetch (data.success false)", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: false, message: "Listing not found" },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UpdateListing />
        </BrowserRouter>
      </Provider>
    );

    // Since the listing fetch fails, form fields should remain at their default values.
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Name").value).toBe("");
    });
  });

  it("displays error when image upload fails", async () => {
    // Use a listing with no images to simplify
    const emptyListing = { ...mockListing, imageUrls: [] };
    axios.get.mockResolvedValueOnce({ data: emptyListing });

    const { uploadBytesResumable } = await import("firebase/storage");
    // Simulating error during upload
    uploadBytesResumable.mockImplementation(() => ({
      on: (event, progressCallback, errorCallback, completeCallback) => {
        errorCallback(new Error("Upload failed"));
      },
      snapshot: { ref: {} },
    }));

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
    });

    const fileInput = screen.getByTestId("file-input");
    const file = new File(["dummy"], "fail.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(
        screen.getByText("Image upload failed (2 mb max per image)")
      ).toBeInTheDocument();
    });
  });
  it("displays error when too many images are uploaded", async () => {
    // Use listing with 2 images.
    axios.get.mockResolvedValueOnce({ data: mockListing });
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UpdateListing />
        </BrowserRouter>
      </Provider>
    );

    // Waiting for the listing data to load so formData.imageUrls equals ["image1.jpg", "image2.jpg"]
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Property")).toBeInTheDocument();
    });

    // Now simulate selecting 5 files.
    const fileInput = screen.getByTestId("file-input");
    const files = [
      new File(["test"], "test1.jpg", { type: "image/jpeg" }),
      new File(["test"], "test2.jpg", { type: "image/jpeg" }),
      new File(["test"], "test3.jpg", { type: "image/jpeg" }),
      new File(["test"], "test4.jpg", { type: "image/jpeg" }),
      new File(["test"], "test5.jpg", { type: "image/jpeg" }),
    ];
    fireEvent.change(fileInput, { target: { files } });
    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(
        screen.getByText("You can only upload 6 images per listing")
      ).toBeInTheDocument();
    });
  });

  it("updates state on text and number input changes", async () => {
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
    });

    const nameInput = screen.getByPlaceholderText("Name");
    fireEvent.change(nameInput, { target: { value: "Luxury Apartment" } });
    expect(nameInput.value).toBe("Luxury Apartment");

    const descriptionInput = screen.getByPlaceholderText("Description");
    fireEvent.change(descriptionInput, {
      target: { value: "Spacious and modern apartment with sea view" },
    });
    expect(descriptionInput.value).toBe(
      "Spacious and modern apartment with sea view"
    );

    const addressInput = screen.getByPlaceholderText("Address");
    fireEvent.change(addressInput, {
      target: { value: "789 Ocean Drive, Miami, FL" },
    });
    expect(addressInput.value).toBe("789 Ocean Drive, Miami, FL");

    const bedroomsInput = screen.getByDisplayValue(
      String(mockListing.bedrooms)
    );
    fireEvent.change(bedroomsInput, { target: { value: "4" } });
    expect(bedroomsInput.value).toBe("4");
  });

  it("updates state on checkbox changes", async () => {
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
    });

    // Parking checkbox
    const parkingCheckbox = screen.getByTestId("parking-checkbox");
    expect(parkingCheckbox).toBeChecked(); // this is from mockListing (parking: true)
    fireEvent.click(parkingCheckbox);
    expect(parkingCheckbox).not.toBeChecked();

    // Furnished checkbox
    const furnishedCheckbox = screen.getByTestId("furnished-checkbox");
    expect(furnishedCheckbox).toBeChecked(); // this is from mockListing (furnished: true)
    fireEvent.click(furnishedCheckbox);
    expect(furnishedCheckbox).not.toBeChecked();

    // Offer checkbox
    const offerCheckbox = screen.getByTestId("offer-checkbox");
    expect(offerCheckbox).toBeChecked(); // this is from mockListing (offer: true)
    fireEvent.click(offerCheckbox);
    expect(offerCheckbox).not.toBeChecked();
  });

  it("updates property type on sale and rent checkbox toggle", async () => {
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
    });

    // We get the sale and rent checkboxes by testId
    const saleCheckbox = screen.getByTestId("sale-checkbox");
    const rentCheckbox = screen.getByTestId("rent-checkbox");

    // Because listing type is "rent", so rent is checked, sale is not (from mockListing.type = "rent")
    expect(rentCheckbox).toBeChecked();
    expect(saleCheckbox).not.toBeChecked();
    // we can also do like this:   expect(rentCheckbox.checked).toBe(true);

    // We click the sale to switch
    fireEvent.click(saleCheckbox);

    await waitFor(() => {
      expect(saleCheckbox).toBeChecked();
      expect(rentCheckbox).not.toBeChecked();
    });
  });

  it("displays error when regular price is less than discount price", async () => {
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
      expect(screen.getByDisplayValue("2000")).toBeInTheDocument();
    });

    const regularPriceInput = screen.getByDisplayValue("2000");
    const discountPriceInput = screen.getByDisplayValue("1800");

    fireEvent.change(regularPriceInput, { target: { value: "1000" } });
    fireEvent.change(discountPriceInput, { target: { value: "1500" } });

    const updateButton = screen.getByRole("button", {
      name: /update listing/i,
    });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(
        screen.getByText("Discount price must be lower than regular price")
      ).toBeInTheDocument();
    });
  });

  it("displays error message when form submission (axios.post) fails", async () => {
    axios.get.mockResolvedValueOnce({ data: mockListing });
    axios.post.mockRejectedValueOnce(new Error("Submission failed"));

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
    });

    const updateButton = screen.getByRole("button", {
      name: /update listing/i,
    });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("Submission failed")).toBeInTheDocument();
    });
  });

  it("displays error message when form submission returns success: false", async () => {
    // Mocking the GET request to load the initial listing data.
    axios.get.mockResolvedValueOnce({ data: mockListing });

    // Mocking the POST request to return success: false with an error message
    axios.post.mockResolvedValueOnce({
      data: { success: false, message: "Failed to update listing" },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UpdateListing />
        </BrowserRouter>
      </Provider>
    );

    // Waiting for the initial listing data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Property")).toBeInTheDocument();
    });

    // Simulating form submission
    const updateButton = screen.getByRole("button", {
      name: /update listing/i,
    });
    fireEvent.click(updateButton);

    // Waiting for the error message to appear
    await waitFor(() => {
      expect(screen.getByText("Failed to update listing")).toBeInTheDocument();
    });

    // Verifying that loading state is false after error
    expect(updateButton).not.toHaveTextContent("Updating...");
  });
});
