import { z } from 'zod';
export const profileSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  displayName: z.string().min(1),
  initial: z.string().length(1),
});
export type Profile = z.infer<typeof profileSchema>;
