import { useOutletContext } from 'react-router-dom';

export type ShellContext = { profileId: string; setProfileId: (profileId: string) => void };
export const useShellProfile = () => useOutletContext<ShellContext>();
