import type { APIRoute } from 'astro';

export const prerender = true;

export const publicRoutes = [
  '/',
  '/about/',
  '/services/',
  '/new-patients/',
  '/forms/',
  '/contact/',
  '/accessibility/',
  '/website-use/'
] as const;

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://donovan-family-dentistry-demo.pages.dev');
  const urls = publicRoutes
    .map((route) => `  <url><loc>${new URL(route, base).toString()}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
