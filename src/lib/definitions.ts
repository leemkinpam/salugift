import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.string().optional(),
  barcode: z.string({ required_error: 'Barcode is required.' }).min(1, 'Barcode cannot be empty.'),
  name: z.string({ required_error: 'Product name is required.' }).min(1, 'Product name cannot be empty.'),
  quantity: z.coerce.number({ invalid_type_error: 'Quantity must be a number.' }).int().positive('Quantity must be a positive number.'),
  createdAt: z.date().optional(),
});

export type Item = z.infer<typeof ItemSchema>;
