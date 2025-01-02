import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Listing from "../pages/Listing";

// Mocking the modules
vi.mock("axios");

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

describe("Listing Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state", async () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {}));

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error state when API call fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Failed to fetch"));

    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Listing />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    });
  });
});
