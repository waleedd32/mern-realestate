import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Profile from "../pages/Profile";
import userReducer from "../redux/user/userSlice";

// Mocking axios
vi.mock("axios");

// Creating a mock store
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
          email: "test@example.com",
          avatar: "avatar-link.jpg",
        },
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

// Mock Firebase storage
vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(() => ({
    on: vi.fn((event, progressCallback, errorCallback, completeCallback) => {
      // Simulating initial progress
      progressCallback({ bytesTransferred: 50, totalBytes: 100 });
      // Simulating finishing
      // setTimeout here is only for testing 'Uploading 50%',
      // if dont want to test 'Uploading 50%' then remove setTimeout and 'Uploading 50%' but keep progressCallback and completeCallback
      setTimeout(() => {
        progressCallback({ bytesTransferred: 100, totalBytes: 100 });
        completeCallback();
      }, 50);

      // Then call completion
      completeCallback();
    }),
    snapshot: { ref: "mockRef" },
  })),
  getDownloadURL: vi.fn().mockResolvedValue("test-url.jpg"),
}));

describe("Profile Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders current user data (avatar, username, email) correctly", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    // Check if the avatar is rendered
    const avatarImg = screen.getByAltText("profile");
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute("src", "avatar-link.jpg");

    // Check if username and email fields are rendered with defaultValue
    const usernameInput = screen.getByPlaceholderText("username");
    const emailInput = screen.getByPlaceholderText("email");

    expect(usernameInput).toHaveValue("testuser");
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("handles user updates successfully and shows success message", async () => {
    // Mocking a successful update response
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        username: "updatedUser",
        email: "updated@example.com",
        avatar: "updated-avatar-link.jpg",
      },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    // Changing username
    const usernameInput = screen.getByPlaceholderText("username");
    fireEvent.change(usernameInput, { target: { value: "updatedUser" } });

    const updateButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(updateButton);

    // Waiting for success message to appear
    await waitFor(() =>
      expect(
        screen.getByText("User is updated successfully!")
      ).toBeInTheDocument()
    );

    // Checking that axios was called with the right endpoint
    expect(axios.post).toHaveBeenCalledWith(
      "/server/user/update/test-user-id",
      expect.objectContaining({ username: "updatedUser" })
    );
  });

  it("displays error message when update fails", async () => {
    // Mocking a failed update response
    axios.post.mockRejectedValueOnce({
      response: {
        data: { message: "Update failed from server" },
      },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    // Clicking Update
    const updateButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(updateButton);

    // Waiting for error message
    await waitFor(() =>
      expect(screen.getByText("Update failed from server")).toBeInTheDocument()
    );
  });

  it("handles user account deletion", async () => {
    // Mocking a successful delete response
    axios.delete.mockResolvedValueOnce({
      data: {
        success: true,
        message: "User has been deleted!",
      },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    // Clicking Delete account
    const deleteLink = screen.getByText("Delete account");
    fireEvent.click(deleteLink);

    // Waiting for the axios call to resolve
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        "/server/user/delete/test-user-id"
      );
    });
  });

  it("shows error if deleteUser returns success: false", async () => {
    // Making the delete request respond with success: false
    axios.delete.mockResolvedValueOnce({
      data: {
        success: false,
        message: "Could not delete user.",
      },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    // Clicking "Delete account"
    fireEvent.click(screen.getByText("Delete account"));

    await waitFor(() => {
      expect(screen.getByText("Could not delete user.")).toBeInTheDocument();
    });
  });

  it("shows an error message if user deletion fails (catch block)", async () => {
    // Mocking a failed delete response in the catch block
    axios.delete.mockRejectedValueOnce({
      response: {
        data: {
          message: "Server error during deletion",
        },
      },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    // Clicking "Delete account"
    const deleteLink = screen.getByText("Delete account");
    fireEvent.click(deleteLink);

    // Waiting for the error message to appear in the UI
    await waitFor(() => {
      expect(
        screen.getByText("Server error during deletion")
      ).toBeInTheDocument();
    });

    // (Optional) Verify axios was called with the correct endpoint
    expect(axios.delete).toHaveBeenCalledWith(
      "/server/user/delete/test-user-id"
    );
  });

  it("handles user sign out", async () => {
    // Mocking a successful sign-out response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Signed out",
      },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    // Clicking sign out
    const signOutLink = screen.getByText("Sign out");
    fireEvent.click(signOutLink);

    // Checking axios call
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/server/auth/signout");
    });
  });

  it("displays Show Listings button", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("Show Listings")).toBeInTheDocument();
  });

  it("fetches and displays user listings on 'Show Listings' click", async () => {
    // our random listings data
    const mockListings = [
      {
        _id: "listing1",
        name: "Cozy Apartment",
        imageUrls: ["apartment-image.jpg"],
      },
      {
        _id: "listing2",
        name: "Beach House",
        imageUrls: ["beach-house-image.jpg"],
      },
      {
        _id: "listing3",
        name: "Mountain Cabin",
        imageUrls: ["cabin-image.jpg"],
      },
    ];

    // Mocking successful API response
    axios.get.mockResolvedValueOnce({ data: mockListings });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    // Clicking the Show Listings button
    const showListingsButton = screen.getByText("Show Listings");
    fireEvent.click(showListingsButton);

    // Waiting for listings to appear
    await waitFor(() => {
      expect(screen.getByText("Your Listings")).toBeInTheDocument();
    });

    // Verify all listings are displayed
    expect(screen.getByText("Cozy Apartment")).toBeInTheDocument();
    expect(screen.getByText("Beach House")).toBeInTheDocument();
    expect(screen.getByText("Mountain Cabin")).toBeInTheDocument();

    // Verifying images are rendered
    const listingImages = screen.getAllByAltText("listing cover");
    expect(listingImages).toHaveLength(3);

    // Verifying Edit and Delete buttons for each listing
    const editButtons = screen.getAllByText("Edit");
    const deleteButtons = screen.getAllByText("Delete");
    expect(editButtons).toHaveLength(3);
    expect(deleteButtons).toHaveLength(3);
  });

  it("handles error when fetching listings fails", async () => {
    // Mocking a failed listings response
    axios.get.mockRejectedValueOnce(new Error("Failed to fetch listings"));

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    const showListingsButton = screen.getByText("Show Listings");
    fireEvent.click(showListingsButton);

    // Waiting for error message
    await waitFor(() => {
      expect(screen.getByText("Error showing listings")).toBeInTheDocument();
    });
  });

  it("handles successful listing deletion", async () => {
    const mockListing = {
      _id: "listing1",
      name: "Cozy Apartment",
      imageUrls: ["apartment-image.jpg"],
    };

    // Mocking API calls
    axios.get.mockResolvedValueOnce({ data: [mockListing] });
    axios.delete.mockResolvedValueOnce({ data: { success: true } });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    // Show listings
    const showListingsButton = screen.getByText("Show Listings");
    fireEvent.click(showListingsButton);

    // Waiting for listing to appear and verify presence
    const listingName = await screen.findByText("Cozy Apartment");
    expect(listingName).toBeInTheDocument();

    // Deleting listing
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    // Verifying API call
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        "/server/listing/delete/listing1"
      );
    });

    // Verifying listing is removed from UI
    await waitFor(() => {
      expect(screen.queryByText("Cozy Apartment")).not.toBeInTheDocument();
    });
  });

  it("handles file upload correctly", async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    const fileInput = screen.getByTestId("file-input");
    const file = new File(["test"], "test.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Uploading 50%")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByText("Image successfully uploaded!")
      ).toBeInTheDocument();
    });
  });

  it("shows an error message when file upload fails", async () => {
    //  For this test only, override the default mock with an error scenario.
    const { uploadBytesResumable } = await import("firebase/storage");
    uploadBytesResumable.mockImplementationOnce(() => ({
      on: vi.fn((event, progressCallback, errorCallback) => {
        errorCallback(new Error("Simulated upload error"));
      }),
      snapshot: { ref: "mockRef" },
    }));

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    // Triggering file selection
    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, {
      target: {
        files: [new File(["test"], "test.png", { type: "image/png" })],
      },
    });

    // After the error callback is triggered, the component should show the error text
    await waitFor(() => {
      expect(
        screen.getByText("Error Image upload (image must be less than 2 mb)")
      ).toBeInTheDocument();
    });
  });

  it("shows error if signOut returns success: false", async () => {
    // Making signout request respond with success: false
    axios.get.mockResolvedValueOnce({
      data: {
        success: false,
        message: "Could not sign out user.",
      },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    // Clicking "Sign out"
    fireEvent.click(screen.getByText("Sign out"));

    await waitFor(() => {
      expect(screen.getByText("Could not sign out user.")).toBeInTheDocument();
    });
  });

  it("shows an error if user update returns success: false", async () => {
    // Mocking the API to return a successful HTTP status but success: false in JSON
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: "Server says update not possible",
      },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );

    // Clicking the Update button to fire the submit
    const updateButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(updateButton);

    // Waiting for the error message to be displayed
    await waitFor(() => {
      expect(
        screen.getByText("Server says update not possible")
      ).toBeInTheDocument();
    });
  });
});
