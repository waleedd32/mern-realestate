import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "../pages/Home";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";

// Mocking axios
vi.mock("axios");

// Mock data
const mockOfferListings = [
  {
    _id: "1",
    imageUrls: ["https://example.com/image1.jpg"],
    offer: true,
    discountPrice: 250000,
    regularPrice: 300000,
    type: "offer",
    name: "Cozy Cottage",
    address: "123 Maple Street",
    description: "A cozy cottage with beautiful gardens.",
    bedrooms: 3,
    bathrooms: 2,
  },
  {
    _id: "2",
    imageUrls: ["https://example.com/image2.jpg"],
    offer: true,
    discountPrice: 450000,
    regularPrice: 500000,
    type: "offer",
    name: "Modern Apartment",
    address: "456 Oak Avenue",
    description: "A modern apartment in the city center.",
    bedrooms: 2,
    bathrooms: 1,
  },
];

const mockRentListings = [
  {
    _id: "3",
    imageUrls: ["https://example.com/image3.jpg"],
    offer: false,
    regularPrice: 1500,
    type: "rent",
    name: "Downtown Loft",
    address: "789 Pine Road",
    description: "A spacious loft in downtown.",
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    _id: "4",
    imageUrls: ["https://example.com/image4.jpg"],
    offer: false,
    regularPrice: 2000,
    type: "rent",
    name: "Suburban House",
    address: "321 Cedar Lane",
    description: "A beautiful house in the suburbs.",
    bedrooms: 4,
    bathrooms: 3,
  },
];

const mockSaleListings = [
  {
    _id: "5",
    imageUrls: ["https://example.com/image5.jpg"],
    offer: false,
    regularPrice: 350000,
    type: "sale",
    name: "Luxury Villa",
    address: "654 Birch Boulevard",
    description: "A luxury villa with stunning views.",
    bedrooms: 5,
    bathrooms: 4,
  },
  {
    _id: "6",
    imageUrls: ["https://example.com/image6.jpg"],
    offer: true,
    discountPrice: 275000,
    regularPrice: 300000,
    type: "sale",
    name: "Beachside Bungalow",
    address: "987 Palm Drive",
    description: "A charming bungalow by the beach.",
    bedrooms: 2,
    bathrooms: 2,
  },
];

// Error messages
const offerErrorMessage = "Failed to fetch offer listings";
const rentErrorMessage = "Failed to fetch rental listings";
const saleErrorMessage = "Failed to fetch sale listings";

describe("Home Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    axios.get.mockReset();
  });

  it("renders top section correctly", async () => {
    axios.get
      .mockResolvedValueOnce({ data: [] }) // Offer listings
      .mockResolvedValueOnce({ data: [] }) // Rent listings
      .mockResolvedValueOnce({ data: [] }); // Sale listings

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    //A regex allows anything (including newline characters, spaces, line breaks, or nested elements)) between "Find your next" and "place with ease".
    // Target the heading (h1)
    const heading = screen.getByRole("heading", {
      name: /find your next.*perfect.*place with ease/i,
    });
    expect(heading).toBeInTheDocument();

    // Verify the subtext
    const subtext = await screen.findByText(
      /Walid Estate is the best place to find your next perfect place to live/i
    );
    expect(subtext).toBeInTheDocument();

    // Verify the link
    const link = await screen.findByText(/Let's get started.../i);
    expect(link).toBeInTheDocument();
  });

  it("fetches and displays offer, rent listings", async () => {
    // Mocking axios responses in sequence
    axios.get
      .mockResolvedValueOnce({ data: mockOfferListings })
      .mockResolvedValueOnce({ data: mockRentListings })
      .mockResolvedValueOnce({ data: mockSaleListings });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Waiting for all Axios calls to be made
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/server/listing/get?offer=true&limit=4"
      );
      expect(axios.get).toHaveBeenCalledWith(
        "/server/listing/get?type=rent&limit=4"
      );
      expect(axios.get).toHaveBeenCalledWith(
        "/server/listing/get?type=sale&limit=4"
      );
    });

    // Retrieve all images with alt text matching /listing cover/i
    const images = await screen.findAllByAltText(/listing cover/i);

    // Total listings: 2 offer + 2 rent + 2 sale = 6
    expect(images).toHaveLength(6);

    // Extracting all expected image URLs
    const expectedImageUrls = [
      ...mockOfferListings.map((listing) => listing.imageUrls[0]),
      ...mockRentListings.map((listing) => listing.imageUrls[0]),
      ...mockSaleListings.map((listing) => listing.imageUrls[0]),
    ];

    // Verifying each image's src attribute is in the expected list
    images.forEach((image) => {
      expect(expectedImageUrls).toContain(image.getAttribute("src"));
    });
  });

  // Test Case 1: Error in fetchOfferListings
  it("displays error messages when fetching offer listings fails", async () => {
    // - First call (offer) fails
    // - Second and third calls (rent and sale) succeed
    axios.get
      .mockRejectedValueOnce({
        response: { data: { message: offerErrorMessage } },
      })
      .mockResolvedValueOnce({ data: mockRentListings })
      .mockResolvedValueOnce({ data: mockSaleListings });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Waiting for the Swiper error message
    const swiperError = await screen.findByTestId("offer-swiper-error");
    expect(swiperError).toBeInTheDocument();
    expect(swiperError).toHaveTextContent(offerErrorMessage);

    // Waiting for the Offer Listings section error message
    const offerSectionError = await screen.findByTestId("offer-section-error");
    expect(offerSectionError).toBeInTheDocument();
    expect(offerSectionError).toHaveTextContent(offerErrorMessage);
  });

  // Test Case 2: Error in fetchRentListings
  it("displays error message when fetching rent listings fails", async () => {
    // - First call (offer) succeeds
    // - Second call (rent) fails
    // - Third call (sale) succeeds
    axios.get
      .mockResolvedValueOnce({ data: mockOfferListings })
      .mockRejectedValueOnce({
        response: { data: { message: rentErrorMessage } },
      })
      .mockResolvedValueOnce({ data: mockSaleListings });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Waiting for the Rent Listings section error message
    const rentSectionError = await screen.findByTestId("rent-section-error");
    expect(rentSectionError).toBeInTheDocument();
    expect(rentSectionError).toHaveTextContent(rentErrorMessage);
  });

  // Test Case 3: Error in fetchSaleListings
  it("displays error message when fetching sale listings fails", async () => {
    // - First call (offer) succeeds
    // - Second call (rent) succeeds
    // - Third call (sale) fails
    axios.get
      .mockResolvedValueOnce({ data: mockOfferListings })
      .mockResolvedValueOnce({ data: mockRentListings })
      .mockRejectedValueOnce({
        response: { data: { message: saleErrorMessage } },
      });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Waiting for the Sale Listings section error message
    const saleSectionError = await screen.findByTestId("sale-section-error");
    expect(saleSectionError).toBeInTheDocument();
    expect(saleSectionError).toHaveTextContent(saleErrorMessage);
  });
});
