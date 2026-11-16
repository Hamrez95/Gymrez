export type DataMode = { mode: 'demo' } | { mode: 'unavailable'; reason: string };
export function resolveDataMode(value: unknown): DataMode {
  if (value === undefined || value === '' || value === 'demo') return { mode: 'demo' };
  return { mode: 'unavailable', reason: 'اتصال واقعی هنوز پیاده نشده است. اطلاعاتی به سرور ارسال نمی‌شود.' };
}
