# Supply Chain Management System (SCMS)

A comprehensive full-stack supply chain management platform that enables seamless coordination between suppliers, manufacturers, and warehouse managers. This system provides real-time inventory tracking, order management, analytics, and financial reporting across the entire supply chain ecosystem.

## Project Overview

The Supply Chain Management System is a modern, enterprise-grade application designed to streamline supply chain operations. It supports multiple user roles including suppliers, manufacturers, and warehouse managers, each with role-specific dashboards, analytics, and operational controls. The system tracks raw materials, finished products, orders, shipments, and provides comprehensive financial analytics.

**Key Purpose:** Centralize supply chain operations, improve visibility across all stakeholders, and enable data-driven decision-making through real-time analytics and reporting.

## Features

### Core Functionality
- **Multi-Role Authentication & Authorization**: JWT-based authentication with role-specific permissions for Suppliers, Manufacturers, and Warehouse Managers
- **Inventory Management**: Real-time tracking of raw materials and finished products across locations
- **Order Management**: Create, track, and manage orders across the supply chain with status updates
- **Shipment Tracking**: Monitor shipments from warehouse to final destination
- **Financial Analytics**: Revenue tracking, profit margins, and financial reporting
- **Notifications**: Real-time alerts for order updates, shipment status, and inventory levels
- **Analytics Dashboard**: Comprehensive metrics and KPIs for business insights
- **API Documentation**: Interactive Swagger/OpenAPI documentation for all endpoints
- **Automated Testing Suite**: Complete test coverage for all API endpoints and user roles

### Implemented Workflows
- Supplier order fulfillment and delivery workflow
- Manufacturer production and order processing workflow
- Warehouse inventory management and shipment coordination
- Financial settlement and reporting workflow
- Analytics aggregation and trend analysis

## Frameworks Used

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: CSS with PostCSS
- **UI Components**: Custom component library
- **State Management**: React Context API
- **Build Tool**: Next.js built-in

### Database & Infrastructure
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **Package Manager**: npm (Backend), pnpm (Frontend)

## Setup Steps

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Docker & Docker Compose (optional, for containerized setup)
- npm or pnpm package manager

### Step 1: Clone & Navigate to the Project

```bash
git clone <repository-url>
cd supply-chain-management-system
```

### Step 2: Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

#### 2.1 Environment Configuration

Create a `.env` file in the backend directory by duplicating `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file and configure your database credentials:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/scm_db?schema=public"

# JWT Configuration
JWT_SECRET="your_super_secret_jwt_key_here"

# Server Configuration
PORT=3000
NODE_ENV=development
```

#### 2.2 Install Backend Dependencies

```bash
npm install
```

#### 2.3 Database Setup

Generate Prisma Client:
```bash
npx prisma generate
```

Run database migrations:
```bash
npx prisma migrate dev
```

Seed the database with sample data:
```bash
npx prisma db seed
# or manually: node prisma/seed.js
```

> **Important**: When the seed script completes, **save the printed JWT tokens** somewhere secure—you'll need them for testing and API requests.

#### 2.4 Start the Backend Server

```bash
npm run dev
# Or manually: node src/config/app.js
```

The server will start on `http://localhost:3000`

### Step 3: Frontend Setup

In a new terminal, navigate to the frontend directory:

```bash
cd frontend
```

#### 3.1 Install Frontend Dependencies

```bash
pnpm install
# or: npm install
```

#### 3.2 Configure API Endpoints

Create or update the API configuration in the frontend `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### 3.3 Start the Development Server

```bash
pnpm dev
# or: npm run dev
```

The frontend will be available at `http://localhost:3000` (or the next available port)

### Step 4: Verify Installation

