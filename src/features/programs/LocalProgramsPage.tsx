import { useRef, useState, type ChangeEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Toast } from '../../shared/design/components';
import { archiveKey, downloadProgram, importArchive, readArchive, selectCurrentProgram } from './localProgramArchive';
import './localPrograms.css';

const sourceDateFormat = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeZone: 'UTC' });

export function LocalProgramsPage({ profileId, profileName }: { profileId: string; profileName: string }) {
  const picker = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ message: string; kind: 'success' | 'error' | 'info' }>();
  const key = archiveKey(profileId);
  const archive = useQuery({ queryKey: key, queryFn: () => readArchive(profileId) });
  const current = archive.data?.documents.find(item => item.id === archive.data?.currentId);
  const archived = archive.data?.documents.filter(item => item.id !== current?.id) ?? [];

  async function addArchive(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setNotice(undefined);
    try {
      const count = await importArchive(file, profileId, profileName);
      await queryClient.invalidateQueries({ queryKey: key });
      setNotice(count ? { message: `${count.toLocaleString('fa-IR')} برنامه در این مرورگر ثبت شد.`, kind: 'success' } : { message: 'برنامه‌های این فایل قبلاً وارد شده‌اند.', kind: 'info' });
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : 'ذخیرهٔ بایگانی ممکن نبود.', kind: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function activate(id: string) {
    setBusy(true);
    setNotice(undefined);
    try {
      await selectCurrentProgram(profileId, id);
      await queryClient.invalidateQueries({ queryKey: key });
      setNotice({ message: 'برنامهٔ فعلی تغییر کرد.', kind: 'success' });
    } catch {
      setNotice({ message: 'تغییر برنامهٔ فعلی ممکن نبود.', kind: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return <section className="foundation-content" aria-labelledby="title">
    <h1 id="title">برنامه‌های <bdi>{profileName}</bdi><span aria-hidden="true"> //</span></h1>
    <p>این برنامه‌ها فقط در همین مرورگر ذخیره می‌شوند.</p>
    <input type="file" accept=".json,application/json" ref={picker} onChange={addArchive} hidden aria-label="فایل بایگانی Gymrez" />
    <Button type="button" onClick={() => picker.current?.click()} loading={busy}>وارد کردن بایگانی</Button>
    {notice && <Toast {...notice} />}
    {archive.isPending && <p role="status">در حال خواندن بایگانی…</p>}
    {archive.isError && <p role="alert">خواندن بایگانی این مرورگر ممکن نبود.</p>}
    {archive.isSuccess && <>
      <div className="pace-local-programs" aria-label="برنامهٔ فعلی">
        <h2>برنامهٔ فعلی</h2>
        {current ? <Card title={current.title}>
          <Button type="button" variant="secondary" onClick={() => downloadProgram(current)}>دریافت PDF</Button>
        </Card> : <p>هنوز برنامهٔ فعلی انتخاب نشده است.</p>}
      </div>
      <div className="pace-local-programs" aria-label="آرشیو برنامه‌ها">
        <h2>آرشیو برنامه‌ها</h2>
        {archived.length === 0 && <p>آرشیو این پروفایل خالی است.</p>}
        {archived.map(item => <Card title={item.title} key={item.id}>
          {item.sourceDate && <p>تاریخ فایل: {sourceDateFormat.format(new Date(item.sourceDate))}</p>}
          <div className="pace-local-programs__actions">
            <Button type="button" variant="secondary" onClick={() => downloadProgram(item)}>دریافت PDF</Button>
            <Button type="button" variant="quiet" disabled={busy} onClick={() => void activate(item.id)}>انتخاب به‌عنوان برنامهٔ فعلی</Button>
          </div>
        </Card>)}
      </div>
    </>}
  </section>;
}
