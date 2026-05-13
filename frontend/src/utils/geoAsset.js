/** Resolve paths under `public/` for Vite `import.meta.env.BASE_URL`. */
export function geoAsset(relPath) {
  const b = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const r = String(relPath || '').replace(/^\//, '');
  return b ? `${b}/${r}` : `/${r}`;
}
