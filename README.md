# URL Shortener

A full-featured URL shortener with analytics and dashboard built with Fastify, Prisma, and PostgreSQL.

## Features

- Short, memorable URLs with customizable codes
- User authentication and authorization
- URL management dashboard
- Multiple URL variants with UTM parameters
- Click tracking and analytics integration (Umami)
- 301 permanent redirects
- Admin panel for user management
- Docker Compose for local development
- Comprehensive test suite
- CI/CD with GitHub Actions

## Tech Stack

- **Backend**: Fastify (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Plain HTML, CSS, and JavaScript (no framework)
- **Testing**: Vitest
- **Deployment**: Docker Compose, Coolify-ready
- **Analytics**: Umami integration

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd url-shortener
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `BASE_URL`: Your short URL domain (e.g., jmd.to)
- `SESSION_SECRET`: Random secret for session encryption
- `UMAMI_WEBSITE_ID`: Umami analytics website ID (optional)
- `UMAMI_API_ENDPOINT`: Umami analytics endpoint (optional)

4. Start the database:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Generate Prisma client:
```bash
npm run prisma:generate
```

7. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Usage

### First User

Register the first user at http://localhost:3000/public/register.html

The first user will need to be manually set as admin in the database:
```bash
npm run prisma:studio
# Find the user and set isAdmin to true
```

### Creating Short URLs

1. Log in to the dashboard
2. Enter a long URL
3. Optionally specify a custom short code
4. Click "Create"

### Creating URL Variants

1. Find the URL in your dashboard
2. Click "Add Variant"
3. Enter UTM parameters
4. The variant will have its own short code but track to the same base URL in analytics

### Accessing Short URLs

Visit `http://localhost:3000/{shortCode}` to be redirected.

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

### Database Management

```bash
# Open Prisma Studio
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset
```

## Deployment

### Using Docker Compose

The included `docker-compose.yml` is configured for local development. For production:

1. Update `.env` with production values
2. Use a managed PostgreSQL instance or update docker-compose.yml
3. Build and run:
```bash
docker-compose up -d
npm run build
npm start
```

### Using Coolify

1. Set environment variables in Coolify
2. Use the provided DATABASE_URL from Coolify's PostgreSQL service
3. Run migrations as part of the build process

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### URLs
- `GET /api/urls` - Get user's URLs
- `POST /api/urls` - Create new URL
- `PUT /api/urls/:id` - Update URL
- `DELETE /api/urls/:id` - Delete URL
- `POST /api/urls/variants` - Create URL variant
- `DELETE /api/urls/variants/:id` - Delete variant

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/toggle-admin` - Toggle admin status

### Redirects
- `GET /:shortCode` - Redirect to long URL

## License

MIT
