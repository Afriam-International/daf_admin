# DAF Admin

React/Vite admin dashboard for managing the DAF ecosystem. It talks to `daf_api` for authentication, user management, analytics, donations, gallery, FAQs, and social feed administration.

## What It Covers

- Admin and superadmin authentication
- User management and deletion-request review
- Donation campaign oversight using Givebutter-backed data from the API
- Gallery management
- Social feed management
- FAQ management
- Role and permission management
- Activity log visibility

## Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_PUBLIC_URL=http://localhost:5173
VITE_WP_URL=https://diasporanewsguide.com/wp-json
```

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:5173`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## API Expectations

The dashboard expects `daf_api` to expose:

- `POST /api/auth/login`
- `GET /api/user/profile`
- `GET /api/analytics/dashboard`
- `GET /api/donations`
- `GET /api/donations/transactions`
- `GET /api/gallery`
- `GET /api/feed`
- `GET /api/faq`

Most admin routes are capability-protected in addition to role-protected.

## Important Notes

- Donation data shown here comes from Givebutter through the backend, not from WordPress.
- The nav and page access rules are defined in `src/routes/nav.js` plus route guards and backend permissions.
- If backend permissions change, the frontend usually needs matching UX updates for hidden/blocked pages.

## Handoff

Project-wide handoff documentation lives in [../daf_api/PROJECT_DOCUMENTATION.md](../daf_api/PROJECT_DOCUMENTATION.md).
