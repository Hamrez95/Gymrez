import Dexie, { type EntityTable, type Table } from 'dexie';
import { z } from 'zod';

type ProgramDocument = {
  profileId: string;
  id: string;
  title: string;
  filename: string;
  sourceDate?: string;
  pdf: Blob;
};

class ArchiveDatabase extends Dexie {
  documents!: Table<ProgramDocument, [string, string]>;
  selections!: EntityTable<{ profileId: string; currentId: string }, 'profileId'>;

  constructor() {
    super('gymrez-local-program-archive');
    this.version(1).stores({ documents: '[profileId+id], profileId', selections: 'profileId' });
  }
}

const db = new ArchiveDatabase();
const maxImportBytes = 32 * 1024 * 1024;
const bundleSchema = z.object({
  format: z.literal('gymrez-program-archive'),
  version: z.literal(1),
  profile: z.string().trim().min(1).max(100).optional(),
  currentIndex: z.number().int().nonnegative().optional(),
  programs: z.array(z.object({
    title: z.string().trim().min(1).max(200),
    filename: z.string().trim().min(1).max(250),
    sourceDate: z.iso.date().optional(),
    pdfBase64: z.string().min(1),
  })).min(1).max(60),
});

export const archiveKey = (profileId: string | undefined) => ['local-program-archive', profileId];

export function readArchive(profileId: string) {
  return db.transaction('r', db.documents, db.selections, async () => {
    const [documents, selection] = await Promise.all([
      db.documents.where('profileId').equals(profileId).toArray(),
      db.selections.get(profileId),
    ]);
    return {
      documents: documents.sort((a, b) => (b.sourceDate ?? '').localeCompare(a.sourceDate ?? '') || a.title.localeCompare(b.title, 'fa')),
      currentId: selection?.currentId,
    };
  });
}

export async function importArchive(file: File, profileId: string, profileName: string) {
  if (file.size > maxImportBytes) throw new Error('حجم فایل باید کمتر از ۳۲ مگابایت باشد.');
  let bundle: z.infer<typeof bundleSchema>;
  try {
    bundle = bundleSchema.parse(JSON.parse(await file.text()));
  } catch {
    throw new Error('فایل بایگانی Gymrez خوانده نشد.');
  }
  if (bundle.profile && bundle.profile !== profileName) throw new Error('این بایگانی برای پروفایل دیگری آماده شده است.');
  if (bundle.currentIndex !== undefined && bundle.currentIndex >= bundle.programs.length) {
    throw new Error('برنامهٔ فعلی در فایل بایگانی مشخص نیست.');
  }
  const documents = await Promise.all(bundle.programs.map(async ({ pdfBase64, ...entry }) => {
    let bytes: Uint8Array<ArrayBuffer>;
    try {
      bytes = Uint8Array.from(atob(pdfBase64), character => character.charCodeAt(0));
    } catch {
      throw new Error('یکی از فایل‌های PDF بایگانی معتبر نیست.');
    }
    if (new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') {
      throw new Error('یکی از فایل‌های PDF بایگانی معتبر نیست.');
    }
    const id = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('');
    return { ...entry, profileId, id, pdf: new Blob([bytes], { type: 'application/pdf' }) };
  }));
  return db.transaction('rw', db.documents, db.selections, async () => {
    let count = 0;
    const preferred = bundle.currentIndex === undefined ? undefined : documents[bundle.currentIndex];
    let preferredAdded = false;
    for (const document of documents) {
      if (await db.documents.get([profileId, document.id])) continue;
      await db.documents.add(document);
      count += 1;
      preferredAdded ||= document.id === preferred?.id;
    }
    if (preferred && (preferredAdded || !await db.selections.get(profileId))) {
      await db.selections.put({ profileId, currentId: preferred.id });
    }
    return count;
  });
}

export function selectCurrentProgram(profileId: string, id: string) {
  return db.transaction('rw', db.documents, db.selections, async () => {
    if (!await db.documents.get([profileId, id])) throw new Error('این برنامه پیدا نشد.');
    await db.selections.put({ profileId, currentId: id });
  });
}

export function downloadProgram(document: ProgramDocument) {
  const href = URL.createObjectURL(document.pdf);
  const link = window.document.createElement('a');
  link.href = href;
  link.download = document.filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 60_000);
}
