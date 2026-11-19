import { motion, useReducedMotion } from 'motion/react';
import { muscleLabels, type Muscle } from './trainingModel';

type Region = { muscle: Muscle; path: string; mirror?: boolean };
const silhouette = 'M60 7C48 7 43 18 47 33L51 39L49 46C42 50 29 48 23 59C17 70 18 86 15 97L9 123L8 143L14 148L20 141L24 121L34 93L36 81L41 109L38 131L36 150L40 181L42 195L42 221L38 237L43 243L53 243L57 234L56 216L59 149H61L64 216L63 234L67 243L77 243L82 237L78 221L78 195L80 181L84 150L82 131L79 109L84 81L86 93L96 121L100 141L106 148L112 143L111 123L105 97C102 86 103 70 97 59C91 48 78 50 71 46L69 39L73 33C77 18 72 7 60 7Z';
const front: Region[] = [
  { muscle: 'chest', path: 'M57 53C48 50 41 52 32 60L35 72C42 78 51 77 57 72Z', mirror: true },
  { muscle: 'shoulder', path: 'M32 55C25 54 21 63 21 77L25 82L33 73L36 64Z', mirror: true },
  { muscle: 'biceps', path: 'M29 75L24 81L20 101L24 108L32 91L33 79Z', mirror: true },
  { muscle: 'forearm', path: 'M22 103L17 103L12 125L13 135L17 132L24 111Z', mirror: true },
  { muscle: 'abs', path: 'M51 78L58 77V85L51 86ZM51 89L58 88V96L51 96ZM52 99L58 99V119L54 116Z', mirror: true },
  { muscle: 'obliques', path: 'M38 76L49 80L50 104L45 112L41 101Z', mirror: true },
  { muscle: 'quads', path: 'M42 116L53 125L57 145L53 173L49 183L43 173L39 146Z', mirror: true },
  { muscle: 'calves', path: 'M43 192L51 192L52 213L47 227L45 220Z', mirror: true },
];
const back: Region[] = [
  { muscle: 'upperBack', path: 'M58 45L49 48L36 54L39 66L46 67L58 86Z', mirror: true },
  { muscle: 'rearDelt', path: 'M35 55C28 51 21 61 21 75L27 81L36 68Z', mirror: true },
  { muscle: 'triceps', path: 'M26 81L21 82L18 99L22 108L30 96L33 78Z', mirror: true },
  { muscle: 'forearm', path: 'M19 104L15 110L11 131L15 135L22 122L25 110Z', mirror: true },
  { muscle: 'lats', path: 'M37 70L44 69L57 89L56 110L49 106L41 90Z', mirror: true },
  { muscle: 'glutes', path: 'M57 111L46 110L40 119L39 132L46 140L56 138L59 126Z', mirror: true },
  { muscle: 'hamstrings', path: 'M41 138L55 142L56 157L51 177L46 184L41 173L38 148Z', mirror: true },
  { muscle: 'calves', path: 'M45 188L54 190L56 199L51 218L48 228L44 217L43 200Z', mirror: true },
];

export function MuscleMap({ primary, assists }: { primary: Muscle[]; assists: Muscle[] }) {
  const reduce = useReducedMotion();
  return <figure className="pace-muscle-map">
    <div className="pace-muscle-map__views">
      {[{ label: 'نمای روبه‌رو', regions: front }, { label: 'نمای پشت', regions: back }].map(({ label, regions }) => (
        <div key={label}><svg viewBox="0 0 120 250" role="img" aria-label={label}>
          <path className="pace-anatomy-base" d={silhouette} />
          <path className="pace-anatomy-landmark" d="M53 45L60 51L67 45M60 54V125M42 183L49 188L54 184M66 184L71 188L78 183" />
          {regions.map(({ muscle, path, mirror }) => {
            const level = primary.includes(muscle) ? 'primary' : assists.includes(muscle) ? 'assist' : 'base';
            return <motion.g key={muscle} className={'pace-anatomy-region--' + level} initial={false} animate={{ opacity: level === 'base' ? 0.63 : 1 }} transition={{ duration: reduce ? 0 : 0.26 }}>
              <path d={path} />
              {mirror && <path d={path} transform="translate(120 0) scale(-1 1)" />}
            </motion.g>;
          })}
        </svg><span>{label}</span></div>
      ))}
    </div>
    <figcaption>
      {primary.length ? <><p><i className="pace-dot" /> اصلی · {primary.map(m => muscleLabels[m]).join('، ')}</p>
        {assists.length > 0 && <p><i className="pace-dot pace-dot--assist" /> کمکی · {assists.map(m => muscleLabels[m]).join('، ')}</p>}</> : <p>هوازی · فشار تمرین به‌شکل عضلهٔ هدف نمایش داده نمی‌شود.</p>}
    </figcaption>
  </figure>;
}
