export type MovementPattern = 'curl' | 'press' | 'row' | 'pulldown' | 'raise' | 'fly' | 'pushdown' | 'overhead' | 'squat' | 'hinge' | 'legcurl' | 'extension' | 'legpress' | 'calf' | 'crunch' | 'pallof' | 'prayer' | 'knee' | 'carry' | 'bike';
export function exercisePattern(label: string): MovementPattern | undefined {
  const value = label.toLowerCase();
  if (value.includes('airbike')) return 'bike';
  if (value.includes('calf')) return 'calf';
  if (value.includes('leg curl')) return 'legcurl';
  if (value.includes('leg extension')) return 'extension';
  if (value.includes('leg press')) return 'legpress';
  if (value.includes('squat')) return 'squat';
  if (value.includes('deadlift')) return 'hinge';
  if (value.includes('pallof')) return 'pallof';
  if (value.includes('knee raise')) return 'knee';
  if (value.includes('carry')) return 'carry';
  if (value.includes('crunch')) return 'crunch';
  if (value.includes('prayer')) return 'prayer';
  if (value.includes('pulldown')) return 'pulldown';
  if (value.includes('row')) return 'row';
  if (value.includes('overhead') && value.includes('extension')) return 'overhead';
  if (value.includes('pushdown')) return 'pushdown';
  if (value.includes('curl')) return 'curl';
  if (value.includes('lateral raise')) return 'raise';
  if (value.includes('fly')) return 'fly';
  if (value.includes('press')) return 'press';
  return undefined;
}
