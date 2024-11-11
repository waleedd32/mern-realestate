import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import SwiperCore from "swiper";
import "swiper/css/bundle";
import ListingItem from "../components/ListingItem";

function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

  const [isOfferLoading, setIsOfferLoading] = useState(true);
  const [isRentLoading, setIsRentLoading] = useState(true);
  const [isSaleLoading, setIsSaleLoading] = useState(true);

  const [offerError, setOfferError] = useState(null);
  const [rentError, setRentError] = useState(null);
  const [saleError, setSaleError] = useState(null);

  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const response = await axios.get(
          "/server/listing/get?offer=true&limit=4"
        );
        // Alternative approach using `params`:
        // const response= await axios.get("/server/listing/get", {
        //   params: { offer: true, limit: 4 },
        //   withCredentials: true,
        // });

        setOfferListings(response.data);
      } catch (error) {
        setOfferError(
          error.response?.data?.message || "Failed to fetch offer listings"
        );
        console.error("Offer listings error:", error);
        console.error(
          "Offer listings error message:",
          error.response?.data?.message
        );
      } finally {
        setIsOfferLoading(false);
      }
    };

    const fetchRentListings = async () => {
      try {
        const response = await axios.get(
          "/server/listing/get?type=rent&limit=4"
        );
        setRentListings(response.data);
      } catch (error) {
        setRentError(
          error.response?.data?.message || "Failed to fetch rental listings"
        );
        console.error("Rent listings error:", error);
        console.error(
          "Rent listings error message:",
          error.response?.data?.message
        );
      } finally {
        setIsRentLoading(false);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const response = await axios.get(
          "/server/listing/get?type=sale&limit=4"
        );
        setSaleListings(response.data);
      } catch (error) {
        setSaleError(
          error.response?.data?.message || "Failed to fetch sale listings"
        );
        console.error("Sale listings error:", error);
        console.error(
          "Sale listings error message:",
          error.response?.data?.message
        );
      } finally {
        setIsSaleLoading(false);
      }
    };

    fetchOfferListings();
    fetchRentListings();
    fetchSaleListings();
  }, []);

  // Error Alert Component
  const ErrorAlert = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      <span className="block sm:inline">{message}</span>
    </div>
  );

  console.log("offerListings Home component", offerListings);
  console.log("rentListings Home component", rentListings);
  console.log("saleListings Home component", saleListings);

  const SwiperSkeleton = () => (
    <div className="skeleton-loader">
      <div className="skeleton-row" style={{ height: "500px" }}></div>
    </div>
  );

  const ListingSkeleton = () => (
    <div className="w-full sm:w-[330px]">
      <div className="skeleton-loader">
        <div className="skeleton-row" style={{ height: "320px" }}></div>
        <div
          className="skeleton-row"
          style={{ height: "24px", width: "75%" }}
        ></div>
        <div
          className="skeleton-row"
          style={{ height: "16px", width: "50%" }}
        ></div>
        <div
          className="skeleton-row"
          style={{ height: "16px", width: "66%" }}
        ></div>
      </div>
    </div>
  );

  return (
    <div>
      {/* top */}
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto">
        <h1
          data-testid="home-heading"
          className="text-slate-700 font-bold text-3xl lg:text-6xl"
        >
          Find your next <span className="text-slate-500">perfect</span>
          <br />
          place with ease
        </h1>
        <div className="text-gray-400 text-xs sm:text-sm">
          Walid Estate is the best place to find your next perfect place to
          live.
          <br />
          We have a wide range of properties for you to choose from.
        </div>
        <Link
          to={"/search"}
          className="text-xs sm:text-sm text-blue-800 font-bold hover:underline"
        >
          Let's get started...
        </Link>
      </div>

      {/* Swiper Section */}
      <Swiper navigation>
        {isOfferLoading ? (
          <SwiperSlide>
            <SwiperSkeleton />
          </SwiperSlide>
        ) : offerError ? (
          <SwiperSlide>
            <ErrorAlert message={offerError} />
          </SwiperSlide>
        ) : offerListings && offerListings.length > 0 ? (
          offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div
                style={{
                  background: `url(${listing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: "cover",
                }}
                className="h-[500px]"
              ></div>
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <div className="text-center text-gray-500">
              No offer listings available.
            </div>
          </SwiperSlide>
        )}
      </Swiper>

      {/* Listing Results for Offer, Rent, and Sale */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {/* Offer Listings Section */}
        <div>
          <div className="my-3 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-600">
              Recent Offers
            </h2>
            <Link
              className="text-sm text-blue-800 hover:underline"
              to={"/search?offer=true"}
            >
              Show more offers
            </Link>
          </div>
          {isOfferLoading ? (
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4].map((item) => (
                <ListingSkeleton key={item} />
              ))}
            </div>
          ) : offerError ? (
            <ErrorAlert message={offerError} />
          ) : offerListings && offerListings.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No offer listings available.
            </div>
          )}
        </div>

        {/* Rent Listings Section */}
        <div>
          <div className="my-3 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-600">
              Recent Places for Rent
            </h2>
            <Link
              className="text-sm text-blue-800 hover:underline"
              to={"/search?type=rent"}
            >
              Show more places for rent
            </Link>
          </div>
          {isRentLoading ? (
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4].map((item) => (
                <ListingSkeleton key={item} />
              ))}
            </div>
          ) : rentError ? (
            <ErrorAlert message={rentError} />
          ) : rentListings && rentListings.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No rent listings available.
            </div>
          )}
        </div>

        {/* Sale Listings Section */}
        <div>
          <div className="my-3 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-600">
              Recent Places for Sale
            </h2>
            <Link
              className="text-sm text-blue-800 hover:underline"
              to={"/search?type=sale"}
            >
              Show more places for sale
            </Link>
          </div>
          {isSaleLoading ? (
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4].map((item) => (
                <ListingSkeleton key={item} />
              ))}
            </div>
          ) : saleError ? (
            <ErrorAlert message={saleError} />
          ) : saleListings && saleListings.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No sale listings available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
