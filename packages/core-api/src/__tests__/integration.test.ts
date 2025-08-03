import request from 'supertest';
import express from 'express';
import { MongoClient, Db, Collection } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ItemListService } from '../core/application/item-list/ItemListService';
import { ItemStatus } from '../core/domain/item-list/item-status';
import { MongoItemListRepository } from '../infrastructure/repositories/MongoItemListRepository';
import { ItemListController } from '../presentation/controllers/item-list-controller';
import { createItemListRouter } from '../presentation/routers/item-list-router';

describe('ItemList Integration Tests', () => {
  let app: express.Application;
  let mongoServer: MongoMemoryServer;
  let mongoClient: MongoClient;
  let db: Db;
  let collection: Collection;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();

    db = mongoClient.db('test-staples-checker');
    collection = db.collection('item-lists');

    const repository = new MongoItemListRepository(collection);
    const service = new ItemListService(repository);
    const controller = new ItemListController(service);

    app = express();
    app.use(express.json());
    app.use('/item-lists', createItemListRouter(controller));
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await collection.deleteMany({});
  });

  describe('Full ItemList Workflow', () => {
    it('should create, retrieve, add items, and delete item list', async () => {
      // Create item list
      const createResponse = await request(app)
        .post('/item-lists')
        .send({
          name: 'Kitchen Supplies',
          description: 'List of kitchen items',
        })
        .expect(201);

      const listId = createResponse.body.id;

      // Get item list
      const getResponse = await request(app)
        .get(`/item-lists/${listId}`)
        .expect(200);

      expect(getResponse.body.name).toBe('Kitchen Supplies');

      // Add items to list
      const addItemsResponse = await request(app)
        .post(`/item-lists/${listId}/items`)
        .send({
          items: [
            { name: 'Milk', description: 'Whole milk' },
            { name: 'Bread', description: 'Whole wheat' },
          ],
        })
        .expect(201);

      console.log('Add Items Response:', addItemsResponse.body);
      expect(addItemsResponse.body.items).toHaveLength(2);
      expect(addItemsResponse.body.items[0].name).toBe('Milk');
      expect(addItemsResponse.body.items[1].name).toBe('Bread');

      // Get specific item
      const getItemResponse = await request(app)
        .get(`/item-lists/${listId}/items/Milk`)
        .expect(200);

      expect(getItemResponse.body.name).toBe('Milk');
      expect(getItemResponse.body.links).toBeDefined();

      // Update item status
      const updateStatusResponse = await request(app)
        .patch(`/item-lists/${listId}/items/Milk`)
        .send({ status: ItemStatus.Low })
        .expect(200);

      // Filter items by status
      const filterResponse = await request(app)
        .get(`/item-lists/${listId}/items?statuses=${ItemStatus.Low}`)
        .expect(200);

      expect(filterResponse.body.items).toHaveLength(1);
      expect(filterResponse.body.items[0].name).toBe('Milk');

      // Delete item
      await request(app).delete(`/item-lists/${listId}/items/Milk`).expect(204);

      // Verify item is deleted
      await request(app).get(`/item-lists/${listId}/items/Milk`).expect(404);

      // Delete item list
      await request(app).delete(`/item-lists/${listId}`).expect(204);

      // Verify list is deleted
      await request(app).get(`/item-lists/${listId}`).expect(404);
    });

    it('should handle duplicate item names', async () => {
      // Create item list
      const createResponse = await request(app)
        .post('/item-lists')
        .send({ name: 'Test List' })
        .expect(201);

      const listId = createResponse.body.id;

      // Add first item
      await request(app)
        .post(`/item-lists/${listId}/items`)
        .send({
          items: [{ name: 'Duplicate Item' }],
        })
        .expect(201);

      // Try to add duplicate item
      await request(app)
        .post(`/item-lists/${listId}/items`)
        .send({
          items: [{ name: 'Duplicate Item' }],
        })
        .expect(500); // Should fail due to duplicate name validation
    });
  });
});
