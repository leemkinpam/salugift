import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.string().optional(),
  barcode: z
    .string({ required_error: '條碼為必填項。' })
    .min(1, '條碼不得為空。'),
  createdAt: z.date().optional(),
});

export type Item = z.infer<typeof ItemSchema>;
