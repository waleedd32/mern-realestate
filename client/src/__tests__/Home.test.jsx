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

describe("Home Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    axios.get.mockReset();
  });

  it("renders top section correctly", () => {
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
    expect(
      screen.getByText(
        /Walid Estate is the best place to find your next perfect place to live/i
      )
    ).toBeInTheDocument();

    // Verify the link
    expect(screen.getByText(/Let's get started.../i)).toBeInTheDocument();
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
    });

    // Retrieve all images with alt text matching /listing cover/i
    const images = await screen.findAllByAltText(/listing cover/i);

    // Total listings: 2 offer + 2 rent + 2 sale = 6
    expect(images).toHaveLength(6);

    // Extract all expected image URLs
    const expectedImageUrls = [
      ...mockOfferListings.map((listing) => listing.imageUrls[0]),
      ...mockRentListings.map((listing) => listing.imageUrls[0]),
      ...mockSaleListings.map((listing) => listing.imageUrls[0]),
    ];

    // Verify each image's src attribute is in the expected list
    images.forEach((image) => {
      expect(expectedImageUrls).toContain(image.getAttribute("src"));
    });
  });
});
