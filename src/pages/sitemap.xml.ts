import type { APIRoute } from 'astro';

export const prerender = true;

const routes = ['/', '/about/', '/services/', '/forms/', '/contact/'];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://donovan-family-dentistry-demo.pages.dev');
  const urls = routes
    .map((route) => `  <url><loc>${new URL(route, base).toString()}</loc></url>`)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
