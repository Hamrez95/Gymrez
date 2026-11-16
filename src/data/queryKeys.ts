export function profileKey(userId: string, householdId: string, profileId: string) {
  if (![userId, householdId, profileId].every(value => value.trim().length > 0)) throw new Error('A complete identity scope is required');
  return ['gymrez', userId, householdId, profileId] as const;
}
