import { ItemDto } from '../../dtos/queries/item-list-dtos/item-dto';

export function createItemListLinks(listId: string) {
  return [
    {
      rel: 'self',
      href: `/item-lists/${listId}`,
      method: 'GET',
    },
    {
      rel: 'update name or description',
      href: `/item-lists/${listId}`,
      method: 'PATCH',
    },
    {
      rel: 'delete',
      href: `/item-lists/${listId}`,
      method: 'DELETE',
    },
    {
      rel: 'get-items',
      href: `/item-lists/${listId}/items`,
      method: 'GET',
    },
    {
      rel: 'add-item',
      href: `/item-lists/${listId}/items`,
      method: 'POST',
    },
    {
      rel: 'filter-items',
      href: `/item-lists/${listId}/items{?statuses}`,
      method: 'GET',
      templated: true,
    },
    {
      rel: 'filter-low-stock',
      href: `/item-lists/${listId}/items?statuses=Low`,
      method: 'GET',
    },
    {
      rel: 'filter-low-and-out-of-stock',
      href: `/item-lists/${listId}/items?statuses=Low,Out`,
      method: 'GET',
    },
  ];
}

export function createItemLinks(itemListId: string, itemName: string) {
  const encodedItemName = encodeURIComponent(itemName);
  return [
    {
      rel: 'self',
      href: `/item-lists/${itemListId}/items/${encodedItemName}`,
      method: 'GET',
    },
    {
      rel: 'update-status',
      href: `/item-lists/${itemListId}/items/${encodedItemName}`,
      method: 'PATCH',
    },
    {
      rel: 'delete',
      href: `/item-lists/${itemListId}/items/${encodedItemName}`,
      method: 'DELETE',
    },
    {
      rel: 'parent-list',
      href: `/item-lists/${itemListId}`,
      method: 'GET',
    },
  ];
}

export function createItemWithLinksResponse(item: ItemDto, itemListId: string) {
  return {
    ...item,
    links: createItemLinks(itemListId, item.name),
  };
}
