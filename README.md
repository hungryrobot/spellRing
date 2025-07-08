# D&D Ring of Spell Storing Manager

A comprehensive web application for managing D&D spells in a Ring of Spell Storing. Track your spell collection, manage ring capacity, and organize spells with an intuitive interface optimized for iPad use.

## Features

- **Spell Library**: Browse and filter spells by class, level, and search terms
- **Ring Management**: Track spells stored in your Ring of Spell Storing with 5-level capacity limit
- **CSV Import**: Bulk import spell data from CSV files
- **Sound Effects**: Immersive audio feedback for spell actions
- **Mobile Optimized**: Perfect for iPad and mobile devices
- **Class-Based Theming**: Color-coded spell cards for each D&D class

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build**: Vite for development and production
- **UI Components**: Radix UI with shadcn/ui styling

## Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd spell-ring-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Add your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/spellring"
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Deployment

This app is ready to deploy to various platforms:

### Vercel (Recommended)
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add `DATABASE_URL` environment variable
4. Deploy automatically

### Other Platforms
See `DEPLOYMENT.md` for detailed instructions for Railway, Render, and other hosting platforms.

## Usage

1. **Setup**: Upload spell data via CSV file (see example format in Setup page)
2. **Browse**: Filter spells by class, level, or search by name
3. **Manage Ring**: Add spells to your ring (max 5 levels total)
4. **Cast Spells**: Remove spells from ring when used

## CSV Format

Your CSV should include these columns:
- `name`: Spell name
- `class`: D&D class (Wizard, Cleric, etc.)
- `level`: Spell level (0-9)
- `description`: Spell description
- `type`: Spell type (optional)
- `concentration`: Yes/No (optional)
- `upcast`: Upcast information (optional)
- `range`: Spell range (optional)

## License

MIT License - feel free to use for your D&D games!