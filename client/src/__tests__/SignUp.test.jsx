import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUp from "../pages/SignUp";
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

describe("SignUp Component", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it("renders the sign-up form correctly", () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText("username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("submits the form successfully and navigates to sign-in", async () => {
    // Mock a successful API response for user registration
    axios.post.mockResolvedValue({
      data: {
        success: true,
        message: "User created successfully",
      },
    });

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    // Fill the form
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(
      screen.getByPlaceholderText("email"),
      "test@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("password"),
      "password123"
    );

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    // Assert that the button shows loading state
    expect(screen.getByRole("button", { name: /loading.../i })).toBeDisabled();

    // Waiting for the API call and navigation
    await waitFor(() => {
      // Verifying  the correct API endpoint and data are called
      expect(axios.post).toHaveBeenCalledWith("/server/auth/signup", {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      // Verifying that the navigation to the sign-in page occurs
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in");
    });

    // Ensure loading is false and no error is shown
    expect(screen.getByRole("button", { name: /sign up/i })).not.toBeDisabled();
    expect(
      screen.queryByText(/./, { selector: ".text-red-500" })
    ).not.toBeInTheDocument();
  });

  it('renders "Have an account?" text and "Sign in" link correctly', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(screen.getByText(/have an account\?/i)).toBeInTheDocument();

    // Checking for the presence of the "Sign in" link
    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();

    // Confirm that the link navigates to "/sign-in"
    expect(signInLink).toHaveAttribute("href", "/sign-in");
  });

  it("displays an error message when API returns an error", async () => {
    // Mock an API error response
    axios.post.mockRejectedValue({
      response: {
        data: {
          message: "Network error. Please try again later.",
        },
      },
    });

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(
      screen.getByPlaceholderText("email"),
      "existing@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("password"),
      "password123"
    );

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    // Assert that the button shows loading state
    expect(screen.getByRole("button", { name: /loading.../i })).toBeDisabled();

    // Waiting for the API call and error handling
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/server/auth/signup", {
        username: "testuser",
        email: "existing@example.com",
        password: "password123",
      });

      // Verifying that the error message is displayed
      expect(
        screen.getByText("Network error. Please try again later.")
      ).toBeInTheDocument();
    });

    // Ensuring loading is false and error is shown
    expect(screen.getByRole("button", { name: /sign up/i })).not.toBeDisabled();
  });

  it("displays an error message when API returns success: false", async () => {
    // Mock an API response with success: false
    axios.post.mockResolvedValue({
      data: {
        success: false,
        message: "Email already exists.",
      },
    });

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    // Fill the form
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(
      screen.getByPlaceholderText("email"),
      "existing@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("password"),
      "password123"
    );

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    // Assert that the button shows loading state
    expect(screen.getByRole("button", { name: /loading.../i })).toBeDisabled();

    // Waiting for the API call and error handling
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/server/auth/signup", {
        username: "testuser",
        email: "existing@example.com",
        password: "password123",
      });

      // Verifying that the error message is displayed
      expect(screen.getByText("Email already exists.")).toBeInTheDocument();

      // Ensuring that navigate was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    // Ensuring loading is false and error is shown
    expect(screen.getByRole("button", { name: /sign up/i })).not.toBeDisabled();
    expect(screen.getByText("Email already exists.")).toBeInTheDocument();
  });
});
