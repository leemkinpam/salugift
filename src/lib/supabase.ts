import { createClient } from '@supabase/supabase-js';
import type { Item } from './definitions';

// These should be in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('id, barcode, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching items:', error);
    throw new Error('資料庫錯誤：讀取項目失敗。');
  }

  return data as Item[];
}

export async function addItem(item: { barcode: string }): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .insert([item])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // unique_violation
        throw new Error(`條碼 '${item.barcode}' 已存在。`);
    }
    console.error('Error adding item:', error);
    throw new Error('資料庫錯誤：新增項目失敗。');
  }
  return data as Item;
}

export async function deleteItem(id: number): Promise<void> {
  const { error } = await supabase
    .from('items')
    .delete()
    .match({ id: id });

  if (error) {
    console.error('Error deleting item:', error);
    throw new Error('資料庫錯誤：刪除項目失敗。');
  }
}
