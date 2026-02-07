import { z } from 'zod';

export const DownloadSchema = z.object({
  id: z.string(),
  filename: z.string(),
  createdAt: z.date(),
});

export type Download = z.infer<typeof DownloadSchema>;
