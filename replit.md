# StockSync - Financial Dashboard Application

## Overview

StockSync is a comprehensive financial dashboard application designed for tracking and analyzing stock market data. The application allows users to monitor company financial metrics, analyze growth patterns, and manage their investment watchlist. Built with modern web technologies, it features real-time stock data integration via Yahoo Finance, comprehensive financial analysis tools, and an intuitive user interface for portfolio management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based architecture
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript throughout the entire stack for consistency
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Data Validation**: Zod schemas for request/response validation and type inference
- **Storage Layer**: Abstracted storage interface supporting both in-memory and database implementations

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle migrations for version-controlled database changes
- **Core Entities**:
  - Users table for authentication and user management
  - Companies table storing comprehensive financial metrics including current year and next year EPS projections, P/E ratios, and PEG ratios
  - User preferences for customizable dashboard settings

### API Architecture
- **RESTful Design**: Clean REST endpoints for CRUD operations on companies and user data
- **Error Handling**: Centralized error middleware with consistent error responses
- **Request Logging**: Comprehensive API request logging with response times and payload capture
- **Data Fetching**: Yahoo Finance integration via Python scripts for real-time stock data retrieval

### Authentication & Authorization
- Session-based authentication with PostgreSQL session storage
- User isolation for company data and preferences
- Secure password handling and validation

## External Dependencies

### Financial Data Services
- **Yahoo Finance**: Primary data source for stock information, financial metrics, and analyst estimates
- **Python Integration**: yfinance library for robust financial data extraction and processing

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Session Storage**: connect-pg-simple for PostgreSQL-backed session management

### UI & Design System
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide Icons**: Comprehensive icon library for consistent visual elements
- **Google Fonts**: Inter font family for modern typography

### Development & Build Tools
- **Vite**: Development server and build tool with hot module replacement
- **ESBuild**: Fast JavaScript bundler for server-side code compilation
- **TypeScript**: Static type checking across the entire application stack
- **Replit Integration**: Development environment plugins for enhanced debugging and deployment

### Data Processing & Validation
- **Drizzle Zod**: Integration between Drizzle ORM and Zod for schema-based validation
- **Date-fns**: Comprehensive date manipulation and formatting library
- **Class Variance Authority**: Type-safe variant management for component styling