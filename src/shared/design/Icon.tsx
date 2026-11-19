import type { CSSProperties } from 'react';
export type IconName = 'home' | 'calendar' | 'dumbbell' | 'chart' | 'user' | 'check' | 'timer' | 'arrow' | 'trophy' | 'download';
const paths: Record<IconName, string> = {
  home: 'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  calendar: 'M4 5h16v16H4ZM7 2v6M17 2v6M4 10h16M8 14h2M14 14h2M8 18h2',
  dumbbell: 'M3 8v8M6 5v14M18 5v14M21 8v8M6 12h12',
  chart: 'M5 20V11M12 20V4M19 20v-6',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2Z',
  check: 'm5 12 4 4L19 6', timer: 'M9 2h6M12 5a8 8 0 1 1-8 8 8 8 0 0 1 8-8ZM12 8v5l3 2M18 5l2-2',
  arrow: 'M19 12H5m6-6-6 6 6 6', trophy: 'M7 3h10v7a5 5 0 0 1-10 0ZM7 5H3v3a4 4 0 0 0 4 4M17 5h4v3a4 4 0 0 1-4 4M12 15v6M8 21h8',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
};
export function Icon({ name, size = 22, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>;
}
