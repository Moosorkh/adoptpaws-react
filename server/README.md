# AdoptPaws Backend API

Backend server for the AdoptPaws pet adoption platform built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up PostgreSQL database:**
   - Create a new database named `adoptpaws_db`
   - Or use your existing PostgreSQL instance

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=adoptpaws_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   PORT=3001
   ```

4. **Run database migrations:**
   ```bash
   # Connect to your PostgreSQL database and run the schema
   psql -U postgres -d adoptpaws_db -f src/db/schema.sql
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3001`

## 📋 API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Products (Pets)
- `GET /api/products` - Get all products (with optional filters)
  - Query params: `?category=dogs&status=available`
- `GET /api/products/:id` - Get single product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## 🛠️ Development

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm start        # Start production server
```

## 📦 Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **node-pg** - PostgreSQL client
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-validator** - Request validation
