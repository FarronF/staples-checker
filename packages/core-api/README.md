# Core API

RESTful API for managing item lists and tracking inventory status.

## Local Development

```bash
cd packages/core-api
npm install
npm run dev
```

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

## Testing

```bash
npm test
npm run test:integration
```

## Bruno API Testing

Collection located at `external-tools/bruno-collection/Staples Checker/`
