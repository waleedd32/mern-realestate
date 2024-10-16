import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

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
      }
    };

    fetchOfferListings();
  }, []);

  console.log("offerListings Home component", offerListings);
  console.log("rentListings Home component", rentListings);
  console.log("saleListings Home component", saleListings);

  return (
    <div>
      {/* top */}

      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">
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

      {/* listing results for offer, sale and rent */}
    </div>
  );
}

export default Home;
