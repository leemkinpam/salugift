import type { Item } from './definitions';

// This is a mock database. In a real app, you would initialize and use the Supabase client here.
const initialItems: Item[] = [
    { id: '1', barcode: 'U159001922437', createdAt: new Date('2026-01-27T09:18:11Z') },
    { id: '2', barcode: 'U159001234567', createdAt: new Date('2026-01-26T14:30:00Z') },
    { id: '3', barcode: 'U159009876543', createdAt: new Date('2026-01-25T11:00:00Z') },
];

let items: Item[] = [...initialItems];

export async function getItems(): Promise<Item[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...items].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
}

export async function addItem(item: Omit<Item, 'id' | 'createdAt'>): Promise<Item> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const newItem: Item = {
    ...item,
    id: String(Date.now()),
    createdAt: new Date(),
  };
  items.unshift(newItem);
  return newItem;
}

export async function deleteItem(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    items = items.filter(item => item.id !== id);
}
