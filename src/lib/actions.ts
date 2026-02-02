'use server';

import { revalidatePath } from 'next/cache';
import { ItemSchema } from './definitions';
import { addItem, deleteItem as dbDeleteItem } from './supabase';

export type ActionState = {
  errors?: {
    barcode?: string[];
  };
  message?: string | null;
  success: boolean;
};

const CreateItem = ItemSchema.omit({ id: true, createdAt: true });

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

  const { barcode } = validatedFields.data;

  try {
    // The addItem function will throw an error if the barcode is a duplicate,
    // which we'll catch below. This avoids a race condition.
    await addItem({ barcode });
    revalidatePath('/');
    return { message: '成功新增項目。', success: true, errors: {} };
  } catch (e) {
    if (e instanceof Error) {
        // Check for our specific duplicate barcode error message
        if (e.message.includes('此條碼已存在。')) {
            return {
                errors: { barcode: [e.message] },
                message: '新增項目失敗。',
                success: false,
            };
        }
        // Handle other database errors
        return { message: e.message, success: false };
    }
    // Handle non-Error objects
    return { message: '資料庫錯誤：新增項目失敗。', success: false };
  }
}

export async function deleteItem(id: string): Promise<{ message: string, success: boolean }> {
  try {
    await dbDeleteItem(id);
    revalidatePath('/');
    return { message: '已刪除項目。', success: true };
  } catch (e) {
    if (e instanceof Error) {
      return { message: e.message, success: false };
    }
    return { message: '資料庫錯誤：刪除項目失敗。', success: false };
  }
}