1. **Check Backend**: Navigate to [http://localhost:3000/api-docs](http://localhost:3000/api-docs) for Swagger documentation
2. **Check Frontend**: Navigate to the frontend URL shown in your terminal
3. **Test API**: Use the provided tokens from seeding to authenticate API requests

### Step 5: Automated Testing

Run the comprehensive API test suite:

```bash
cd backend/tests
node endpoints.js
```

The test script will:
- Validate all endpoints across all user roles
- Test CRUD operations with auto-generated IDs
- Verify authentication and authorization
- Report success/failure status for each route

**Note**: Before running tests, update the `TOKENS` object in `endpoints.js` with the JWT tokens from your database seed output.

## Project Structure

```
supply-chain-management-system/
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── config/          # App and database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth and other middleware
│   │   └── lib/             # Utility functions
│   ├── prisma/              # Database schema and migrations
│   ├── tests/               # Automated test suite
│   └── package.json
│
├── frontend/                # Next.js React application
│   ├── app/                 # Next.js app directory
│   │   ├── supplier/        # Supplier pages and dashboards
│   │   ├── warehouse/       # Warehouse pages and dashboards
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   └── ui/              # Reusable UI components
│   ├── lib/                 # Utilities and API helpers
│   └── package.json
│
└── postman/                 # API collection and environment files
```

## API Documentation

Once the backend server is running, comprehensive API documentation is available at:

**[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

This interactive Swagger UI allows you to:
- Explore all available endpoints
- View request/response schemas
- Test API calls directly from your browser
- Authenticate with JWT tokens

## Automated Testing

The project includes an intelligent, automated testing script (`endpoints.js`) that runs through every endpoint across all user roles to ensure the system is functioning correctly.

### Running Tests

1. **Prepare Your Tokens**: Open `backend/tests/endpoints.js` and paste the JWT tokens from your database seed output into the `TOKENS` configuration object.

2. **Start the Test Suite** (with server running in another terminal):

```bash
cd backend/tests
node endpoints.js
```

The test script will:
- Execute all endpoints for each user role (Supplier, Manufacturer, Warehouse Manager)
- Automatically chain requests (using generated IDs between requests)
- Provide color-coded output for success/failure
- Validate both happy paths and error scenarios

## API Endpoints Overview

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

### Supplier Endpoints
- `GET/POST /api/supplier/materials` - Manage raw materials
- `GET/POST /api/supplier/orders` - Manage orders
- `GET /api/supplier/analytics` - Supplier analytics

### Manufacturer Endpoints
- `GET/POST /api/manufacturer/products` - Manage products
- `GET/POST /api/manufacturer/orders` - Process orders
- `GET /api/manufacturer/analytics` - Manufacturing analytics

### Warehouse Endpoints
- `GET/POST /api/warehouse/inventory` - Manage inventory
- `GET/POST /api/warehouse/orders` - Process orders
- `GET/POST /api/warehouse/shipments` - Track shipments
- `GET /api/warehouse/analytics` - Warehouse analytics

### Shared Endpoints
- `GET /api/notifications` - Retrieve notifications
- `GET /api/analytics` - Cross-functional analytics

## Team Contributions

This project was developed by a dedicated team, each member contributing specialized expertise:

### Team Member Roles & Responsibilities

| Member | Role | Key Contributions |
|--------|------|-------------------|
| **Hamna & Namrah** | Project Lead & Full-Stack Developer | Project architecture, backend API design, Prisma schema design, authentication system, database migrations, API route implementation |
| **[Hamna]** | Frontend Lead | Next.js application setup, UI component library, supplier dashboard, warehouse dashboard, responsive design |
| **[Hamna, Namrah & Abdullah]** | Database & Backend Specialists | PostgreSQL optimization, Prisma ORM implementation, seed data generation, database performance tuning |
| **[Abdullah]** | Testing & QA | Automated test suite development, API endpoint testing, test coverage analysis, bug identification |

### Contribution Summary

- **Backend Development**: RESTful API implementation, business logic, database operations
- **Frontend Development**: User interfaces, real-time dashboards, component library
- **Database Design**: Schema architecture, migrations, seed data, performance optimization
- **Testing & QA**: Comprehensive test coverage, endpoint validation, quality assurance
- **Documentation**: API documentation, setup guides, code comments

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

**Database Connection Error**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env` matches your PostgreSQL credentials
- Ensure the database exists

**JWT Token Errors**
- Regenerate tokens by running `npx prisma db seed` again
- Ensure JWT_SECRET in `.env` is consistent
- Check token expiration

**Frontend Cannot Connect to Backend**
- Verify backend server is running on port 3000
- Check NEXT_PUBLIC_API_URL in frontend `.env.local`
- Ensure CORS is properly configured on backend

## Development Guidelines

- Follow existing code structure and naming conventions
- Use TypeScript for type safety in new code
- Add tests for new API endpoints
- Keep components modular and reusable
- Document complex business logic with comments
- Use Prisma migrations for any database schema changes

## Future Enhancements

- Real-time notifications using WebSockets
- Advanced reporting and export functionality
- Machine learning for demand forecasting
- Integration with payment gateways
- Mobile application support
- Enhanced analytics with visualization
- Role-based access control (RBAC) refinements

## License

This project is part of the Web-Based Application Development (WBAD) course - Semester 6 coursework.

## Support & Contact

For questions or issues, please refer to the project documentation or contact the development team through the university's project management system.

---

**Last Updated**: May 2026  
**Version**: 1.0.0
