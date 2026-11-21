import { useRef, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Toast } from '../../shared/design/components';
import { archiveKey, downloadProgram, importPreparedArchive, prepareArchive, type PreparedArchive, measurementKey, readArchive, selectCurrentProgram } from './localProgramArchive';
import { useAuth } from '../auth/useAuth';
import './localPrograms.css';

const sourceDateFormat = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeZone: 'UTC' });

export function LocalProgramsPage({ profileId, profileName }: { profileId: string; profileName: string }) {
  const { userId } = useAuth();
  const picker = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [preview, setPreview] = useState<PreparedArchive>();
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
    setPreview(undefined);
    try {
      setAttempted(false);
      setPreview(await prepareArchive(file, profileId, profileName, userId));
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : 'خواندن بایگانی ممکن نبود.', kind: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function confirmImport() {
    if (!preview || busy) return;
    setBusy(true);
    setNotice(undefined);
    try {
      setAttempted(true);
      const result = await importPreparedArchive(preview);
      setPreview(undefined);
      await queryClient.invalidateQueries({ queryKey: key });
      await queryClient.invalidateQueries({ queryKey: measurementKey(profileId) });
      const summary = [
        result.programs ? result.programs.toLocaleString('fa-IR') + ' برنامه' : '',
        result.measurements ? result.measurements.toLocaleString('fa-IR') + ' آنالیز بدن' : '',
      ].filter(Boolean).join(' و ');
      setNotice(summary ? { message: summary + (userId ? ' در دیتابیس ذخیره شد.' : ' در این مرورگر ثبت شد.'), kind: 'success' } : { message: 'برنامه‌های این فایل قبلاً وارد شده‌اند.', kind: 'info' });
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message + ' اگر بخشی ثبت شده باشد، تلاش دوباره آن را تکراری نمی‌کند.' : 'ذخیرهٔ بایگانی ممکن نبود.', kind: 'error' });
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
    <h1 id="title">برنامه‌های <bdi>{profileName}</bdi></h1>
    <p>{userId ? 'برنامه‌ها و فایل‌ها در فضای خصوصی مشترک ذخیره می‌شوند.' : 'این برنامه‌ها فقط در همین مرورگر ذخیره می‌شوند.'}</p>
    <input type="file" accept=".json,application/json" ref={picker} onChange={addArchive} hidden aria-label="فایل بایگانی Gymrez" />
    <Button type="button" onClick={() => picker.current?.click()} loading={busy} disabled={!!preview}>وارد کردن بایگانی</Button>
    {notice && <Toast {...notice} />}
    {preview && <section className="pace-import-preview" aria-labelledby="import-preview-title">
      <Card title="پیش‌نمایش بایگانی">
        <h2 id="import-preview-title">بررسی قبل از ذخیره</h2>
        <p>پروفایل مقصد: <bdi>{profileName}</bdi> · {userId ? 'فضای خصوصی ابری' : 'همین مرورگر'}</p>
        <p>{attempted ? 'ذخیره کامل نشده است؛ برای ادامه دوباره تأیید کن.' : 'هنوز چیزی ذخیره نشده است.'} برنامهٔ فعلی تغییر نمی‌کند؛ پس از ورود، برنامه را جداگانه انتخاب کن.</p>
        <p>{preview.documents.length.toLocaleString('fa-IR')} برنامه · {preview.measurements.length.toLocaleString('fa-IR')} اندازه‌گیری بدن</p>
        {preview.measurements.length > 0 && <p>اندازه‌ها نیز ثبت می‌شوند؛ اندازهٔ تکراری با همان تاریخ و منبع جایگزین نمی‌شود.</p>}
        <ol>{preview.documents.map((document, index) => <li key={index}>
          <strong>{document.title}</strong>
          <p><bdi>{document.filename}</bdi>{document.sourceDate && <> · {sourceDateFormat.format(new Date(document.sourceDate))}</>}</p>
          {document.training ? <>
            <p>{document.training.weeks.toLocaleString('fa-IR')} هفته · {document.training.days.length.toLocaleString('fa-IR')} جلسه در هفته</p>
            {document.training.days.map((day, dayIndex) => <details key={dayIndex}>
              <summary>{day.title} · {day.exercises.length.toLocaleString('fa-IR')} حرکت</summary>
              <ul>{day.exercises.map((exercise, exerciseIndex) => <li key={exerciseIndex}>{exercise.name} · {exercise.sets.toLocaleString('fa-IR')} ست × <bdi>{exercise.target}</bdi> · {exercise.rest.toLocaleString('fa-IR')} ثانیه استراحت</li>)}</ul>
            </details>)}
          </> : <p>فقط PDF؛ اجرای تعاملی برای این فایل موجود نیست.</p>}
        </li>)}</ol>
        <div className="pace-local-programs__actions">
          <Button type="button" onClick={() => void confirmImport()} loading={busy}>تأیید و ذخیرهٔ بایگانی</Button>
          <Button type="button" variant="quiet" onClick={() => setPreview(undefined)} disabled={busy}>انصراف</Button>
        </div>
      </Card>
    </section>}
    {archive.isPending && <p role="status">در حال خواندن بایگانی…</p>}
    {archive.isError && <p role="alert">خواندن بایگانی این مرورگر ممکن نبود.</p>}
    {archive.isSuccess && <>
      <div className="pace-local-programs" aria-label="برنامهٔ فعلی">
        <h2>برنامهٔ فعلی</h2>
        {current ? <Card title={current.title}>
          <div className="pace-local-programs__actions">{current.training && <Link className="pace-button pace-button--primary" to="/workout">دیدن جلسه‌ها و شروع تمرین</Link>}<Button type="button" variant="secondary" onClick={() => void downloadProgram(current).catch(error => setNotice({ message: error.message, kind: 'error' }))}>دریافت PDF</Button></div>
        </Card> : <p>هنوز برنامهٔ فعلی انتخاب نشده است.</p>}
      </div>
      <div className="pace-local-programs" aria-label="آرشیو برنامه‌ها">
        <h2>آرشیو برنامه‌ها</h2>
        {archived.length === 0 && <p>آرشیو این پروفایل خالی است.</p>}
        {archived.map(item => <Card title={item.title} key={item.id}>
          {item.sourceDate && <p>تاریخ فایل: {sourceDateFormat.format(new Date(item.sourceDate))}</p>}
          <div className="pace-local-programs__actions">
            <Button type="button" variant="secondary" onClick={() => void downloadProgram(item).catch(error => setNotice({ message: error.message, kind: 'error' }))}>دریافت PDF</Button>
            <Button type="button" variant="quiet" disabled={busy || !!preview} onClick={() => void activate(item.id)}>انتخاب به‌عنوان برنامهٔ فعلی</Button>
          </div>
        </Card>)}
      </div>
    </>}
  </section>;
}
