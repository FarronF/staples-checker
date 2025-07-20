import { Router, Request, Response } from 'express';
import { ItemListController } from '../controllers/item-list-controller';
import { CreateItemListDto } from '../dtos/commands/create-item-list-dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AddItemsToListDto } from '../dtos/commands/add-items-to-list-dto';
import { ItemDto } from '../dtos/queries/item-list-dtos/item-dto';
import { UpdateItemStatusDto } from '../dtos/item-list-dtos/update-item-status-dto';
import { NotFoundError } from '../../core/domain/errors/not-found-error';
import {
  createItemLinks,
  createItemListLinks,
  createItemWithLinksResponse,
} from './hateoas/item-list-links';
import { GetItemsByStatusQuery } from '../dtos/queries/item-list-dtos/get-items-by-status-query';
import { handleControllerError } from './utils/error-handler';

export function createItemListRouter(
  itemListController: ItemListController
): Router {
  const router = Router();

  router.get('/:id', async (req: Request, res: Response) => {
    const list = await itemListController.getItemListById(req.params.id);
    if (!list) {
      return res.status(404).send('List not found');
    }
    res.json({
      ...list,
      links: createItemListLinks(list.id),
    });
  });

  router.post('/', async (req: Request, res: Response) => {
    const dto = plainToInstance(CreateItemListDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.map((e) => e.toString()) });
    }

    const itemList = await itemListController.createItemList(dto);
    if (!itemList) {
      return res.status(500).send('Failed to create list');
    }

    res
      .status(201)
      .location(`/item-lists/${itemList.id}`)
      .json({
        id: itemList.id,
        links: createItemListLinks(itemList.id),
      });
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    const list = await itemListController.deleteItemListById(req.params.id);
    if (!list) {
      return res.status(404).send('List not found');
    }
    res.status(204).send();
  });

  router.use('/:listId/items', createItemsRouter(itemListController));

  return router;
}

function createItemsRouter(itemListController: ItemListController) {
  const itemsRouter = Router({ mergeParams: true });

  interface ListIdParams {
    listId: string;
  }

  itemsRouter.get('/', async (req: Request<ListIdParams>, res: Response) => {
    // Check if filtering by status
    if (req.query.statuses) {
      const query = plainToInstance(GetItemsByStatusQuery, req.query);
      const errors = await validate(query);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const items = await itemListController.getItemsByStatus(
        req.params.listId,
        query
      );
      if (items === null) {
        return res.status(404).send('List not found');
      }

      return res.json({
        items: items.map((item) =>
          createItemWithLinksResponse(item, req.params.listId)
        ),
        links: [
          {
            rel: 'parent-list',
            href: `/item-lists/${req.params.listId}`,
            method: 'GET',
          },
        ],
      });
    }

    // Default: get all items
    const items = await itemListController.getItemListItems(req.params.listId);
    if (!items) {
      return res.status(404).send('List not found');
    }
    res.json(items);
  });

  itemsRouter.post('/', async (req: Request<ListIdParams>, res: Response) => {
    const dto = plainToInstance(AddItemsToListDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const addedItems = await itemListController.addItemsToList(
      req.params.listId,
      dto.items
    );
    if (!addedItems) {
      return res.status(404).send('List not found');
    }

    res.status(201).json({
      items: addedItems.map((item) => ({
        name: item.name,
        links: createItemLinks(req.params.listId, item.name),
      })),
      parentList: {
        rel: 'parent-list',
        href: `/item-lists/${req.params.listId}`,
        method: 'GET',
      },
    });
  });

  itemsRouter.get(
    '/:itemName',
    async (
      req: Request<ListIdParams & { itemName: string }>,
      res: Response
    ) => {
      const item = await itemListController.getItemByName(
        req.params.listId,
        decodeURIComponent(req.params.itemName)
      );
      if (!item) {
        return res.status(404).send('Item not found');
      }

      res.json(createItemWithLinksResponse(item, req.params.listId));
    }
  );

  itemsRouter.patch(
    '/:itemName',
    async (
      req: Request<ListIdParams & { itemName: string }>,
      res: Response
    ) => {
      const dto = plainToInstance(UpdateItemStatusDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      try {
        const updatedItem = await itemListController.updateItemStatus(
          req.params.listId,
          decodeURIComponent(req.params.itemName),
          dto
        );

        res.json({
          name: updatedItem.name,
          links: [createItemLinks(req.params.listId, updatedItem.name)],
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          return res.status(404).send(error.message);
        }
        return res.status(500).send('Failed to update item status');
      }
    }
  );

  itemsRouter.delete(
    '/:itemName',
    async (
      req: Request<ListIdParams & { itemName: string }>,
      res: Response
    ) => {
      try {
        const deletedItem = await itemListController.deleteItemFromList(
          req.params.listId,
          decodeURIComponent(req.params.itemName)
        );

        if (!deletedItem) {
          return res.status(404).send('Item not found');
        }

        res.status(204).send();
      } catch (error) {
        if (error instanceof NotFoundError) {
          return res.status(404).send(error.message);
        }
        return res.status(500).send('Failed to delete item');
      }
    }
  );

  return itemsRouter;
}
