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
      // If the barcode already exists, fetch the existing record to show its creation time.
      const { data: existingItem, error: fetchError } = await supabase
        .from('items')
        .select('created_at')
        .eq('barcode', item.barcode)
        .single();
      
      if (fetchError || !existingItem) {
        // Fallback message if we can't retrieve the original item
        throw new Error(`條碼 '${item.barcode}' 已重複核銷。`);
      }

      // Format the timestamp for the error message
      const redemptionTime = new Intl.DateTimeFormat('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date(existingItem.created_at));

      throw new Error(`條碼 '${item.barcode}' 已於 ${redemptionTime} 重複核銷。`);
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
