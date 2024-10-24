import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "../components/Header";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

// Helper component to display current location for testing
const LocationDisplay = () => {
  const location = useLocation();
  return (
    <div data-testid="location-display">
      {location.pathname}
      {location.search}
    </div>
  );
};

const mockStore = configureStore([]);

describe("Header Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      user: {
        currentUser: null,
      },
    });
  });

  const renderWithProviders = (ui, { route = "/" } = {}) => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {ui}
          <Routes>
            <Route path="*" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  test("renders header with Sign in when no user is logged in", () => {
    renderWithProviders(<Header />);

    // Check for Brand
    expect(screen.getByText(/Walid/i)).toBeInTheDocument();
    expect(screen.getByText(/Estate/i)).toBeInTheDocument();
    // Check for navigation links
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();

    // Check for Sign in link
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();

    // Ensure profile image is not rendered
    const profileImage = screen.queryByAltText("profile");
    expect(profileImage).not.toBeInTheDocument();
  });
});
