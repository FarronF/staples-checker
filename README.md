# Staples Checker

A RESTful API for managing item lists and tracking inventory status. Built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Item List Management**: Create, read, update, and delete item lists
- **Item Operations**: Add items to lists, update status, delete items
- **Status Filtering**: Filter items by status (Ok, Low, Out, Unknown)
- **HATEOAS Support**: Hypermedia-driven API with discoverable links
- **Clean Architecture**: Separation of concerns with domain, application, and infrastructure layers
- **Type Safety**: Full TypeScript implementation with validation

## API Endpoints

### Item Lists

- `GET /item-lists/{id}` - Get item list by ID
- `POST /item-lists` - Create new item list
- `DELETE /item-lists/{id}` - Delete item list

### Items

- `GET /item-lists/{id}/items` - Get all items in a list
- `GET /item-lists/{id}/items?statuses=Low,Out` - Filter items by status
- `POST /item-lists/{id}/items` - Add items to list
- `GET /item-lists/{id}/items/{itemName}` - Get specific item
- `PATCH /item-lists/{id}/items/{itemName}` - Update item status
- `DELETE /item-lists/{id}/items/{itemName}` - Delete item

## Architecture

This project follows Clean Architecture principles:

```
src/
├── core/
│   ├── application/     # Use cases and application services
│   │   ├── item-list/   # Item list service
│   │   └── repositories/ # Repository interfaces
│   └── domain/          # Domain entities and business logic
│       ├── item-list/   # Item list domain models
│       └── errors/      # Domain exceptions
├── infrastructure/     # External concerns (database, etc.)
│   └── repositories/   # Repository implementations
└── presentation/       # Controllers, DTOs, and routers
    ├── controllers/    # HTTP controllers
    ├── dtos/          # Data transfer objects
    └── routers/       # Express route definitions
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd staples-checker
```

2. Install dependencies:

```bash
npm install
```

3. Start MongoDB locally or configure connection string in `src/index.ts`

4. Run the application:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Usage Examples

### Create an Item List

```bash
curl -X POST http://localhost:3000/item-lists \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kitchen Supplies",
    "description": "Items needed for the kitchen"
  }'
```

### Add Items to List

```bash
curl -X POST http://localhost:3000/item-lists/{listId}/items \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"name": "Milk", "description": "Whole milk"},
      {"name": "Bread", "description": "Whole wheat bread"}
    ]
  }'
```

### Update Item Status

```bash
curl -X PATCH http://localhost:3000/item-lists/{listId}/items/Milk \
  -H "Content-Type: application/json" \
  -d '{"status": "Low"}'
```

### Filter Items by Status

```bash
curl "http://localhost:3000/item-lists/{listId}/items?statuses=Low,Out"
```

## Item Status Values

- `Ok` - Item is sufficiently stocked
- `Low` - Item is running low
- `Out` - Item is out of stock
- `Unknown` - Status is not determined

## HATEOAS Links

The API includes hypermedia links to help with navigation:

```json
{
  "id": "123",
  "name": "Kitchen Supplies",
  "links": [
    {
      "rel": "self",
      "href": "/item-lists/123",
      "method": "GET"
    },
    {
      "rel": "add-item",
      "href": "/item-lists/123/items",
      "method": "POST"
    },
    {
      "rel": "filter-low-stock",
      "href": "/item-lists/123/items?statuses=Low",
      "method": "GET"
    }
  ]
}
```

## Testing

Run the test suite:

```bash
npm test
```

Run integration tests:

```bash
npm run test:integration
```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode

### Code Structure

- **Commands**: Use DTOs for input validation and commands for business operations
- **Queries**: Separate DTOs for query parameters and responses
- **Validation**: Uses `class-validator` for request validation
- **Mapping**: Uses `class-transformer` for object mapping
- **Error Handling**: Custom domain exceptions with proper HTTP status codes

## Design Principles

- **CQS Compliance**: Commands return minimal data (IDs + HATEOAS links)
- **RESTful Design**: Proper HTTP methods and status codes
- **Type Safety**: Full TypeScript coverage with strict typing
- **Clean Architecture**: Clear separation between layers
- **Domain-Driven Design**: Rich domain models with business logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request
