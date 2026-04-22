import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://anurpanjewellery.com';

interface ProductSitemapEntry {
  handle: string;
  updatedAt: string;
}

async function getProductMetadata(): Promise<ProductSitemapEntry[]> {
  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const shopifyToken = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

  if (!shopifyDomain || !shopifyToken) {
    console.warn("Shopify domain or storefront access token not set. Skipping dynamic product sitemap generation.");
    return [];
  }

  const query = `
    query {
      products(first: 250) {
        edges {
          node {
            handle
            updatedAt
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${shopifyDomain}/api/2023-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/graphql',
        'X-Shopify-Storefront-Access-Token': shopifyToken,
      },
      body: query,
    });
    const data = await response.json();
    return data.data.products.edges.map((edge: { node: ProductSitemapEntry }) => edge.node);
  } catch (error) {
    console.error("Error fetching product metadata for sitemap:", error);
    return [];
  }
}

async function generateSitemap() {
  const productMetadata = await getProductMetadata();
  const staticRoutes = [
    '', // homepage
    'products',
    'about-us',
    'contact',
    'terms',
    'refund-policy',
    'privacy-policy',
  ];

  const today = new Date().toISOString().split('T')[0];
  // Use a fixed date for static routes to avoid unnecessary re-indexing on every build
  const staticLastMod = '2024-04-20';

  const staticEntries = staticRoutes.map((route) => ({
    route,
    lastmod: staticLastMod,
    priority: route === '' ? '1.0' : '0.8',
  }));
  const productEntries = productMetadata.map((product) => ({
    route: `product/${product.handle}`,
    lastmod: (product.updatedAt || today).split('T')[0],
    priority: '0.8',
  }));
  const allEntries = [...staticEntries, ...productEntries];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allEntries.map(({ route, lastmod, priority }) => {
    const url = `${BASE_URL}/${route}`;
    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('')}
</urlset>`;

  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
  console.log('Sitemap generated successfully!');
}

generateSitemap();
