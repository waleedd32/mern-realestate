import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      {/* top */}

      <div>
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">
          Find your next <span className="text-slate-500">perfect</span>
          <br />
          place with ease
        </h1>
        <div>
          Walid Estate is the best place to find your next perfect place to
          live.
          <br />
          We have a wide range of properties for you to choose from.
        </div>
        <Link to={"/search"}>Let's get started...</Link>
      </div>

      {/* swiper */}

      {/* listing results for offer, sale and rent */}
    </div>
  );
}

export default Home;
