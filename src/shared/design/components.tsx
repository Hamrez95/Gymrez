import { useEffect, useId, useRef, type ButtonHTMLAttributes, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet';
  loading?: boolean;
};

export function Button({ variant = 'primary', loading = false, disabled, className = '', children, ...props }: ButtonProps) {
  const classes = ['pace-button', `pace-button--${variant}`, className].filter(Boolean).join(' ');
  return <button {...props} className={classes} disabled={disabled || loading} aria-busy={loading || undefined}>{children}</button>;
}

export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return <article className={['pace-card', className].filter(Boolean).join(' ')}>
    {title && <h2 className="pace-card__title">{title}</h2>}
    {children}
  </article>;
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextInput({ id, label, error, className = '', ...props }: TextInputProps) {
  const inputId = id ?? props.name;
  if (!inputId) throw new Error('TextInput requires an id or name.');
  const errorId = `${inputId}-error`;
  return <div className="pace-field">
    <label htmlFor={inputId}>{label}</label>
    <input {...props} id={inputId} className={['pace-input', className].filter(Boolean).join(' ')} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : props['aria-describedby']} />
    {error && <span className="pace-field__error" id={errorId}>{error}</span>}
  </div>;
}

export function Tabs({ label, items, value, onChange }: { label: string; items: Array<{ value: string; label: string }>; value: string; onChange: (value: string) => void }) {
  return <div className="pace-tabs" role="tablist" aria-label={label}>
    {items.map(item => <button key={item.value} className="pace-tabs__tab" type="button" role="tab" aria-selected={value === item.value} onClick={() => onChange(item.value)}>{item.label}</button>)}
  </div>;
}

export function SegmentProgress({ value, max, label }: { value: number; max: number; label: string }) {
  const count = Number.isFinite(max) ? Math.max(1, Math.floor(max)) : 1;
  const complete = Number.isFinite(value) ? Math.min(count, Math.max(0, Math.floor(value))) : 0;
  return <div className="pace-segments" style={{ '--pace-segment-count': count } as CSSProperties} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={count} aria-valuenow={complete}>
    {Array.from({ length: count }, (_, index) => <span key={index} className="pace-segments__segment" data-complete={index < complete} />)}
  </div>;
}

export function Sheet({ open, title, closeLabel = 'Close dialog', onOpenChange, children }: { open: boolean; title: string; closeLabel?: string; onOpenChange: (open: boolean) => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} className="pace-sheet" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onOpenChange(false); }} onClose={() => { if (open) onOpenChange(false); }}>
    <div className="pace-sheet__header"><h2 id={titleId}>{title}</h2><Button variant="quiet" type="button" aria-label={closeLabel} onClick={() => onOpenChange(false)}>×</Button></div>
    {children}
  </dialog>;
}

export function Toast({ message, kind = 'success', onDismiss }: { message: string; kind?: 'success' | 'error' | 'info'; onDismiss?: () => void }) {
  const isError = kind === 'error';
  return <div className={`pace-toast${isError ? ' pace-toast--error' : ''}`} role={isError ? 'alert' : 'status'} aria-live={isError ? 'assertive' : 'polite'}>
    <span>{message}</span>
    {onDismiss && <Button type="button" variant="quiet" aria-label="بستن پیام" onClick={onDismiss}>×</Button>}
  </div>;
}

export function Skeleton({ label, className = '' }: { label: string; className?: string }) {
  return <div className={['pace-skeleton', className].filter(Boolean).join(' ')} role="status" aria-label={label} aria-busy="true" />;
}
