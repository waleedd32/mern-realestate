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
  const [isLoading, setIsLoading] = useState(true);

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
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRentListings = async () => {
      try {
        const response = await axios.get(
          "/server/listing/get?type=rent&limit=4"
        );
        setRentListings(response.data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const response = await axios.get(
          "/server/listing/get?type=sale&limit=4"
        );
        setSaleListings(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfferListings();
  }, []);

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

  const ListingsSectionSkeleton = () => (
    <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
      <div>
        <div className="my-3">
          <div className="skeleton-loader">
            <div
              className="skeleton-row"
              style={{ height: "32px", width: "200px" }}
            ></div>
            <div
              className="skeleton-row"
              style={{ height: "16px", width: "150px" }}
            ></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {/* Render 4 skeleton placeholders to match API fetch limit (limit=4) */}
          {[1, 2, 3, 4].map((item) => (
            <ListingSkeleton key={item} />
          ))}
        </div>
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

      {/* swiper */}
      <Swiper navigation>
        {isLoading ? (
          <SwiperSlide>
            <SwiperSkeleton />
          </SwiperSlide>
        ) : (
          offerListings &&
          offerListings.length > 0 &&
          offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div
                style={{
                  background: `url(${listing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: "cover",
                }}
                className="h-[500px]"
                key={listing._id}
              ></div>
            </SwiperSlide>
          ))
        )}
      </Swiper>
      {/* listing results for offer, sale and rent */}
      {isLoading ? (
        <ListingsSectionSkeleton />
      ) : (
        <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
          {offerListings && offerListings.length > 0 && (
            <div className="">
              <div className="my-3">
                <h2 className="text-2xl font-semibold text-slate-600">
                  Recent offers
                </h2>
                <Link
                  className="text-sm text-blue-800 hover:underline"
                  to={"/search?offer=true"}
                >
                  Show more offers
                </Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {offerListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )}
          {rentListings && rentListings.length > 0 && (
            <div className="">
              <div className="my-3">
                <h2 className="text-2xl font-semibold text-slate-600">
                  Recent places for rent
                </h2>
                <Link
                  className="text-sm text-blue-800 hover:underline"
                  to={"/search?type=rent"}
                >
                  Show more places for rent
                </Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {rentListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )}
          {saleListings && saleListings.length > 0 && (
            <div className="">
              <div className="my-3">
                <h2 className="text-2xl font-semibold text-slate-600">
                  Recent places for sale
                </h2>
                <Link
                  className="text-sm text-blue-800 hover:underline"
                  to={"/search?type=sale"}
                >
                  Show more places for sale
                </Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {saleListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
