# Supply Chain Management (SCM) API

A complete REST API for managing a multi-role supply chain, including Suppliers, Manufacturers and Warehouse Manager. Built with Node.js, Express, PostgreSQL, and Prisma.

##  Getting Started

Follow these steps to get your local development environment up and running.

### 1\. Environment Setup

First, you need to configure your environment variables so the application can connect to your database and sign JWT tokens.

1.  Locate the `.env.example` file in the root of your project.
2.  Duplicate this file and rename the copy to `.env`.
3.  Open the new `.env` file and fill in your specific credentials:

<!-- end list -->

```env
# Example .env configuration
DATABASE_URL="postgresql://username:password@localhost:5432/scm_db?schema=public"
JWT_SECRET="your_super_secret_jwt_key_here"
PORT=3000
```

### 2\. Install Dependencies

Install the required Node packages:

```bash
npm install
```

### 3\. Database Setup (Generate, Migrate, Seed)

Prisma acts as the ORM for this project. To set up your database structure and populate it with dummy data, run the following commands in order:

**A. Generate the Prisma Client:**
Creates the tailored TypeScript/JavaScript client based on your `schema.prisma` file.

```bash
npx prisma generate
```

**B. Migrate the Database:**
Applies the schema to your PostgreSQL database. (If you have an existing database that is out of sync, use `npx prisma migrate reset` instead to wipe it and start fresh).

```bash
npx prisma migrate dev
```

**C. Seed the Database:**
Populates the database with users, raw materials, products, orders, shipments, and analytics.

```bash
npx prisma db seed
# Or run manually: node prisma/seed.js
```

> **Important:** When the seed script finishes, it will print out a list of **JWT Tokens** in your console. Leave your terminal open or copy these tokens somewhere safe—you will need them for testing\!

### 4\. Running the Server

Start the Express development server:

```bash
npm run dev
# Or run manually: node src/config/app.js
```

The server should now be running locally, typically on `http://localhost:3000`.

### 5\. API Documentation (Swagger)

This project includes fully interactive Swagger documentation. Once your server is running, you can explore every endpoint, view expected request bodies, and test routes directly in your browser.

Navigate to:
 **[http://localhost:3000/api-docs](https://www.google.com/search?q=http://localhost:3000/api-docs)**

-----

##  Automated Testing

The project includes an intelligent, automated testing script (`endpoints.js`) that runs through every endpoint across all user roles to ensure the system is functioning correctly.

### Step 1: Inject Your Tokens

Open `endpoints.js` in your code editor. At the very top of the file, you will find a `TOKENS` configuration object. Paste the JWT tokens that were printed in your terminal during the database seeding step:

```javascript
// Inside endpoints.js
const TOKENS = {
  supplier: 'eyJhbGciOiJIUzI1NiIsInR...',      // Paste Ahmed Karimi's token
  manufacturer: 'eyJhbGciOiJIUzI1NiIsInR...',  // Paste Zain Mfg's token
  warehouse: 'eyJhbGciOiJIUzI1NiIsInR...',     // Paste Imran Warehouse's token
  analytics: 'eyJhbGciOiJIUzI1NiIsInR...',     // Paste ANY valid token here
};
```

### Step 2: Run the Test Suite

With your server running in one terminal window, open a second terminal window and run the test script (make sure you are inside the tests folder):

```bash
node endpoints.js
```

The script will automatically simulate all API traffic, intelligently passing generated UUIDs (like `order_id` and `product_id`) between `GET`, `POST`, `PUT`, and `DELETE` requests to ensure zero 404 errors. You will see a color-coded output indicating the success or failure of each route.
