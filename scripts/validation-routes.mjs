import path from 'node:path';

export const previewOrigin = 'https://donovan-family-dentistry-demo.pages.dev';
export const publicRoutes = [
  '/',
  '/about/',
  '/services/',
  '/new-patients/',
  '/forms/',
  '/contact/',
  '/accessibility/',
  '/website-use/'
];
export const lighthouseRoutes = ['/', '/about/', '/services/', '/new-patients/', '/contact/'];
export const noindexPrefixes = ['/modern/', '/review/'];
export const utilityRoutes = ['/404-review-example/'];

export const routeToHtmlPath = (route, root = 'dist') => {
  if (route === '/') return path.join(root, 'index.html');
  return path.join(root, route.replace(/^\//, ''), 'index.html');
};

export const normalizeRoute = (pathname) => {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') || path.extname(pathname) ? pathname : `${pathname}/`;
};
