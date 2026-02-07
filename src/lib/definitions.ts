import { z } from 'zod';

// We're relaxing the barcode validation to allow more flexible formats like Code 39
// which can include letters, numbers, and some special characters.
// A simple non-empty string validation is sufficient for now.
export const ItemSchema = z.object({
  id: z.number(),
  barcode: z.string().min(1, { message: '條碼不能為空。' }),
  created_at: z.string(), // Supabase returns ISO string
});

export type Item = z.infer<typeof ItemSchema>;
