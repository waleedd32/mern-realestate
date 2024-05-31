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
          <button className="text-white ml-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}

export default Header;
