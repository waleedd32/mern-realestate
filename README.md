# MERN Real Estate Application

A full-stack real estate application built with React (using Vite) for the client and Node/Express for the server, connected to a MongoDB database. This project demonstrates how to manage property listings, user authentication, a smooth user experience via Loading Skeletons, and a simple workflow for browsing and searching real estate properties.

## Table of Contents

- Overview
- Features
- Tech Stack
- Installation
- Usage
- Testing & Coverage

## Overview

This repository contains two main folders:

1. client: Front-end React application using Vite, Tailwind CSS, and Redux for state management.
2. server: Back-end Express server with Mongoose for MongoDB integration, and JSON Web Tokens (JWT) for authentication.

The application allows users to sign up, log in, create or view real estate listings, and search for properties based on various criteria (e.g., location, price).

## Features

- User Authentication: Secure sign-up, log-in, and log-out using JWT.
- Property Listings: Add, edit, and delete property listings with images and details.
- Search and Filter: Quickly find properties based on location, price, or property type.
- Responsive Design: Tailwind CSS makes it simple to create a fully responsive layout.
- Loading Skeleton: Offers a smooth user experience by displaying placeholder elements while data is being fetched, reducing perceived load times.
- Redux State Management: Centralized, predictable state management in the front end.

## Tech Stack

### Front End (client)

- Framework: React v19 with Vite
- State Management: Redux Toolkit & React Redux
- Routing: React Router DOM v6
- Styling: Tailwind CSS
- HTTP Client: Axios

### Back End (server)

- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB via Mongoose
- Authentication: bcryptjs for password hashing & jsonwebtoken for JWT-based auth
- Environment Variables: dotenv
- Others: cookie-parser, cors, nodemon for development
