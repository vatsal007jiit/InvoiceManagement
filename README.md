# Secure Invoice Management System

A secure, fintech-grade invoice management application built with Next.js 15, demonstrating expertise in SSR, ISR, API routes, authentication, state management, security, and best practices.

## Features

### Core Functionality
- **JWT-based Authentication** with HTTP-only cookies
- **Role-based Access Control** (Admin vs Accountant)
- **Invoice Management** - Create, view, and manage invoices
- **Real-time Dashboard** with pagination and filtering
- **PDF Export** functionality (mock implementation)
- **Responsive Design** optimized for all devices
- **Optimized Hydration** with proper client-side mounting

### Security Features
- **JWT Authentication** with secure HTTP-only cookies
- **Input Sanitization** to prevent XSS attacks
- **Rate Limiting** for sensitive routes
- **CSRF Protection** for forms
- **Data Isolation** between users
- **Security Headers** (Helmet-style)
- **Input Validation** with Zod schemas

### Performance & Optimization
- **Server-Side Rendering (SSR)** for authentication checks
- **Incremental Static Regeneration (ISR)** with 60-second revalidation
- **Optimized Images** with next/image
- **Bundle Optimization** with dynamic imports
- **Pagination** and lazy loading


## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15.5.0, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: JWT with HTTP-only cookies
- **Validation**: Zod schemas
- **State Management**: React Context API + SWR for data fetching
- **HTTP Client**: Axios for API requests
- **Database**: MongoDB with Mongoose ODM
- **Development**: Turbopack for faster builds

### Project Structure
```
wl/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── login/         # Login endpoint
│   │   │   ├── logout/        # Logout endpoint
│   │   │   └── me/            # User info endpoint
│   │   └── invoices/           # Invoice management endpoints
│   │       ├── [id]/          # Individual invoice operations
│   │       │   └── pdf/       # PDF export endpoint
│   │       └── route.ts       # Invoice CRUD operations
│   ├── dashboard/              # Dashboard page (SSR + ISR)
│   ├── invoice/                # Invoice pages
│   │   ├── [id]/              # Invoice details (SSR)
│   │   └── new/               # Create invoice (CSR)
│   ├── login/                  # Login page with optimized hydration
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout with auth provider
│   └── page.tsx                # Home page with redirects
├── components/                  # Reusable UI components
│   ├── Dashboard.tsx           # Main dashboard component
│   ├── ErrorBoundary.tsx       # Error handling component
│   ├── InvoiceList.tsx         # Invoice list with pagination
│   └── Navigation.tsx          # Navigation component
├── contexts/                    # React contexts
│   └── AuthContext.tsx         # Authentication context
├── controllers/                 # Business logic controllers
│   ├── invoiceController.ts    # Invoice business logic
│   └── userController.ts       # User business logic
├── lib/                         # Utility functions
│   ├── axios.ts               # Axios configuration
│   ├── db.ts                  # Database connection
│   ├── fetcher.ts             # SWR fetcher function
│   ├── seed.ts                # Database seeding
│   ├── server-utils.ts        # Server-side utilities
│   ├── swr-config.ts          # SWR configuration
│   └── utils.ts               # Helper functions
├── models/                      # Database models
│   ├── Invoice.ts             # Invoice model
│   └── User.ts                # User model
├── scripts/                     # Utility scripts
├── types/                       # TypeScript type definitions
│   └── index.ts                # Application interfaces
├── middleware.ts                # Next.js middleware for auth
├── next.config.ts              # Next.js configuration
└── README.md                    # This file
```

## Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB (local or cloud instance)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wl
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/invoice-management
   
   # Security
   NODE_ENV=development
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Set up the database**
   ```bash
   # Seed the database with initial data
   npm run seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials
- **Admin User**:
  - Email: admin@fintech.com
  - Password: Pass@1234
- **Accountant User**:
  - Email: accountant@fintech.com
  - Password: Pass@1234



## Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Stored in HTTP-only cookies for security
- **Token Expiration**: Configurable token lifetime
- **Role-based Access**: Admin and Accountant roles
- **Route Protection**: All sensitive routes require authentication
- **Middleware Protection**: Next.js middleware for route-level auth

### Data Protection
- **Input Sanitization**: All user inputs are sanitized to prevent XSS
- **Data Isolation**: Users can only access their own invoices
- **Validation**: Server-side and client-side validation with Zod
- **Rate Limiting**: Prevents brute force attacks on login
- **MongoDB Security**: Proper data validation and sanitization

### Security Headers
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff (prevents MIME type sniffing)
- **Referrer-Policy**: origin-when-cross-origin
- **Secure Cookies**: HTTP-only, same-site, secure flags

## 📊 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "admin@fintech.com",
  "password": "Pass@1234"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "admin@fintech.com",
    "role": "admin",
    "name": "Admin User"
  },
  "message": "Login successful"
}
```

#### POST /api/auth/logout
Clear authentication cookies.

#### GET /api/auth/me
Get current authenticated user information.

### Invoice Endpoints

#### GET /api/invoices
Get paginated list of invoices for authenticated user.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 5, max: 100)

#### POST /api/invoices
Create a new invoice.

**Request Body:**
```json
{
  "clientName": "Client Name",
  "clientEmail": "client@example.com",
  "amount": 1000.00,
  "currency": "USD",
  "dueDate": "2024-12-31",
  "lineItems": [
    {
      "description": "Service Description",
      "quantity": 1,
      "unitPrice": 1000.00
    }
  ],
  "notes": "Optional notes"
}
```

#### GET /api/invoices/[id]
Get specific invoice details.

#### GET /api/invoices/[id]/pdf
Download invoice as PDF (mock implementation).

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=24h
MONGODB_URI=<your-mongodb-connection-string>
```

### Security Checklist for Production
- [ ] Change default JWT secret
- [ ] Enable HTTPS
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular security audits
- [ ] Database security hardening
- [ ] Configure MongoDB authentication

## Testing

### Manual Testing Checklist
- [ ] User authentication flow
- [ ] Invoice creation and validation
- [ ] Invoice viewing and pagination
- [ ] PDF download functionality
- [ ] Role-based access control
- [ ] Input validation and sanitization
- [ ] Error handling and boundaries
- [ ] Responsive design on different devices
- [ ] Hydration consistency (no console warnings)

### Security Testing
- [ ] Authentication bypass attempts
- [ ] XSS injection tests
- [ ] CSRF protection validation
- [ ] Rate limiting verification
- [ ] Data isolation testing

## Customization

### Adding New Features
1. **New API Routes**: Add to `app/api/` directory
2. **New Pages**: Create in appropriate `app/` subdirectory
3. **New Components**: Add to `components/` directory
4. **New Controllers**: Add business logic to `controllers/` directory
5. **New Models**: Add database models to `models/` directory
6. **New Types**: Extend interfaces in `types/index.ts`

### Database Integration
The application uses MongoDB with Mongoose ODM. Models are defined in the `models/` directory and business logic in the `controllers/` directory.

## Performance Optimization

### Current Optimizations
- **ISR**: 60-second revalidation for dashboard
- **SSR**: Authentication checks and initial data loading
- **Image Optimization**: next/image for asset optimization
- **Bundle Splitting**: Dynamic imports for large components
- **Pagination**: 5 items per page with lazy loading
- **SWR**: Client-side data fetching and caching
- **Turbopack**: Faster development builds
- **Hydration Safety**: Proper client-side mounting checks

### Future Optimizations
- **Redis Caching**: For frequently accessed data
- **CDN Integration**: For static assets
- **Database Indexing**: For large datasets
- **Background Jobs**: For PDF generation and email sending
