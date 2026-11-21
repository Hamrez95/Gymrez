import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { Button } from '../../shared/design/components';
import type { ExerciseMedia } from './exerciseMedia';

export function AnatomicalDemo({ media, name }: { media: ExerciseMedia; name: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const visible = useInView(container);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [speed, setSpeed] = useState('1');

  useEffect(() => {
    const element = video.current;
    if (!visible || reduced) element?.pause();
    return () => { element?.pause(); };
  }, [visible, reduced]);

  async function toggle() {
    if (!video.current) return;
    if (video.current.paused) {
      try { await video.current.play(); } catch { setPlaying(false); }
    } else video.current.pause();
  }

  return <div className="pace-movement-demo pace-anatomical-demo" ref={container}>
    {failed ? <p role="status">نمایش حرکت دریافت نشد؛ اتصال را بررسی کن و صفحه را دوباره باز کن.</p> : <video
      ref={video} src={media.video} poster={media.poster} controls playsInline muted loop preload="none"
      aria-label={'نمای آناتومیک ' + name}
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)}
    />}
    <p className="pace-anatomical-demo__description">{media.description}</p>
    {!failed && <div className="pace-demo-controls">
      <Button type="button" variant="secondary" onClick={() => void toggle()} aria-pressed={playing}>{playing ? 'مکث نمایش' : 'نمایش حرکت'}</Button>
      <label>سرعت نمایش <select aria-label="سرعت نمایش حرکت" value={speed} onChange={event => {
        const value = event.target.value;
        setSpeed(value);
        if (video.current) video.current.playbackRate = Number(value);
      }}><option value="0.5">۰٫۵×</option><option value="1">۱×</option><option value="1.5">۱٫۵×</option></select></label>
    </div>}
    <small className="pace-anatomical-demo__source">{media.source}</small>
  </div>;
}
