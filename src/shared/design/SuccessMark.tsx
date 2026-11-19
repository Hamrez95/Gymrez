import { motion, useReducedMotion } from 'motion/react';
export function SuccessMark() {
  const reduced = useReducedMotion();
  return <motion.svg className="pace-success-mark" viewBox="0 0 52 52" fill="none" aria-hidden="true" initial={reduced ? false : { scale: .85 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 18 }}>
    <circle cx="26" cy="26" r="24" fill="currentColor" fillOpacity=".12" stroke="currentColor" />
    <motion.path d="m15 26 8 8 15-17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .3 }} />
  </motion.svg>;
}
