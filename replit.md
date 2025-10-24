# Yemen Hybrid Workshop Management Platform

## Overview

This is a comprehensive workshop management system designed for hybrid vehicle service centers in Yemen. The platform manages multi-role workflows including work orders, customer interactions, service catalogs, spare parts inventory, real-time chat communication, and business analytics. The application supports bilingual operation (Arabic/English) with RTL/LTR layout switching and provides role-based access control for admins, supervisors, engineers, sales staff, and customers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**Routing**: Wouter for client-side routing, providing a lightweight alternative to React Router.

**State Management**: 
- React Context API for global state (authentication, language preferences)
- TanStack Query (React Query) for server state management and caching
- Local React state for component-level state

**UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. The design follows Material Design 3 principles with custom refinements, optimized for data-intensive enterprise workflows.

**Internationalization**: i18next with react-i18next for translation management, supporting English and Arabic with automatic RTL/LTR layout switching based on selected language.

**Design System**:
- Custom theme variables supporting light/dark modes
- Typography: Inter (Latin), Noto Sans Arabic (Arabic), JetBrains Mono (monospace)
- Tailwind-based spacing and layout system
- Component variants using class-variance-authority

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript.

**API Design**: RESTful API endpoints organized by feature domain:
- `/api/auth/*` - Authentication and user management
- `/api/chat/*` - Real-time messaging
- `/api/reports/*` - Business analytics and reporting
- `/api/services/*` - Service catalog management
- `/api/work-orders/*` - Work order lifecycle management

**Real-time Communication**: WebSocket integration for live chat functionality, enabling instant messaging between staff and customers.

**Authentication & Authorization**:
- JWT-based authentication with bcrypt for password hashing
- Role-based access control (RBAC) middleware
- Token stored in localStorage on client, passed via Authorization header
- Session management with configurable secret key

**Middleware Stack**:
- JSON body parsing with raw body capture for webhooks
- CORS handling for development/production environments
- Request logging with duration tracking
- Custom authentication and authorization middleware

### Data Storage

**Database**: PostgreSQL accessed through Neon serverless database service.

**ORM**: Drizzle ORM with TypeScript-first schema definition, providing type-safe database queries and migrations.

**Schema Organization**:
- **Users**: Multi-role user system (admin, supervisor, engineer, sales, customer) with specializations
- **Services**: Catalog of workshop services with bilingual names/descriptions, pricing, and duration estimates
- **Spare Parts**: Inventory management with bilingual naming
- **Work Orders**: Complete lifecycle tracking (new → assigned → in_progress → done → delivered → cancelled)
- **Chat System**: Channels for team communication and customer support threads
- **Specializations**: Engineer skill categories (electric, mechanic, battery, AC, etc.)
- **Audit Trail**: Work order events for activity tracking

**Database Migrations**: Managed via Drizzle Kit with schema-first approach.

**Seeding Strategy**: Separate seed files for initial data (admin user, default channels, specializations) and catalog data (services, parts).

### External Dependencies

**UI Components**: 
- @radix-ui/* - Accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- shadcn/ui - Pre-built component library
- lucide-react - Icon library
- recharts - Data visualization for reports

**Form Management**:
- react-hook-form - Form state and validation
- @hookform/resolvers - Schema validation integration
- zod - Runtime type validation and schema definition

**Development Tools**:
- Vite plugins for Replit integration (runtime error overlay, dev banner, cartographer)
- tsx - TypeScript execution for development server
- esbuild - Fast bundling for production builds

**Database & ORM**:
- @neondatabase/serverless - Neon PostgreSQL client with WebSocket support
- drizzle-orm - TypeScript ORM
- drizzle-kit - Database migration tool
- drizzle-zod - Zod schema generation from Drizzle schemas

**Utilities**:
- date-fns - Date manipulation and formatting
- clsx + tailwind-merge - Conditional className composition
- nanoid - Unique ID generation
- ws - WebSocket implementation for Node.js

**Typography**: Google Fonts (Inter, Noto Sans Arabic, JetBrains Mono) loaded via CDN for bilingual support.