import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-blue-800 text-white shadow-lg">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate">Walid</span>
            <span className="text-slate-700">Estate</span>
          </h1>
        </Link>
        <form className="bg-white bg-opacity-20 backdrop-blur-md p-2 rounded-full flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none text-white placeholder-white p-2 w-24 sm:w-64 md:w-96 "
          />
        </form>
      </div>
    </header>
  );
}

export default Header;
