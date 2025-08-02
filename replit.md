# Overview

ArtSpace is a digital art marketplace platform that connects artists and art collectors. The application allows artists to upload and showcase their digital artwork, while buyers can discover, like, comment on, and purchase art pieces. The platform features user authentication through Replit Auth, a comprehensive artwork management system, social features like following artists and liking artwork, and a virtual currency system for transactions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React and TypeScript using Vite as the build tool. The application follows a component-based architecture with:
- **UI Framework**: Radix UI components with shadcn/ui styling system for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Component Structure**: Organized into reusable UI components, page components, and business logic hooks

## Backend Architecture
The backend uses Express.js with TypeScript following a RESTful API design:
- **Framework**: Express.js with middleware for JSON parsing, CORS handling, and request logging
- **API Design**: RESTful endpoints organized by resource (users, artworks, comments, likes, follows, purchases)
- **Error Handling**: Centralized error middleware with consistent error responses
- **Request Validation**: Zod schemas for input validation and type safety
- **Development Setup**: Hot reloading with tsx and Vite integration for seamless development experience

## Data Storage
The application uses PostgreSQL with Drizzle ORM for database operations:
- **Database**: PostgreSQL hosted on Neon for cloud-based data storage
- **ORM**: Drizzle ORM providing type-safe database queries and schema management
- **Schema Design**: Relational data model with tables for users, artworks, likes, comments, follows, and purchases
- **Migrations**: Drizzle Kit for database schema migrations and version control
- **Session Storage**: PostgreSQL-backed session storage for authentication state

## Authentication and Authorization
Authentication is handled through Replit's OIDC-based authentication system:
- **Provider**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **User Management**: Automatic user creation and profile management through OIDC claims
- **Authorization**: Role-based access control with artist and buyer user types
- **Security**: Secure session cookies with HTTP-only flags and CSRF protection

## Key Design Patterns
- **Repository Pattern**: Storage abstraction layer for database operations with TypeScript interfaces
- **Middleware Architecture**: Express middleware chain for authentication, logging, and error handling
- **Component Composition**: React components built with composition patterns using Radix UI primitives
- **Type Safety**: End-to-end TypeScript with shared schemas between frontend and backend
- **Query Optimization**: React Query for efficient data fetching, caching, and synchronization

# External Dependencies

## Authentication Services
- **Replit Auth**: Primary authentication provider using OpenID Connect protocol
- **OpenID Client**: Node.js library for OIDC integration and token management

## Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting platform with automatic scaling
- **Drizzle ORM**: Type-safe PostgreSQL ORM with schema management capabilities
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI and Styling
- **Radix UI**: Headless UI component library providing accessible primitives
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library with consistent SVG icons
- **shadcn/ui**: Pre-built component system built on Radix UI and Tailwind CSS

## Development and Build Tools
- **Vite**: Fast build tool and development server with HMR support
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

## Validation and Forms
- **Zod**: Runtime type validation and schema definition library
- **React Hook Form**: Performant form library with validation integration
- **@hookform/resolvers**: Zod resolver for React Hook Form integration

## Utilities and Helpers
- **date-fns**: Date manipulation and formatting library
- **clsx & tailwind-merge**: Utility functions for conditional CSS class handling
- **memoizee**: Function memoization for performance optimization
- **nanoid**: URL-safe unique ID generation for various identifiers