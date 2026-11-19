import { z } from 'zod';
import { profileSchema } from '../../shared/contracts/profile';
import type { ProfileRepository } from '../repository';
const profiles = z.array(profileSchema).parse([
  { id: 'b907d9bb-0e8b-4a3f-964d-50d1c3330001', householdId: 'b907d9bb-0e8b-4a3f-964d-50d1c3330000', displayName: 'ورزشکار نمونه الف', initial: 'A' },
  { id: 'b907d9bb-0e8b-4a3f-964d-50d1c3330002', householdId: 'b907d9bb-0e8b-4a3f-964d-50d1c3330000', displayName: 'ورزشکار نمونه ب', initial: 'B' },
]);
export const demoProfileRepository: ProfileRepository = { mode: 'demo', listProfiles: async () => structuredClone(profiles) };
