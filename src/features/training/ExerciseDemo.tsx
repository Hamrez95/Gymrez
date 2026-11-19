import { useId, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { exercisePattern } from './exercisePattern';
import type { Exercise } from './trainingModel';
import { Button } from '../../shared/design/components';
type Point = readonly [number, number];
type Pose = { head: Point; shoulder: Point; hip: Point; knee: Point; ankle: Point; elbow: Point; wrist: Point };
const stand: Pose = { head:[160,57], shoulder:[160,95], hip:[160,195], knee:[160,250], ankle:[160,307], elbow:[159,151], wrist:[160,209] };
const seated: Pose = { ...stand, head:[130,57], shoulder:[130,95], hip:[130,195], knee:[203,213], ankle:[211,296], elbow:[174,140], wrist:[230,148] };
const patterns = {
  curl: [stand, { ...stand, wrist:[188,112] }],
  press: [{ ...seated, head:[105,100], shoulder:[125,132], hip:[167,198], elbow:[177,142], wrist:[153,94] }, { ...seated, head:[105,100], shoulder:[125,132], hip:[167,198], elbow:[180,84], wrist:[220,45] }],
  row: [seated, { ...seated, elbow:[155,159], wrist:[133,157] }],
  pulldown: [{ ...seated, elbow:[169,56], wrist:[214,25] }, { ...seated, elbow:[170,157], wrist:[150,110] }],
  raise: [{ ...stand, elbow:[142,151], wrist:[135,209] }, { ...stand, elbow:[108,108], wrist:[54,116] }],
  fly: [{ ...stand, elbow:[125,135], wrist:[163,156] }, { ...stand, elbow:[104,112], wrist:[53,125] }],
  pushdown: [{ ...stand, wrist:[194,115] }, { ...stand, wrist:[167,211] }],
  overhead: [{ ...stand, elbow:[162,46], wrist:[122,88] }, { ...stand, elbow:[162,46], wrist:[162,8] }],
  squat: [stand, { ...stand, head:[178,101], shoulder:[165,139], hip:[133,220], knee:[203,252], ankle:[160,307], elbow:[207,172], wrist:[236,136] }],
  hinge: [stand, { ...stand, head:[257,142], shoulder:[226,167], hip:[145,202], knee:[164,255], elbow:[232,217], wrist:[232,267] }],
  legcurl: [{ ...seated, ankle:[280,225] }, { ...seated, ankle:[174,293] }],
  extension: [seated, { ...seated, ankle:[279,222] }],
  legpress: [{ ...seated, head:[92,160], shoulder:[115,191], hip:[167,251], knee:[190,167], ankle:[249,177] }, { ...seated, head:[92,160], shoulder:[115,191], hip:[167,251], knee:[225,190], ankle:[281,131] }],
  calf: [seated, { ...seated, ankle:[211,281] }],
  crunch: [{ ...stand, elbow:[198,89], wrist:[165,64] }, { ...stand, head:[216,124], shoulder:[202,158], elbow:[236,181], wrist:[225,141] }],
  pallof: [{ ...stand, elbow:[199,134], wrist:[165,128] }, { ...stand, elbow:[213,108], wrist:[263,119] }],
  prayer: [{ ...stand, elbow:[206,68], wrist:[248,34] }, { ...stand, elbow:[199,157], wrist:[209,213] }],
  knee: [{ ...stand, elbow:[160,56], wrist:[160,9] }, { ...stand, elbow:[160,56], wrist:[160,9], knee:[235,205], ankle:[240,265] }],
  carry: [stand, { ...stand, knee:[184,252], ankle:[201,304], wrist:[158,207] }],
  bike: [{ ...seated, head:[171,64], shoulder:[155,100], hip:[131,180], knee:[196,187], ankle:[204,263], elbow:[201,111], wrist:[244,124] }, { ...seated, head:[171,64], shoulder:[155,100], hip:[131,180], knee:[159,235], ankle:[220,258], elbow:[183,137], wrist:[220,163] }],
} satisfies Record<string, [Pose, Pose]>;

export function ExerciseDemo({ exercise }: { exercise: Exercise }) {
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState(0);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const id = useId();
  const pattern = exercisePattern(exercise.label);
  if (!pattern) return null;
  const poses = patterns[pattern];
  const looping = playing && visible && !reduced;
  const values = (key: keyof Pose, axis: 0 | 1) => looping ? [poses[0][key][axis], poses[1][key][axis], poses[0][key][axis]] : poses[phase][key][axis];
  const transition = { duration: looping ? 3.6 : .22, repeat: looping ? Infinity : 0, ease: 'easeInOut' as const };
  const limb = (from: keyof Pose, to: keyof Pose, width: number, color: string, key: string) => <motion.line key={key} x1={poses[0][from][0]} y1={poses[0][from][1]} x2={poses[0][to][0]} y2={poses[0][to][1]} stroke={color} strokeWidth={width} strokeLinecap="round" initial={false} animate={{ x1: values(from,0), y1: values(from,1), x2: values(to,0), y2: values(to,1) }} transition={transition} />;
  return <div className="pace-movement-demo" ref={ref}>
    <svg viewBox="0 0 330 340" role="img" aria-label={'نمای شماتیک ' + exercise.name}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b7d3ed" /><stop offset=".45" stopColor="#456784" /><stop offset="1" stopColor="#173550" /></linearGradient></defs>
      <ellipse cx="165" cy="323" rx="125" ry="7" fill="#02101e" />
      {['row','pulldown','legcurl','extension','calf'].includes(pattern) && <path d="M96 205h85m-67 0v105m56-105v105" stroke="#466178" strokeWidth="9" fill="none" strokeLinecap="round" />}
      {pattern === 'press' && <path d="m82 110 101 116m-42-50-35 134m69-97 33 97" stroke="#466178" strokeWidth="9" fill="none" strokeLinecap="round" />}
      {pattern === 'bike' && <g fill="none" stroke="#466178"><circle cx="255" cy="270" r="43" strokeWidth="8" /><circle cx="190" cy="270" r="14" strokeWidth="4" /><path d="m190 270-56-63m0 0h-26m26 0 41 23 80 40m-12-146 12 146" strokeWidth="7" /></g>}
      {pattern === 'knee' && <path d="M108 9h105" stroke="#597a96" strokeWidth="8" strokeLinecap="round" />}
      {limb('hip','knee',22,`url(#${id})`,'thigh')}{limb('knee','ankle',15,`url(#${id})`,'shin')}
      {limb('shoulder','hip',40,`url(#${id})`,'torso')}
      {limb('shoulder','hip',3,'#65a9e5','spine')}
      <motion.circle cx={poses[0].head[0]} cy={poses[0].head[1]} r="20" fill={`url(#${id})`} stroke="#a8c9e6" strokeWidth="1.5" initial={false} animate={{ cx: values('head',0), cy: values('head',1) }} transition={transition} />
      {limb('shoulder','elbow',16,`url(#${id})`,'upperarm')}{limb('elbow','wrist',12,'#75acdc','forearm')}
      <motion.circle cx={poses[0].elbow[0]} cy={poses[0].elbow[1]} r="5" fill="#b2ddff" initial={false} animate={{ cx: values('elbow',0), cy: values('elbow',1) }} transition={transition} />
      <motion.circle cx={poses[0].wrist[0]} cy={poses[0].wrist[1]} r="7" fill="#d3eaff" initial={false} animate={{ cx: values('wrist',0), cy: values('wrist',1) }} transition={transition} />
      {['curl','press','hinge','raise','carry'].includes(pattern) && <motion.g initial={false} animate={{ x: values('wrist',0), y: values('wrist',1) }} transition={transition}><path d="M-17 0h34m-15-9v18m30-18v18" stroke="#b9cee4" strokeWidth="7" strokeLinecap="round" /></motion.g>}
    </svg>
    <div className="pace-demo-controls"><span>نمای شماتیک مسیر حرکت</span><Button type="button" variant="secondary" onClick={() => setPlaying(!playing)} aria-pressed={playing && !reduced}>{playing && !reduced ? 'مکث نمایش' : 'نمایش حرکت'}</Button></div>
    {(reduced || !playing) && <div className="pace-demo-controls"><Button variant={phase === 0 ? 'primary' : 'secondary'} onClick={() => setPhase(0)}>وضعیت شروع</Button><Button variant={phase === 1 ? 'primary' : 'secondary'} onClick={() => setPhase(1)}>وضعیت پایان</Button></div>}
  </div>;
}
