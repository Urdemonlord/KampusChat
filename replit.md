# Overview

This is an exclusive chat application built for students and alumni of Universitas Muhammadiyah Semarang (Unimus), inspired by BlackBerry Messenger (BBM). The application features a unique PIN-based identification system where each user gets a custom ID in the format `UNIMUS-XXXX`. It provides real-time messaging, group chats, broadcast channels, status updates (stories), and role-based access for students, alumni, faculty, and administrators.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript in a Vite-powered development environment
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Real-time Communication**: WebSocket integration for live messaging and status updates

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based authentication
- **Session Management**: Express sessions with PostgreSQL session store
- **Real-time Features**: WebSocket server for instant messaging and live updates
- **File Handling**: Multer middleware for file uploads with size limits
- **API Design**: RESTful endpoints with proper error handling and validation

## Database Design
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema Structure**:
  - Users table with unique PIN system, roles, and profile information
  - Chats table supporting direct messages, group chats, and broadcast channels
  - Messages table with support for text, images, and file attachments
  - Status updates table with TTL for temporary stories
  - Chat members table for group management with role-based permissions
  - Message read tracking for delivery status

## Authentication & Authorization
- **PIN System**: Custom unique identifier generation in `UNIMUS-XXXX` format
- **Role-based Access**: Four user roles (mahasiswa, alumni, dosen, admin) with different permissions
- **Session Security**: Secure cookie-based sessions with proper configuration for production
- **Password Security**: Scrypt-based password hashing with salt for secure storage

## Real-time Features
- **WebSocket Integration**: Custom WebSocket server for instant message delivery
- **Connection Management**: User authentication over WebSocket with connection tracking
- **Message Broadcasting**: Real-time message delivery to chat participants
- **Status Updates**: Live status/story sharing with automatic expiration
- **Typing Indicators**: Real-time typing status for enhanced user experience

## File Management
- **Upload System**: Local file storage with configurable size limits
- **File Types**: Support for images, documents, and other attachments
- **Storage Structure**: Organized file system with proper directory management
- **File Validation**: Type and size validation for secure file handling

# External Dependencies

## Database & Storage
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database toolkit with schema validation
- **Drizzle Kit**: Database migration and schema management tools

## UI & Styling
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: Pre-built component library built on Radix UI primitives
- **Lucide React**: Icon library for consistent iconography

## Development & Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and improved developer experience
- **ESLint & Prettier**: Code formatting and linting for code quality
- **PostCSS**: CSS processing with Tailwind CSS integration

## Authentication & Security
- **Passport.js**: Authentication middleware with local strategy support
- **express-session**: Session management with PostgreSQL store
- **connect-pg-simple**: PostgreSQL session store for persistent sessions
- **bcrypt/scrypt**: Password hashing for secure authentication

## Real-time & Communication
- **WebSocket (ws)**: Native WebSocket implementation for real-time features
- **TanStack Query**: Powerful data fetching and caching library
- **React Hook Form**: Performant form library with validation

## File Handling & Utilities
- **Multer**: Middleware for handling multipart/form-data and file uploads
- **date-fns**: Modern date utility library for formatting and manipulation
- **Zod**: Runtime type validation and schema validation
- **nanoid**: Secure URL-friendly unique string ID generator