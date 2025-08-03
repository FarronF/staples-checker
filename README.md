# Staples Checker

A RESTful API for managing item lists and tracking inventory status, with multi-platform chat integration. Built with Node.js, Express, TypeScript, and MongoDB.

## Architecture Overview

This project uses a multi-package architecture:

```
staples-checker/
├── packages/
│   ├── core-api/          # Main REST API
│   └── chat/              # Chat integrations (Not yet implemented)
├── docker-compose.yml     # Service orchestration
└── README.md             # This file
```

## Features

- **Item List Management**: Create, read, update, and delete item lists
- **Item Operations**: Add items to lists, update status, delete items
- **Status Filtering**: Filter items by status (Ok, Low, Out, Unknown)
- **Chat Interfaces**: Natural language commands via Discord and Web UI
- **HATEOAS Support**: Hypermedia-driven API with discoverable links
- **Clean Architecture**: Separation of concerns with domain, application, and infrastructure layers
- **Type Safety**: Full TypeScript implementation with validation

## Quick Start (Recommended)

The fastest way to get started is using Docker Compose:

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd staples-checker
   ```

2. **Start all services:**

   ```bash
   docker-compose up --build -d
   ```

   This will start:

   - MongoDB database
   - Core API on port 3000
   - Chat interfaces (when configured)

3. **Test the API:**

   ```bash
   curl http://localhost:3000
   # Should return: "Hello, Express is installed!"
   ```

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

## Development Setup

### Core API Only

If you only want to work on the core API:

```bash
cd packages/core-api
npm install
npm run dev
```

### Full Workspace

For working with multiple packages:

```bash
# Install all dependencies
npm install

# Run specific package
npm run dev:core-api

# Run tests across all packages
npm test
```

## API Documentation

The core API is located in `packages/core-api/`. See the [Core API README](packages/core-api/README.md) for detailed API documentation.

### Quick API Reference

- `GET /item-lists/{id}` - Get item list by ID
- `POST /item-lists` - Create new item list
- `POST /item-lists/{id}/items` - Add items to list
- `PATCH /item-lists/{id}/items/{itemName}` - Update item status
- `GET /item-lists/{id}/items?statuses=Low,Out` - Filter items by status

## Chat Integration

Natural language commands are supported through:

- **Web Chat**: Built-in web interface at `/chat`
- **Discord Bot**: Send commands via Discord (configuration required)

Example commands:

- "Add milk to my shopping list"
- "Mark bread as low stock"
- "Show me items that are out of stock"

## Testing

### API Testing with Bruno

Bruno collection available at `packages/core-api/external-tools/bruno-collection/`

### Running Tests

```bash
# All packages
npm test

# Specific package
npm run test --workspace=core-api
```

## Package Structure

### Core API (`packages/core-api/`)

RESTful API following Clean Architecture:

- **Domain**: Business entities and rules
- **Application**: Use cases and services
- **Infrastructure**: Database and external services
- **Presentation**: Controllers, DTOs, and routes

### Chat Service (`packages/chat/`) - _Coming Soon_

Multi-platform chat integration:

- Discord bot integration
- Web chat interface
- Natural language processing

## Environment Configuration

### Docker Environment

Configure via `docker-compose.yml` environment section:

```yaml
environment:
  - MONGODB_URI=mongodb://mongodb:27017/staples-checker
  - NODE_ENV=production
  - DISCORD_TOKEN=${DISCORD_TOKEN} # Optional
```

### Local Development

Create `.env` files in individual packages as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Work in the appropriate package directory
4. Add tests for new functionality
5. Ensure all packages build and test successfully
6. Submit a pull request

## Package Development

### Adding a New Package

1. Create new directory in `packages/`
2. Add to workspace in root `package.json`
3. Update Docker Compose if needed
4. Document in this README

### Working with Workspaces

```bash
# Add dependency to specific package
npm install express --workspace=core-api

# Run command in specific package
npm run build --workspace=chat

# Run command in all packages
npm run test --workspaces
```
