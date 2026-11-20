import Dexie, { type Table } from 'dexie';
import type { Profile } from '../../shared/contracts/profile';
import type { Measurement, Workout } from '../../features/training/trainingModel';

export type Identity = { userId: string; householdId: string; profileId: string };
export const scopeKey = (identity: Identity) => JSON.stringify([identity.userId, identity.householdId, identity.profileId]);
export type Operation = {
  id: string; scope: string; entity: string; created: number; attempts: number; nextAttempt: number;
  state: 'pending' | 'error' | 'conflict'; message?: string;
} & ({ kind: 'start' | 'update' | 'cancel'; workout: Workout; expectedRevision: number }
  | { kind: 'measurement'; measurement: Measurement; measurementId: string });
export type CacheRow = { key: string; scope: string; value: unknown };

class SyncDatabase extends Dexie {
  cache!: Table<CacheRow, string>;
  operations!: Table<Operation, string>;
  profiles!: Table<{ userId: string; profiles: readonly Profile[] }, string>;
  constructor() {
    super('gymrez-private-sync');
    this.version(1).stores({ cache: 'key, scope', operations: 'id, scope, [scope+entity]', profiles: 'userId' });
  }
}
export const syncDb = new SyncDatabase();
export class CloudError extends Error {
  constructor(message: string, public readonly kind: 'transient' | 'auth' | 'conflict' | 'invalid') { super(message); }
}
export function cloudError(error: { code?: string; message?: string; status?: number }, message: string): CloudError {
  const kind = ['40001', 'P0001', '23505'].includes(error.code ?? '') ? 'conflict'
    : ['42501', 'PGRST301', 'PGRST302', 'PGRST303'].includes(error.code ?? '') || error.status === 401 || error.status === 403 ? 'auth'
    : !error.code || error.status === 429 || (error.status ?? 0) >= 500 || error.code.startsWith('08') || error.code === '57P03' ? 'transient' : 'invalid';
  return new CloudError(message, kind);
}
export async function cachedProfiles(userId: string) {
  return (await syncDb.profiles.get(userId))?.profiles;
}
export async function rememberProfiles(userId: string, profiles: readonly Profile[]) {
  await syncDb.profiles.put({ userId, profiles });
}
export async function hasPendingWrites(userId: string) {
  return (await syncDb.operations.toArray()).some(row => JSON.parse(row.scope)[0] === userId);
}
export async function clearPrivateCache(userId: string) {
  // Explicit logout is allowed only after its queue has been dealt with.
  await syncDb.transaction('rw', syncDb.cache, syncDb.profiles, syncDb.operations, async () => {
    if (await hasPendingWrites(userId)) throw new Error('تغییرات ارسال‌نشده داری؛ پیش از خروج آن‌ها را همگام کن.');
    const rows = await syncDb.cache.toArray();
    await syncDb.cache.bulkDelete(rows.filter(row => JSON.parse(row.scope)[0] === userId).map(row => row.key));
    await syncDb.profiles.delete(userId);
  });
}
