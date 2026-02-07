'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ItemSchema } from './definitions';
import { addItem, deleteItem as dbDeleteItem } from './supabase';

export type ActionState = {
  errors?: {
    barcode?: string[];
  };
  message?: string | null;
  success: boolean;
};

const CreateItem = ItemSchema.pick({ barcode: true });

export async function createItem(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = CreateItem.safeParse({
    barcode: formData.get('barcode'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '欄位缺失或無效。新增項目失敗。',
      success: false,
    };
  }

  try {
    await addItem(validatedFields.data);
    revalidatePath('/');
    return { message: '成功新增項目。', success: true, errors: {} };
  } catch (e: any) {
    return { message: e.message || '資料庫錯誤：新增項目失敗。', success: false };
  }
}

export async function deleteItem(id: number): Promise<{ message: string, success: boolean }> {
  try {
    await dbDeleteItem(id);
    revalidatePath('/');
    return { message: '已刪除項目。', success: true };
  } catch (e: any) {
    return { message: e.message || '資料庫錯誤：刪除項目失敗。', success: false };
  }
}
