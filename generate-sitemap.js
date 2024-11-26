import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { writeFileSync } from 'fs';

// Define your routes here
const routes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/seating-planner', changefreq: 'weekly', priority: 0.8 },
  { url: '/ai-seating', changefreq: 'weekly', priority: 0.8 },
  { url: '/saved-layouts', changefreq: 'weekly', priority: 0.7 },
];

async function generateSitemap() {
  try {
    // Create a stream to write to
    const stream = new SitemapStream({ hostname: 'https://seatyourguests.com' }); // Replace with your domain

    // Return a promise that resolves with your XML string
    const data = await streamToPromise(Readable.from(routes).pipe(stream));
    writeFileSync('./dist/sitemap.xml', data.toString());
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();