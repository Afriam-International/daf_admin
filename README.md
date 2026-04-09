# DAF Frontend - Admin Dashboard

A React Vite-based admin dashboard for managing DAF backend operations including user management, donations tracking, and analytics.

## Features

- **Authentication**: Email/password login with admin role verification
- **Dashboard**: Real-time analytics and overview
- **User Management**: View, edit, and manage all system users
- **Donations Tracking**: Monitor and manage donations
- **Responsive Design**: Mobile-friendly interface
- **Color Scheme**: Custom DAF color scheme (Teal, Brown, Purple)

## Technology Stack

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Lucide React**: Icon library

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Install Dependencies**
```bash
cd daf_frontend
npm install
```

2. **Configure Environment Variables**
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_FRONTEND_URL=http://localhost:5173
```

Update `VITE_API_URL` to match your backend server URL.

3. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Sidebar.jsx      # Navigation sidebar
│   ├── Topbar.jsx       # Top navigation bar
│   └── StatCard.jsx     # Dashboard stat cards
├── context/             # React Context for state management
│   └── AuthContext.jsx  # Authentication context
├── hooks/               # Custom React hooks
│   └── useAuth.js       # Auth hook
├── layouts/             # Layout components
│   ├── AuthLayout.jsx   # Auth pages layout
│   └── AdminLayout.jsx  # Admin pages layout
├── pages/               # Page components
│   ├── LoginPage.jsx           # Login page
│   ├── ForgotPasswordPage.jsx  # Forgot password page
│   ├── DashboardPage.jsx       # Dashboard overview
│   ├── UsersPage.jsx           # Users management
│   └── DonationsPage.jsx       # Donations management
├── routes/              # Route guards and helpers
│   ├── ProtectedRoute.jsx  # Protected route wrapper
│   └── GuestRoute.jsx      # Guest-only route wrapper
├── services/            # API services
│   └── api.js           # Axios instance and API endpoints
├── App.jsx              # Main app component with routes
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Authentication Flow

1. User navigates to `/login`
2. Enters email and password
3. Frontend calls `POST /api/auth/login`
4. Server validates credentials and checks if user is admin
5. Server returns access token and user info
6. Frontend stores tokens in localStorage
7. User is redirected to `/admin/dashboard`
8. All subsequent requests include the access token in headers

## Protected Routes

All admin routes require:
- Valid access token
- User role = "admin"

If token expires or user is not admin, they're redirected to login page.

## API Integration

The app uses Axios with automatic request/response interceptors for token management.

## Key Endpoints Used

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password (authenticated)

### Users
- `GET /api/user` - Get all users (paginated)
- `GET /api/user/:id` - Get user details
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user

### Donations
- `GET /api/donations` - Get all donations (paginated)
- `POST /api/donations` - Create donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics

## Color Scheme

Custom Tailwind colors:
- **daf-teal**: #2DAABF (Primary)
- **daf-brown**: #4A2C1F (Dark)
- **daf-purple**: #9f3aff (Accent)
- **daf-bg**: #F5F5F5 (Background)

## Quick Start

1. Install dependencies: `npm install`
2. Set up backend API URL in `.env`
3. Start dev server: `npm run dev`
4. Login with admin credentials
5. Start managing!

## For More Details

See [AUTH_SETUP.md](../daf-api/AUTH_SETUP.md) in the backend folder for authentication details.

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
