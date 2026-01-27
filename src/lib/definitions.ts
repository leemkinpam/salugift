import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.string().optional(),
  barcode: z.string({ required_error: '條碼為必填項。' })
    .regex(/^U\d{12}$/, '條碼格式應為 U 開頭加上 12 位數字。'),
  createdAt: z.date().optional(),
});

export type Item = z.infer<typeof ItemSchema>;
