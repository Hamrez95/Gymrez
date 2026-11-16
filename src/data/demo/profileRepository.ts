import { z } from 'zod';
import { profileSchema } from '../../shared/contracts/profile';
import type { ProfileRepository } from '../repository';
const profiles = z.array(profileSchema).parse([{ id: 'demo-a', displayName: 'ورزشکار نمونه الف', initial: 'A' }, { id: 'demo-b', displayName: 'ورزشکار نمونه ب', initial: 'B' }]);
export const demoProfileRepository: ProfileRepository = { mode: 'demo', listProfiles: async () => structuredClone(profiles) };
