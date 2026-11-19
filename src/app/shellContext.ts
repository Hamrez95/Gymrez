import { useOutletContext } from 'react-router-dom';
import type { Profile } from '../shared/contracts/profile';

export type ShellContext = {
  profiles: readonly Profile[];
  profilesPending: boolean;
  profilesError: boolean;
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
  userId: string | null;
};
export const useShellProfile = () => useOutletContext<ShellContext>();
