````markdown
# Ecommerce Project

This project has a **React frontend (converted to TypeScript)** (`ecommerce-project`) and a **Node.js backend** (`ecommerce-backend`). Follow these steps to run it locally.

---

## Prerequisites

- Node.js and npm installed
- Both frontend and backend folders available

---

## Run the Backend

1. Go to the backend folder:
   ```bash
   cd ecommerce-backend
````

2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the backend server:

   ```bash
   node server.js
   ```
4. Backend usually runs on `http://localhost:5000`.

---

## Run the Frontend

1. Go to the frontend folder:

   ```bash
   cd ../ecommerce-project
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the development server:

   ```bash
   npm run dev
   ```
4. Open the URL printed in the terminal (usually `http://localhost:5173`).

---

## Notes

* The frontend is written in TypeScript, but type checking may not be fully implemented.
* Make sure the backend is running first, otherwise the frontend cannot fetch product data.
* Some features (like search) may not be fully functional yet.

---
## Acknowledgments

This project was developed based on the tutorials provided by [SuperSimpleDiv](https://www.youtube.com/@SuperSimpleDev).Their tutorials on building a React ecommerce project were instrumental in creating this project.
