/** Where to go after signing in: ?next= when it is a local path, else home. */
export const nextPath = (search) => {
  const next = new URLSearchParams(search).get('next')
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
}
