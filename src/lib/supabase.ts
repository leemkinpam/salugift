import type { Item } from './definitions';

// This is a mock database. In a real app, you would initialize and use the Supabase client here.
// For example:
// import { createClient } from '@supabase/supabase-js'
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const initialItems: Item[] = [
  { id: '1', barcode: '9780201633610', name: 'Design Patterns', quantity: 1, createdAt: new Date('2023-10-20T10:00:00Z') },
  { id: '2', barcode: '9780134494166', name: 'Clean Architecture', quantity: 1, createdAt: new Date('2023-10-19T14:30:00Z') },
  { id: '3', barcode: '9780132350884', name: 'Clean Code', quantity: 2, createdAt: new Date('2023-10-18T09:00:00Z') },
];

let items: Item[] = [...initialItems];

export async function getItems(): Promise<Item[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // In a real app: const { data } = await supabase.from('items').select('*').order('createdAt', { ascending: false });
  return [...items].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
}

export async function addItem(item: Omit<Item, 'id' | 'createdAt'>): Promise<Item> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const newItem: Item = {
    ...item,
    id: String(Date.now()), // Use timestamp for unique ID in mock
    createdAt: new Date(),
  };
  items.unshift(newItem);
  // In a real app: const { data, error } = await supabase.from('items').insert([newItem]).select();
  return newItem;
}
