import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import SignIn from "../pages/SignIn";
import userReducer from "../redux/user/userSlice";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import userEvent from "@testing-library/user-event";

// Mocking the OAuth component
vi.mock("../components/OAuth", () => ({
  default: () => <button>Mock OAuth</button>,
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
        currentUser: null,
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

describe("SignIn Component", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it("renders the sign-in form correctly", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SignIn />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByPlaceholderText("email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("submits the form successfully and navigates to home page", async () => {
    const store = createMockStore();

    // Mock a successful API response for user sign-in
    axios.post.mockResolvedValue({
      data: {
        success: true,
        username: "testuser",
        email: "test@example.com",
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SignIn />
        </BrowserRouter>
      </Provider>
    );

    // Fill the form
    await userEvent.type(
      screen.getByPlaceholderText("email"),
      "test@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("password"),
      "password123"
    );

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Assert that the button shows loading state
    expect(screen.getByRole("button", { name: /loading.../i })).toBeDisabled();

    // Waiting for the API call and navigation
    await waitFor(() => {
      // Verifying the correct API endpoint and data are called
      expect(axios.post).toHaveBeenCalledWith("/server/auth/signin", {
        email: "test@example.com",
        password: "password123",
      });

      // Verifying that the navigation to the home page occurs
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    // Ensure loading is false and no error is shown
    expect(screen.getByRole("button", { name: /sign in/i })).not.toBeDisabled();
    expect(
      screen.queryByText(/./, { selector: ".text-red-500" })
    ).not.toBeInTheDocument();
  });

  it('renders "Dont have an account?" text and "Sign in" link correctly', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SignIn />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/dont have an account\?/i)).toBeInTheDocument();

    // Checking for the presence of the "Sign in" link
    const signUpLink = screen.getByRole("link", { name: /sign in/i });
    expect(signUpLink).toBeInTheDocument();

    // Confirm that the link navigates to "/sign-up"
    expect(signUpLink).toHaveAttribute("href", "/sign-up");
  });
});
