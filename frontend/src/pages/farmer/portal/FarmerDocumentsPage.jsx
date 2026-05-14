import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { DOCUMENTS } from '../../../mock/farmerDashboardMock';
import { Btn, DocStatusPill, FarmerPageShell, FpCard, fp } from './farmerPortalUi';

/** PDF + common image types for the OS file picker (DigiLocker-style vault). */
const DOC_FILE_ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif,.pdf,application/pdf';

function isAllowedVaultFile(file) {
  if (!file) return false;
  const type = file.type || '';
  if (type.startsWith('image/') || type === 'application/pdf') return true;
  return /\.(pdf|jpe?g|png|gif|webp|heic|heif)$/i.test(file.name);
}

function isPdfMime(mime, fileName) {
  if (mime === 'application/pdf') return true;
  return /\.pdf$/i.test(fileName || '');
}

function revokeRowBlob(row) {
  if (row?.vaultBlobUrl) {
    try {
      URL.revokeObjectURL(row.vaultBlobUrl);
    } catch {
      /* ignore */
    }
  }
}

export default function FarmerDocumentsPage() {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const pendingDocRef = useRef(null);
  const docsRef = useRef([]);
  const [docs, setDocs] = useState(() => DOCUMENTS.map((d) => ({ ...d })));
  /** Local upload preview in modal — not OCR */
  const [filePreview, setFilePreview] = useState(null);

  docsRef.current = docs;

  useEffect(() => {
    return () => {
      docsRef.current.forEach(revokeRowBlob);
    };
  }, []);

  const openFilePicker = useCallback((doc) => {
    pendingDocRef.current = { id: doc.id, title: doc.title };
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      const pending = pendingDocRef.current;
      e.target.value = '';
      if (!file || !pending?.id) return;

      if (!isAllowedVaultFile(file)) {
        window.alert(t('Please choose a PDF or image file.'));
        return;
      }

      const uploaded = new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date());

      const url = URL.createObjectURL(file);
      const mime = file.type || '';
      const name = file.name || 'document';

      setDocs((prev) =>
        prev.map((row) => {
          if (row.id !== pending.id) return row;
          revokeRowBlob(row);
          return {
            ...row,
            uploadedAt: uploaded,
            status: 'pending',
            vaultBlobUrl: url,
            vaultMime: mime,
            vaultFileName: name,
          };
        }),
      );
      pendingDocRef.current = null;
    },
    [t],
  );

  const openUploadedPreview = useCallback(
    (doc) => {
      if (!doc?.vaultBlobUrl) {
        window.alert(t('No file uploaded yet. Use Upload to add a PDF or image.'));
        return;
      }
      setFilePreview({
        title: doc.title,
        url: doc.vaultBlobUrl,
        mime: doc.vaultMime || '',
        fileName: doc.vaultFileName || 'document',
      });
    },
    [t],
  );

  const downloadCurrent = useCallback(
    (doc) => {
      if (!doc?.vaultBlobUrl) {
        window.alert(t('No file uploaded yet. Use Upload to add a PDF or image.'));
        return;
      }
      const a = document.createElement('a');
      a.href = doc.vaultBlobUrl;
      a.download = doc.vaultFileName || 'document';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    [t],
  );

  return (
    <>
      <FarmerPageShell
        title={t('Document center')}
        subtitle={t('DigiLocker-style vault — upload, replace, and track verification for each proof (demo).')}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept={DOC_FILE_ACCEPT}
          onChange={onFileChange}
          aria-hidden
          tabIndex={-1}
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {docs.map((d) => (
            <FpCard key={d.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <span className="material-symbols-outlined text-[#1F5E3B]">{d.icon}</span>
                <DocStatusPill status={d.status} />
              </div>
              <p className="font-bold leading-snug text-[0.8125rem] sm:text-[0.875rem]" style={{ color: fp.text }}>
                {d.title}
              </p>
              <p className="text-[0.6875rem]" style={{ color: fp.muted }}>
                {d.type}
              </p>
              <p className="text-[0.6875rem]" style={{ color: '#9aa19c' }}>
                {t('Uploaded')}: {d.uploadedAt}
              </p>
              {d.vaultFileName ? (
                <p className="m-0 truncate text-[0.625rem] leading-snug" style={{ color: fp.muted }} title={d.vaultFileName}>
                  {d.vaultFileName}
                </p>
              ) : null}
              <div className="mt-auto flex flex-wrap gap-x-1.5 gap-y-0.5 pt-2 text-[0.6875rem] font-bold text-[#1e5a8a]">
                <button
                  type="button"
                  className="hover:underline"
                  onClick={() => openFilePicker(d)}
                  aria-label={`${t('Upload')} — ${d.title}`}
                >
                  {t('Upload')}
                </button>
                <span className="text-[#e4e8ec]">|</span>
                <button
                  type="button"
                  className="hover:underline"
                  onClick={() => openUploadedPreview(d)}
                  aria-label={`${t('Preview')} — ${d.title}`}
                >
                  {t('Preview')}
                </button>
                <span className="text-[#e4e8ec]">|</span>
                <button
                  type="button"
                  className="hover:underline"
                  onClick={() => openFilePicker(d)}
                  aria-label={`${t('Replace')} — ${d.title}`}
                >
                  {t('Replace')}
                </button>
                <span className="text-[#e4e8ec]">|</span>
                <button type="button" className="hover:underline" onClick={() => downloadCurrent(d)}>
                  {t('Download')}
                </button>
              </div>
            </FpCard>
          ))}
        </div>
      </FarmerPageShell>

      {filePreview && (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={t('Close')}
            onClick={() => setFilePreview(null)}
          />
          <div
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-preview-title"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#e4e8ec] px-4 py-3 sm:px-5">
              <div className="min-w-0 pr-2">
                <h2 id="file-preview-title" className="fp-heading truncate text-[1.0625rem] font-bold" style={{ color: fp.text }}>
                  {t('Document preview')} — {filePreview.title}
                </h2>
                <p className="mt-0.5 truncate text-[0.6875rem]" style={{ color: fp.muted }}>
                  {filePreview.fileName}
                </p>
              </div>
              <button type="button" className="icon-btn-soft shrink-0" onClick={() => setFilePreview(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden bg-[#f4f5f7] p-3 sm:p-4">
              {isPdfMime(filePreview.mime, filePreview.fileName) ? (
                <iframe
                  title={filePreview.fileName}
                  src={filePreview.url}
                  className="h-[min(75vh,640px)] w-full rounded-xl border border-[#e4e8ec] bg-white"
                />
              ) : (
                <div className="flex max-h-[min(75vh,640px)] items-center justify-center overflow-auto rounded-xl border border-[#e4e8ec] bg-white p-2">
                  <img
                    src={filePreview.url}
                    alt={filePreview.fileName}
                    className="max-h-[min(72vh,600px)] w-auto max-w-full object-contain"
                  />
                </div>
              )}
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-[#e4e8ec] px-4 py-3">
              <Btn variant="ghost" onClick={() => setFilePreview(null)}>
                {t('Close')}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
