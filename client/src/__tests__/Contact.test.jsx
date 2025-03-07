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
});
