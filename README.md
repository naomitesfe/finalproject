## TefTef — AI-Powered Business Launch Ecosystem
MERN Stack | AI-Assisted Business Idea Generator | Partner Matching | Supplier Packages | Property Listings | Real-Time Messaging

TefTef is an AI-powered business ecosystem designed to help entrepreneurs in emerging economies launch and scale businesses with smart guidance, low upfront risk, and access to partners, suppliers, properties, and investors — all in one platform.

🔗 Live Demo: 

## Features

- AI Business Advisor → Personalized business ideas, cost breakdowns, and step-by-step guidance.
- Partner Matching → Connects entrepreneurs with investors, suppliers, and realtors.
- Supplier Packages Marketplace → Ready-made startups bundles (e.g., poultry, coffee carts, retail kits).
- Property Listings → Workspaces, small shops, and rental listings for businesses.
- Role-Based Dashboards → For entrepreneurs, investors, suppliers, and realtors.
- Real-Time Messaging (Socket.io) → Chat and notifications.
- Secure Auth (JWT) → Login, signup, and protected routes.

## Tech Stack
# Frontend
- React + Vite
- React Router
- Context API (Auth)
- Axios
- Tailwind CSS

# Backend
- Node.js / Express
- MongoDB + Mongoose
- JWT Auth
- Socket.io
- Jest + Supertest for API testing

## Deployment

- Front-end: Vercel
- Backend: Render
- CI/CD via GitHub Actions

## Architecture Overview
Frontend (React)
    → AuthContext (JWT)
    → API Client (axios)
    → Pages: Dashboard, Marketplace, Ideas, Packages, Properties
    → Real-time Messaging

Backend (Express)
    → Auth (JWT)
    → Business Ideas API
    → Supplier Packages API
    → Properties API
    → Transactions API
    → Messaging (Socket.io)

Database (MongoDB)
    → Users, Profiles, BusinessIdeas, SupplierPackages, Properties, Transactions, Messages

## Database Models
# User
- email, passwordHash
- profile: name, role, industry, location, bio, rating
# BusinessIdea
- title, description, industry, steps, costEstimate
# SupplierPackage
- title, items, price, minimumOrder, estimatedCapital, supplierId
# Property
- type, rentPrice, location, size, realtorId
# Transaction
- buyerId, sellerId, itemId, status
# Message
- senderId, receiverId, text, timestamp

## API Endpoints
# Auth
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/whoami

# Business Ideas
- GET /api/business-ideas
- POST /api/business-ideas
- PUT /api/business-ideas/:id
- DELETE /api/business-ideas/:id

# Supplier Packages
- GET /api/packages
- POST /api/packages
- PUT /api/packages/:id
- DELETE /api/packages/:id

# Properties
- GET /api/properties
- POST /api/properties

# Messages / Notifications
- POST /api/messages
- GET /api/notifications

## Testing

- Backend tests use Jest + Supertest.

Run tests:
```bash
cd backend
npm test
```

- Frontend tests use Vitest + React Testing Library.

Run tests:
```bash
cd frontend
npm test
```
##  Setup Instructions
🔹 1. Clone Repository
```bash 
git clone https://github.com/PLP-MERN-Stack-Development/mern-final-project-naomitesfe.git
cd teftef
```
🔹 2. Backend Setup
```bash 
cd backend
npm install
cp .env.example .env
npm run dev
```

- Backend .env template
```bash 
MONGODB_URI=your_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```
🔹 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend .env
```bash
VITE_API_URL=https://your-backend-url.com
```

## Deployment
# Backend Deployment (Render)
- Create new service
- Add environment variables
- Set build command: npm install
- Set start command: npm start

# Frontend Deployment (Vercel)
- Connect repo
- Set environment variable VITE_API_URL to backend
- Deploy

## CI/CD with GitHub Actions

The project includes:
- Automatic test running
- Build validation
- PR CI checks

Workflow file located at:
.github/workflows/ci.yml

## License
MIT License

## Author
Nuhamin Tesfaye — Founder & Full-Stack Developer
📧 tesfayenuhamin@gmail.com
📞 +251 911 659 981
🔗 LinkedIn: https://www.linkedin.com/in/nuhamintesfaye/
💻 GitHub: https://github.com/naomitesfe