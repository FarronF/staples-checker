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

- Node.js (v20+)
- MongoDB
- npm or yarn

### Quick Start with Docker (Recommended)

The fastest way to get started is using Docker Compose:

1. Clone the repository:

```bash
git clone <repository-url>
cd staples-checker
```

2. Start the application with Docker Compose:

```bash
docker-compose up --build -d
```

This will:

- Build the application Docker image
- Start MongoDB in a container
- Start the API server on port 3000
- Run everything in the background (`-d` flag)

3. Test the API:

```bash
curl http://localhost:3000
# Should return: "Hello, Express is installed!"
```

4. View logs (optional):

```bash
docker-compose logs -f app
```

5. Stop the application:

```bash
docker-compose down
```

6. Stop and remove volumes (to reset database):

```bash
docker-compose down -v
```

### Manual Installation

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

### Unit and Integration Tests

Run the test suite:

```bash
npm test
```

Run integration tests:

```bash
npm run test:integration
```

### API Testing with Bruno

This repository includes a Bruno collection for testing the API endpoints. Bruno is a fast and lightweight API client that can be used as an alternative to Postman.

#### Setup Bruno

1. Install Bruno from [https://www.usebruno.com/](https://www.usebruno.com/)

2. Open Bruno and import the collection:
   - Click "Open Collection"
   - Navigate to `external/bruno-collection/Staples Checker`
   - Select the folder to import the collection

#### Using the Bruno Collection

The collection includes tests for all major API endpoints:

- **Create Item List** - Creates a new item list and stores the ID in a variable
- **Get Item List** - Retrieves an item list by ID
- **Delete Item List** - Deletes an item list
- **Add Item** - Adds items to a list
- **Get Items** - Retrieves all items from a list
- **Filter Items** - Filters items by status (Low, Out)
- **Update Item List** - Updates an item's status

#### Running the Tests

1. Start your application:

   ```bash
   docker-compose up --build -d
   ```

2. In Bruno, run the requests in sequence:
   - Start with "Create Item List" to generate an `item-list-id` variable
   - The other requests will use this variable automatically
   - You can run individual requests or the entire collection

#### Variables

The Bruno collection uses the following variables:

- `item-list-id` - Automatically set when creating an item list
- Base URL is set to `http://localhost:3000`

#### Collection Structure

```
external/bruno-collection/Staples Checker/
├── bruno.json              # Collection configuration
├── Create Item List.bru     # POST /item-lists
├── Get Item List.bru        # GET /item-lists/{id}
├── Delete Item List.bru     # DELETE /item-lists/{id}
├── Add Item.bru             # POST /item-lists/{id}/items
├── Get Items.bru            # GET /item-lists/{id}/items
├── Filter Items.bru         # GET /item-lists/{id}/items?statuses=Low,Out
└── Update Item List.bru     # PATCH /item-lists/{id}/items/{itemName}
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
