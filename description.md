# Application Architecture Overview

This document provides a high-level overview of the different parts of the Italiano application, explaining the purpose and function of each component in simple terms.

## Frontend Architecture

The frontend is a [Next.js](https://nextjs.org/) application, which is a popular framework for building modern React applications.

### `app/components`

This directory contains reusable React components that are used to build the user interface. Examples include the `Navbar`, `LoginModal`, and `PageHeader`. By breaking the UI into smaller components, we can build a consistent and maintainable user interface.

### `app/contexts`

Contexts provide a way to share data and state across multiple components without having to pass props down manually at every level of the component tree.

- **`AuthContext.tsx`**: Manages the user's authentication state, providing information about the logged-in user and functions for logging in, registering, and logging out. It cleverly uses `useSyncExternalStore` to keep the user state synchronized with `localStorage` in a way that is safe for server-side rendering (SSR).
- **`PracticeActionsContext.tsx`**: Provides a set of common actions for the practice pages, such as handling user input, validating answers, and showing the correct answer. This avoids duplicating the same logic in every practice page.
- **`PracticeFiltersContext.tsx`**: Manages the user's preferences for filtering and sorting the practice items, such as the number of items to display, the sort order, and whether to exclude items that have been "mastered".

### `app/store`

The application uses [Redux Toolkit](https://redux-toolkit.js.org/) and [Redux Toolkit Query (RTK Query)](https://redux-toolkit.js.org/rtk-query/overview) to manage data fetching and caching.

- **`store.ts`**: This is where the Redux store is configured.
- **`baseApi.ts`**: This file defines the core of the API client. It creates a `baseApi` slice that all other API slices extend. It automatically adds the user's authentication token to all outgoing requests.
- **`authApi.ts`, `verbsApi.ts`, `nounsApi.ts`, `adjectivesApi.ts`**: Each of these files defines a set of "endpoints" for a specific part of the API. RTK Query automatically generates hooks from these endpoints (e.g., `useLoginMutation`, `useGetVerbsQuery`) that can be used in the UI to fetch data, handle loading and error states, and manage caching.

### `lib/hooks`

This directory contains custom React hooks that encapsulate reusable logic.

- **`useResetDialog.ts`**: A generic hook for managing the state of a confirmation dialog, making it easy to ask the user for confirmation before performing a destructive action like resetting statistics.
- **`useSortingAndFiltering.ts`**: A complex but powerful hook that handles all the logic for sorting and filtering the practice items. It has a clever "snapshot" feature to prevent the list from changing while the user is practicing, providing a stable and pleasant user experience.
- **`useStatisticsError.ts`**: A simple hook for managing the display of error messages related to statistics, with a convenient auto-clear feature.

## Backend Architecture

The backend is built using Next.js API Routes. It follows a clean, three-layer architecture:

1.  **API Layer**: The API routes in `app/api` handle incoming HTTP requests.
2.  **Service Layer**: The services in `lib/services` contain the business logic.
3.  **Repository Layer**: The repositories in `lib/repositories` handle the database interactions.

### `app/api`

This directory contains the API routes. Each route is responsible for:

1. Authenticating and authorizing the user.
2. Validating the request body using the schemas from `lib/validation`.
3. Calling the appropriate service to execute the business logic.
4. Returning a response or an error, which is handled by the `handleApiError` utility.

### `lib/errors`

This directory defines a set of custom error classes that are used throughout the application.

- **`AppError.ts`**: A base error class that all other custom errors extend. It adds support for HTTP status codes and custom error codes.
- **`AuthenticationError.ts`, `AuthorizationError.ts`, etc.**: Specific error classes for different types of errors. Using custom errors makes the code more predictable and easier to debug.
- **`errorHandler.ts`**: A centralized error handler that catches all errors thrown in the API routes and converts them into a standardized JSON error response.

### `lib/middleware`

- **`logging.middleware.ts`**: This file provides a middleware for logging all incoming API requests. It logs the request method, path, duration, and response status. This is invaluable for debugging and monitoring the application.

### `lib/repositories`

The repositories are responsible for all communication with the database. They use the [Prisma ORM](https://www.prisma.io/) to execute database queries.

- **`base.repository.ts`**: A generic `BaseRepository` class that provides a standard set of CRUD (Create, Read, Update, Delete) operations.
- **`user.repository.ts`, `verb.repository.ts`, etc.**: Each database table has a corresponding repository that extends the `BaseRepository` and adds any model-specific query methods.
- This "Repository Pattern" is a great design choice as it separates the data access logic from the business logic, making the application easier to maintain and test.

### `lib/services`

The services contain the core business logic of the application. They act as a bridge between the API routes and the repositories.

- **`base.service.ts`**: A `BaseService` class that provides common functionality for logging and error handling.
- **`auth.service.ts`, `user.service.ts`, etc.**: Each service is responsible for a specific domain. For example, the `AuthService` handles user registration and login, including password hashing and token generation. The services are where the application's rules and procedures are enforced.

### `lib/validation`

This directory contains validation schemas for all incoming API requests. It uses the [Zod](https://zod.dev/) library to define the shape of the expected request bodies.

- Using Zod allows for a single source of truth for both validation and TypeScript types, which helps to prevent bugs and makes the code more robust.
