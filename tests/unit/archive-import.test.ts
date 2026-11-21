import 'fake-indexeddb/auto';
import { describe, expect, it, vi } from 'vitest';
vi.mock('../../src/data/supabase/client', () => ({ supabaseClient: null }));
import { importPreparedArchive, prepareArchive, readArchive, selectCurrentProgram } from '../../src/features/programs/localProgramArchive';

function archive(profile: string, programs: unknown[]) {
  const blob = new Blob([JSON.stringify({ format: 'gymrez-program-archive', version: 1, profile, currentIndex: 0, programs })]);
  return { size: blob.size, text: () => blob.text() } as File;
}
function program(title: string) {
  return { title, filename: title + '.pdf', pdfBase64: btoa('%PDF-1.4\n' + title) };
}

describe('archive preview and explicit activation', () => {
  it('prepares without writing, retries without duplicates, and preserves the active plan', async () => {
    const id = 'preview-' + crypto.randomUUID();
    const first = await prepareArchive(archive('Test', [program('First')]), id, 'Test');
    expect((await readArchive(id)).documents).toHaveLength(0);
    expect(await importPreparedArchive(first)).toEqual({ programs: 1, measurements: 0 });
    expect((await readArchive(id)).currentId).toBeUndefined();
    await selectCurrentProgram(id, first.documents[0].id);
    const second = await prepareArchive(archive('Test', [program('Second')]), id, 'Test');
    await importPreparedArchive(second);
    expect(await importPreparedArchive(second)).toEqual({ programs: 0, measurements: 0 });
    expect((await readArchive(id)).documents).toHaveLength(2);
    expect((await readArchive(id)).currentId).toBe(first.documents[0].id);
  });
  it('rejects a mixed valid/corrupt bundle before any write', async () => {
    const id = 'invalid-' + crypto.randomUUID();
    await expect(prepareArchive(archive('Test', [program('Valid'), { ...program('Bad'), pdfBase64: btoa('not a pdf') }]), id, 'Test')).rejects.toThrow('PDF');
    expect((await readArchive(id)).documents).toHaveLength(0);
  });
  it('rejects wrong profile, unsupported version, and a changed account', async () => {
    const file = archive('Test', [program('Test')]);
    await expect(prepareArchive(file, 'test', 'Other')).rejects.toThrow('پروفایل دیگری');
    const badVersion = { size: 1, text: async () => JSON.stringify({ format: 'gymrez-program-archive', version: 2 }) } as File;
    await expect(prepareArchive(badVersion, 'test', 'Test')).rejects.toThrow();
    const prepared = await prepareArchive(file, 'test', 'Test', 'previous-user');
    await expect(importPreparedArchive(prepared)).rejects.toThrow('نشست تغییر');
    expect((await readArchive('test')).documents).toHaveLength(0);
  });
});
