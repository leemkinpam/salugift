import { createClient } from '@supabase/supabase-js';
import type { Item } from './definitions';

// These environment variables are required.
// See the .env.local.example file.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the table name
const TABLE_NAME = 'items';

export async function getItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id, barcode, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error fetching items:', error);
    throw new Error('資料庫錯誤：無法取得項目。');
  }

  // Supabase returns `created_at` as a string, so we convert it to a Date object.
  // The `id` from Supabase is a number, so we convert it to a string for consistency in the app.
  return data.map(item => ({
    ...item,
    id: String(item.id),
    createdAt: new Date(item.created_at),
  }));
}

export async function getItemByBarcode(barcode: string): Promise<Item | undefined> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id, barcode, created_at')
    .eq('barcode', barcode)
    .limit(1)
    .single(); // .single() returns one object instead of an array

  if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
    console.error('Supabase error fetching item by barcode:', error);
    throw new Error('資料庫錯誤：無法依條碼取得項目。');
  }

  if (!data) {
    return undefined;
  }
  
  return {
      ...data,
      id: String(data.id),
      createdAt: new Date(data.created_at)
  };
}

export async function addItem(item: { barcode: string }): Promise<Item> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([{ barcode: item.barcode }])
    .select()
    .single();

  if (error) {
    console.error('Supabase error adding item:', error);
    // Handle unique constraint violation from the database
    if (error.code === '23505') { // unique_violation
        throw new Error('此條碼已存在。');
    }
    throw new Error('資料庫錯誤：新增項目失敗。');
  }

  return {
    ...data,
    id: String(data.id),
    createdAt: new Date(data.created_at),
  };
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase error deleting item:', error);
    throw new Error('資料庫錯誤：刪除項目失敗。');
  }
}
