import 'dotenv/config';
import express from 'express';
import 'reflect-metadata';
import { Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import { createItemListRouter } from './presentation/routers/item-list-router';
import { MongoItemListRepository } from './infrastructure/repositories/MongoItemListRepository';
import { ItemListController } from './presentation/controllers/item-list-controller';
import { ItemListService } from './core/application/item-list/ItemListService';

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const client = new MongoClient(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/staples-checker'
);
client
  .connect()
  .then(() => {
    console.log('Connected to MongoDB');

    const db = client.db('staples-checker');
    const itemListCollection = db.collection('item-lists');

    const itemListRepository = new MongoItemListRepository(itemListCollection);
    const itemListService = new ItemListService(itemListRepository);

    app.get('/', (_req: Request, res: Response) => {
      res.send('Hello, Express is installed!');
    });

    app.use(
      '/item-lists',
      createItemListRouter(new ItemListController(itemListService))
    );

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
