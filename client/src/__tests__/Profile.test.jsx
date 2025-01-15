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
});
