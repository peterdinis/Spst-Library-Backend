# School Library - API System

A modern school library management system built with NestJS framework, TypeScript, MongoDB Database and JWT authentication.

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

### 📋 Orders and Borrowing
- Book ordering system
- Order status tracking (pending, completed, cancelled, returned)
- Borrowing history

## Technology Stack

- **Backend**: NestJS (Node.js framework)
- **Language**: TypeScript
- **Database**: MongoDB
- **Package Manager**: PNPM

## Database Structure

### Main Entities
- **Book** - books with complete records
- **Author** - authors and their biographical data
- **Category** - book categories
- **BookTag** - tags for books (many-to-many)
- **Order/OrderItem** - orders and their items
- **Rating** - book ratings

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