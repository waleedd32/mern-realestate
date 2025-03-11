import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../redux/user/userSlice";

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";
import App from "../App";

describe("App Routing", () => {
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

  it("renders Home page on default route (/)", async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
    // By default, the route is "/", so Home should render
    expect(await screen.findByTestId("home-heading")).toBeInTheDocument();
  });
});
