import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PREVIEW_PORT = 4317;
const BASE_URL = `http://localhost:${PREVIEW_PORT}`;
const OUTPUT_DIR = path.join(__dirname, '..', 'dist');
const RENDER_DELAY = 4000; // 4 seconds delay to ensure dynamic content is loaded

async function getProductHandles() {
  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const shopifyToken = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

  if (!shopifyDomain || !shopifyToken) {
    console.warn("Shopify domain or storefront access token not set. Skipping dynamic product route discovery.");
    return [];
  }

  const query = `
    query {
      products(first: 250) {
        edges {
          node {
            handle
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
    const data = (await response.json()) as any;
    return data.data.products.edges.map((edge: { node: { handle: string } }) => edge.node.handle);
  } catch (error) {
    console.error("Error fetching product handles for prerender:", error);
    return [];
  }
}

const staticRoutes = [
  '/',
  '/about-us',
  '/contact',
  '/products',
  '/privacy-policy',
  '/refund-policy',
  '/terms',
];

async function waitForServer(url: string, maxRetries = 20) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // Ignore errors during waiting
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

async function prerender() {
  console.log('🚀 Starting automated prerender process...');

  if (process.env.VERCEL === '1') {
    console.log('⚠️ Running on Vercel detected. Skipping Playwright prerender because Vercel build environments do not support installing full Chromium dependencies.');
    console.log('💡 The site will be deployed as a standard Single Page Application (SPA).');
    return;
  }

  const productHandles = await getProductHandles();
  const productRoutes = productHandles.map((handle: string) => `/product/${handle}`);
  const routes = [...staticRoutes, ...productRoutes];

  console.log(`📦 Found ${productHandles.length} products. Total routes to prerender: ${routes.length}`);

  const previewProcess = spawn('npx', ['vite', 'preview', '--strictPort', '--port', String(PREVIEW_PORT)], {
    cwd: path.join(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  if (previewProcess.stdout) {
    previewProcess.stdout.on('data', (data: Buffer) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('localhost')) {
        // Server ready signal
      }
    });
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  const serverUrl = `${BASE_URL}/`;
  console.log(`Waiting for server at ${serverUrl}...`);

  const ready = await waitForServer(serverUrl);
  if (!ready) {
    console.error('❌ Server failed to start');
    previewProcess.kill();
    process.exit(1);
  }
  console.log('✅ Server ready');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    console.log(`📄 Prerendering: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });

      // Safety net for product pages: wait for product content to actually appear
      if (route.startsWith('/product/')) {
        try {
          // Wait for the main product info container or title
          await page.waitForSelector('h1', { timeout: 5000 });
        } catch (e) {
          console.warn(`⚠️ Warning: Selector not found for ${route}, proceeding anyway.`);
        }
      }

      await page.waitForTimeout(RENDER_DELAY);

      const html = await page.content();
      
      // Calculate output path
      let routeFile;
      if (route === '/') {
        routeFile = 'index.html';
      } else {
        // Ensure route starts with / and remove it for joining
        const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
        routeFile = path.join(cleanRoute, 'index.html');
      }
      
      const outputPath = path.join(OUTPUT_DIR, routeFile);

      // INCREMENTAL BUILD: skip product pages whose HTML already exists in dist/
      // This avoids re-prerendering 100+ products on every build unless needed.
      // To force a full rebuild, delete dist/ before running npm run build.
      if (fs.existsSync(outputPath)) {
        console.log(`⏭️  Skipping (already exists): ${outputPath}`);
        continue;
      }

      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, html);
      console.log(`✅ Saved: ${outputPath}`);
    } catch (error: any) {
      console.error(`❌ Error: ${url} - ${error?.message || 'Unknown error'}`);
    }
  }

  await browser.close();
  previewProcess.kill();
  console.log('🎉 Prerendering complete!');
}

prerender().catch(err => {
  console.error(err);
  process.exit(1);
});
