'use server';

import { revalidatePath } from 'next/cache';
import { ItemSchema } from './definitions';
import { addItem } from './supabase';

export type ActionState = {
  errors?: {
    barcode?: string[];
    name?: string[];
    quantity?: string[];
  };
  message?: string | null;
  success: boolean;
};

const CreateItem = ItemSchema.omit({ id: true, createdAt: true });

export async function createItem(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = CreateItem.safeParse({
    barcode: formData.get('barcode'),
    name: formData.get('name'),
    quantity: formData.get('quantity'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to add item.',
      success: false,
    };
  }

  try {
    await addItem(validatedFields.data);
    revalidatePath('/');
    return { message: 'Item added successfully.', success: true, errors: {} };
  } catch (e) {
    return { message: 'Database Error: Failed to add item.', success: false };
  }
}
