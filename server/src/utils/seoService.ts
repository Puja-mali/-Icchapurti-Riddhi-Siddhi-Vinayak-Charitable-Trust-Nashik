import { Request, Response } from 'express';
import { Cause } from '../models/Cause';
import { Event } from '../models/Event';
import { BlogPost } from '../models/BlogPost';
import mongoose from 'mongoose';

/**
 * Resolves the canonical public base URL
 */
export const getCanonicalBaseUrl = (req: Request): string => {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  return `${protocol}://${host}`.replace(/\/+$/, '');
};

/**
 * Generates dynamic robots.txt content
 */
export const generateRobotsTxt = (baseUrl: string): string => {
  return `# Robots.txt for Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik
# Reg. No. E/1341 • Public Charitable Trust

User-agent: *
Allow: /
Allow: /about
Allow: /causes
Allow: /causes/*
Allow: /donate
Allow: /impact-passport
Allow: /volunteer
Allow: /kumbh-seva
Allow: /request-help
Allow: /transparency
Allow: /gallery
Allow: /blog
Allow: /blog/*
Allow: /events
Allow: /events/*
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /donation-status

# Private & Administrative Endpoints
Disallow: /admin
Disallow: /admin/*
Disallow: /api/*
Disallow: /dashboard
Disallow: /volunteer-portal
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /accept-invitation

# Canonical Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;
};

/**
 * Generates dynamic, valid XML Sitemap
 */
export const generateSitemapXml = async (baseUrl: string): Promise<string> => {
  const currentDate = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/causes', priority: '0.9', changefreq: 'weekly' },
    { loc: '/donate', priority: '0.9', changefreq: 'weekly' },
    { loc: '/impact-passport', priority: '0.9', changefreq: 'weekly' },
    { loc: '/about', priority: '0.8', changefreq: 'monthly' },
    { loc: '/kumbh-seva', priority: '0.8', changefreq: 'weekly' },
    { loc: '/events', priority: '0.8', changefreq: 'weekly' },
    { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
    { loc: '/gallery', priority: '0.7', changefreq: 'monthly' },
    { loc: '/volunteer', priority: '0.8', changefreq: 'monthly' },
    { loc: '/request-help', priority: '0.8', changefreq: 'monthly' },
    { loc: '/transparency', priority: '0.8', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.8', changefreq: 'monthly' },
    { loc: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { loc: '/terms', priority: '0.5', changefreq: 'yearly' },
  ];

  let dynamicUrls = '';

  if (mongoose.connection.readyState === 1) {
    try {
      const [causes, events, blogs] = await Promise.all([
        Cause.find({ isActive: true }).select('_id updatedAt').lean(),
        Event.find({ isPublished: true }).select('_id updatedAt').lean(),
        BlogPost.find({ isPublished: true }).select('slug updatedAt').lean(),
      ]);

      causes.forEach((c) => {
        const lastMod = c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : currentDate;
        dynamicUrls += `
  <url>
    <loc>${baseUrl}/causes/${c._id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });

      events.forEach((e) => {
        const lastMod = e.updatedAt ? new Date(e.updatedAt).toISOString().split('T')[0] : currentDate;
        dynamicUrls += `
  <url>
    <loc>${baseUrl}/events/${e._id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });

      blogs.forEach((b) => {
        const lastMod = b.updatedAt ? new Date(b.updatedAt).toISOString().split('T')[0] : currentDate;
        dynamicUrls += `
  <url>
    <loc>${baseUrl}/blog/${b.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    } catch {
      // Fallback gracefully without dynamic items if DB query times out
    }
  }

  const staticUrlsXml = staticPages
    .map(
      (p) => `
  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrlsXml}${dynamicUrls}
</urlset>`;
};
