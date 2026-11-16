import { z } from 'zod';
export const profileSchema = z.object({ id: z.string().min(1), displayName: z.string().min(1), initial: z.string().length(1) });
export type Profile = z.infer<typeof profileSchema>;
