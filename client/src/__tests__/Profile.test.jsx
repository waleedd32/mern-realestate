import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Profile from "../pages/Profile";

// Mocking axios
vi.mock("axios");

// Creating a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: (state = initialState) => state,
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
});
