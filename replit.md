# Spell Ring Manager

## Overview

This is a full-stack web application for managing a D&D spell library and ring storage system. The application allows users to upload spells via CSV files, browse through a spell library, and manage a personal spell ring with capacity limitations. Built with React frontend, Express backend, and PostgreSQL database using Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **File Upload**: Multer for handling CSV uploads
- **CSV Processing**: PapaParse for parsing CSV files
- **Session Management**: Express sessions with PostgreSQL store

### Database Schema
- **spells**: Stores spell information (id, name, class, level, description)
- **ring_storage**: Manages spells in user's ring (id, spell_id, added_at)
- **users**: User management (id, username, password)

## Key Components

### Core Features
1. **CSV Upload System**: Allows bulk importing of spells from CSV files
2. **Spell Library**: Browsable collection with filtering by class, level, and search
3. **Ring Management**: Personal spell storage with capacity tracking
4. **Capacity Visualization**: Visual indicators for ring capacity and usage

### Frontend Components
- **SpellCard**: Reusable component for displaying spells in library and ring views
- **CapacityIndicator**: Visual representation of ring capacity and usage
- **File Upload**: Drag-and-drop CSV upload interface

### Backend Services
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **CSV Processing**: Validates and processes uploaded spell data
- **API Routes**: RESTful endpoints for spell and ring management

## Data Flow

1. **CSV Upload**: User uploads CSV → Backend processes and validates → Stores in database
2. **Spell Library**: Frontend queries spells → Backend retrieves from database → Displays with filters
3. **Ring Management**: User adds/removes spells → Backend updates ring storage → Frontend reflects changes
4. **Capacity Tracking**: Ring additions check capacity limits → Prevents overflow → Updates UI indicators

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database queries and migrations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework

### File Processing
- **multer**: Multipart form handling for file uploads
- **papaparse**: CSV parsing and validation

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild bundles Express server to `dist/index.js`
- Database: Drizzle migrations in `migrations/` directory

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)

### Scripts
- `dev`: Development server with hot reloading
- `build`: Production build for both frontend and backend
- `start`: Production server startup
- `db:push`: Apply database schema changes

## Changelog

- July 08, 2025. Initial setup
- July 08, 2025. Added comprehensive spell information support: Type, Concentration, Upcast, Range fields
- July 08, 2025. Integrated PostgreSQL database for persistent data storage
- July 08, 2025. Enhanced CSV parsing to handle both old and new formats with backward compatibility
- July 08, 2025. Fixed CSV parsing to properly split comma-separated classes into individual entries
- July 08, 2025. Updated level 0 and 1 spells to be treated as level 1 for capacity calculations
- July 08, 2025. Added collapsible descriptions in spell library for condensed viewing
- July 08, 2025. Changed ring spell removal button to "Use Spell" with lightning bolt icon
- July 08, 2025. Reorganized UI - moved Ring Storage above Spell Library for better workflow
- July 08, 2025. Condensed spell display to show only name, level, class, and range by default
- July 08, 2025. Added text labels: "Cast Spell" for ring spells, "Add Spell" for library spells
- July 08, 2025. Implemented "Cantrip" labeling for level 0 spells with separate filter option
- July 08, 2025. Hid all descriptions by default - now only shown when "Show details" is clicked
- July 08, 2025. Added class-based color coding for spell cards (different colors for each D&D class)
- July 08, 2025. Combined header and ring storage into unified section
- July 08, 2025. Added spell count display in library header showing filtered results
- July 08, 2025. Fixed capacity calculation bug and added duplicate spell prevention
- July 08, 2025. Improved error messages and added visual "FULL" indicator for ring capacity
- July 08, 2025. Removed duplicate prevention - now allows storing multiple copies of the same spell
- July 08, 2025. Updated storage section to display spell cards in grid layout with thicker outlines like library section
- July 08, 2025. Made storage cards match library cards with white background and colored outlines (thicker borders for distinction)
- July 08, 2025. Fixed button visibility issue in storage cards - all buttons now have proper colors and are visible
- July 08, 2025. Condensed spell card layout - moved all details to single line and relocated show details button under action buttons
- July 08, 2025. Fixed duplicate description issue - removed redundant spell.spell field display
- July 08, 2025. Changed all badges to grey except class badge which maintains D&D class color coding
- July 08, 2025. Removed redundant spell type badge from expanded details section
- July 08, 2025. Code cleanup: fixed TypeScript errors, removed unused props, deleted old spell-card file, optimized color mapping
- July 08, 2025. Moved level badge before spell title and relocated show details button below action buttons for true single-line layout
- July 08, 2025. Made level badge use same color as class badge for consistent visual theming
- July 08, 2025. Swapped action buttons with level badge positioning and made spell title use class color for cohesive theming
- July 08, 2025. Moved action buttons (Cast Spell/Add Spell) to beginning of spell card line before the spell title
- July 08, 2025. Swapped positions of level badge and show details button - show details now on right, level badge below card
- July 08, 2025. Moved level badge back to same line as other badges and centered show details button on the right side
- July 08, 2025. Added magical sound effect when casting spells (removing from ring) using Web Audio API
- July 08, 2025. Added bright chime sound effect for adding spells to ring
- July 08, 2025. Enhanced disabled spell styling with stronger graying and added 3px border for available spells
- July 08, 2025. Fixed level filter to only show spell levels that exist in the collection instead of all 1-9
- July 08, 2025. Removed "Ring Storage" subtitle text, keeping only the main title
- July 08, 2025. Changed capacity text from "levels used" to "levels stored" for clarity
- July 08, 2025. Updated capacity indicator graphic to show "Levels Stored" instead of "Levels Used"
- July 08, 2025. Added extra space between "5" and "levels" in capacity text for better visual spacing
- July 08, 2025. Removed "Levels Stored:" text from capacity indicator graphic for cleaner appearance
- July 08, 2025. Removed redundant second set of numbers (1/5) from capacity meter since visual bar already shows this
- July 08, 2025. Changed spell library default filters from "all" to "Wizard" class and "1st Level" for more focused initial view
- July 08, 2025. Prepared deployment files: GitHub setup guide, Vercel config, README, and environment templates for free hosting

## User Preferences

Preferred communication style: Simple, everyday language.