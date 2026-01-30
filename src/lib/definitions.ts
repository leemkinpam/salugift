import { z } from 'zod';

// Matches a 'U' followed by 12 digits.
const barcodeRegex = /^U\d{12}$/;

export const ItemSchema = z.object({
  id: z.string().optional(),
  barcode: z
    .string({ required_error: '條碼為必填項。' })
    .min(1, '條碼不得為空。')
    .regex(barcodeRegex, '條碼格式應為 U 開頭加上 12 位數字。'),
  createdAt: z.date().optional(),
});

export type Item = z.infer<typeof ItemSchema>;
