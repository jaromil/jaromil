/** Build a site-internal href honouring the configured base and trailing slash. */
export function href(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return path ? `${base}${path.replace(/^\//, '')}/` : base;
}
