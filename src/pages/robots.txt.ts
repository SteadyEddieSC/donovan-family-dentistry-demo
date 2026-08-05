import type { APIRoute } from 'astro';
import site from '../data/site.json';

export const prerender = true;

export const GET: APIRoute = ({ site: configuredSite }) => {
  const body = site.previewMode
    ? 'User-agent: *\nDisallow: /\n'
    : [
        'User-agent: *',
        'Allow: /',
        'Disallow: /modern/',
        'Disallow: /review/',
        'Disallow: /404-review-example',
        `Sitemap: ${new URL('/sitemap.xml', configuredSite ?? new URL(site.productionUrl)).toString()}`,
        ''
      ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
