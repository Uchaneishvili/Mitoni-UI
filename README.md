# Mitoni UI - Aesthetic Center Reservation System

Mitoni UI is a modern, responsive, and robust front-end web application built for managing reservations, staff, and services at an aesthetic center. It serves as the front-office management portal.

## Features

- **Dashboard**: High-level overview with engaging, animated statistic cards displaying real-time business metrics.
- **Reservations Management**: 
  - Comprehensive List view with sorting, filtering, and quick actions.
  - Interactive Calendar view (Daily/Weekly/Monthly) powered by `react-big-calendar`.
  - Easy state management (Approve, Cancel, Edit) directly from contextual Drawers.
- **Staff Management**: Create, edit, and deactivate specialists. Assign services to specific staff members.
- **Services Management**: Configure aesthetic services, durations, and pricing.
- **Responsive Layout**: Works seamlessly across desktop and mobile devices. Modern UX powered by Ant Design components.

## Tech Stack

This project leverages a solid, modern React ecosystem:
- **React 18** (Vite scaffolding)
- **Ant Design (Antd) V5**: Enterprise-level UI components and design system.
- **Framer Motion**: Fluid animations and layout transitions (Dashboard).
- **React Router Dom V6**: Declarative routing and navigation.
- **TanStack React Query V5**: Advanced server-state management, caching, and optimistic UI updates.
- **Axios**: Promised-based HTTP client for backend communication.
- **Dayjs**: Lightweight date/time manipulation (replacing Moment.js).
- **React Big Calendar**: Robust calendar component for scheduling views.

## Architecture & Best Practices

1. **Separation of Concerns**: UI components are strictly decoupled from API logic. API calls live in `/services/`, while UI interaction handlers live in `pages/` and `components/`.
2. **Generic Components**: Reusable components like `<GenericTable>` encapsulate pagination, searching, sorting, and contextual empty states, drastically reducing boilerplate across the app.
3. **Custom Hooks**: Domain-specific API interactions are wrapped in custom hooks (`useStaff()`, `useReservations()`) built on top of React Query, promoting reuse and solidifying caching strategies.
4. **Centralized Error Handling**: Backend validation errors (e.g., HTTP 400) are automatically mapped to Ant Design Form fields via a custom utility function (`handleBackendError`).
5. **Centralized Theming**: Brand colors and semantic status colors are extracted into a central `constants/theme.js` for easy maintenance.

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Clone the repository and navigate to the project root.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the Vite development server:
```bash
npm run dev
```

### Production Build

Create an optimized production bundle:
```bash
npm run build
```
