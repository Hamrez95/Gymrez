import machineCurlVideo from './assets/demos/seated-machine-curl.mp4';
import machineCurlPoster from './assets/demos/seated-machine-curl-start.webp';

export type ExerciseMedia = {
  video: string;
  poster: string;
  source: string;
  description: string;
};

const machineCurl: ExerciseMedia = {
  video: machineCurlVideo,
  poster: machineCurlPoster,
  source: 'FitnessProgrammer.com · نمونهٔ ارسالی کاربر',
  description: 'جلو بازو نشسته با دستگاه؛ عضلات جلو بازو با رنگ قرمز مشخص شده‌اند.',
};

// Exact variants only: matching a muscle or generic "curl" would show the wrong equipment.
const mediaByLabel: Readonly<Record<string, ExerciseMedia>> = {
  'seated machine biceps curl': machineCurl,
  'seated machine curl': machineCurl,
  'machine biceps curl': machineCurl,
  'machine curl': machineCurl,
  'lever seated curl': machineCurl,
};

export function exerciseMedia(label: string): ExerciseMedia | undefined {
  return mediaByLabel[label.trim().replace(/\s+/g, ' ').toLowerCase()];
}
