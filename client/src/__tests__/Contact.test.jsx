import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Contact from "../components/Contact";

vi.mock("axios");

describe("Contact Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the message state as the user types", async () => {
    axios.get.mockResolvedValueOnce({
      data: { username: "Jane", email: "jane@example.com" },
    });

    const listing = { userRef: "456", name: "Another Listing" };

    render(
      <BrowserRouter>
        <Contact listing={listing} />
      </BrowserRouter>
    );

    // Waiting for the form to appear
    await waitFor(() => {
      expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    });

    // writing into textarea
    const textarea = screen.getByTestId("message-input");
    fireEvent.change(textarea, { target: { value: "Hello Jane!" } });
    expect(textarea.value).toBe("Hello Jane!");
  });

  it("displays an ErrorAlert when there's an error fetching landlord data", async () => {
    // Mock the GET request to reject with an error
    axios.get.mockRejectedValueOnce({
      response: { data: { message: "Failed to fetch landlord" } },
    });

    render(
      <BrowserRouter>
        <Contact listing={{ userRef: "123", name: "Test Listing" }} />
      </BrowserRouter>
    );

    // Wait for the error alert to appear in the DOM
    await waitFor(() => {
      expect(screen.getByTestId("error-alert")).toBeInTheDocument();
    });

    // Check the error message text
    expect(screen.getByTestId("error-alert-message")).toHaveTextContent(
      "Failed to fetch landlord"
    );
  });
});
