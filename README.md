# Upraised 
# Phoenix IMF Gadget API 🚀

This is my submission for the **Phoenix IMF Gadget API Challenge**. It is a fully functional and production-ready backend API built with modern technologies and best practices.

## 🔧 Tech Stack

- **Node.js** + **Express**
- **TypeScript**
- **PostgreSQL** + **Prisma ORM**
- **Redis** for caching
- **JWT** Authentication with **HTTP-only cookies**
- **Rate Limiting** using a middleware library
- **Postman** for API documentation

## 🔐 Key Features

- ✅ **Robust Authentication**  
  Secure login and session management using JWTs stored in HTTP-only cookies.

- ⚡ **Redis Caching**  
  Frequently accessed data is cached to reduce DB hits and boost performance.

- 🛡️ **Rate Limiting**  
  Protects endpoints from abuse using a rate-limiting middleware (not Redis-based).

- 📑 **Postman API Documentation**  
  All endpoints are documented with requests, responses, and error examples.

## 🌐 Live API

👉 [Live API Link](https://upraised-production.up.railway.app/health)  

## 📮 Postman Documentation

🧾 [Click here to view the full Postman documentation](https://documenter.getpostman.com/view/28016254/2sB2cUAhiM)  


## ⚙️ Getting Started

Follow the steps below to set up and run this project locally.

```bash
# Clone the repository from GitHub
git clone https://github.com/Tiru-99/Upraised

# Navigate into the server directory
cd server

# Install all project dependencies
npm install

# Start the development server
npm run dev

