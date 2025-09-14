# School Library - API System

A modern school library management system built with NestJS framework, TypeScript, Prisma ORM, SQLite database, and JWT authentication.

## Features

### 📚 Book Management
- Complete CRUD for books with name, description, and publication year information
- Book availability tracking
- New book marking
- Book ratings with comments

### 👥 Author Management
- Author records with biographical data
- Literary period and life date information
- Book connections

### 🏷️ Categorization and Tagging
- Book organization by categories
- Flexible tag system for detailed marking
- Multiple tagging capability for single books

### 👤 User System
- User registration and authentication
- Role system (admin, student, librarian, etc.)
- JWT tokens for security

### 📋 Orders and Borrowing
- Book ordering system
- Order status tracking (pending, completed, cancelled, returned)
- Borrowing history

## Technology Stack

- **Backend**: NestJS (Node.js framework)
- **Language**: TypeScript
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Package Manager**: PNPM

## Database Structure

### Main Entities
- **Book** - books with complete records
- **Author** - authors and their biographical data
- **Category** - book categories
- **BookTag** - tags for books (many-to-many)
- **User** - system users
- **Role** - user roles
- **Order/OrderItem** - orders and their items
- **Rating** - book ratings
- **Token** - refresh tokens for authentication

## Installation and Setup

### Prerequisites
- Node.js (version 18+)
- PNPM

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd school-library-api
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key"
   JWT_EXPIRES_IN="7d"
   ```

4. **Database Initialization**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Database migration
   npx prisma migrate dev --name init
   
   # (Optional) Seed with test data
   npx prisma db seed
   ```

5. **Run Application**
   ```bash
   # Development environment
   pnpm run start:dev
   
   # Production environment
   pnpm run start:prod
   ```