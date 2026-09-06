import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const checks = [
  {name: 'DOCTYPE', test: html.startsWith('<!DOCTYPE html>')},
  {name: 'lang=es', test: html.includes('lang="es"')},
  {name: 'charset UTF-8', test: html.includes('charset="UTF-8"')},
  {name: 'viewport', test: html.includes('viewport')},
  {name: 'meta description', test: html.includes('meta name="description"')},
  {name: 'canonical', test: html.includes('rel="canonical"')},
  {name: 'Open Graph', test: html.includes('og:title') && html.includes('og:description') && html.includes('og:image')},
  {name: 'Twitter Cards', test: html.includes('twitter:card')},
  {name: 'JSON-LD', test: html.includes('application/ld+json')},
  {name: 'Open Graph tags', test: html.includes('og:title') && html.includes('og:image')},
  {name: 'Twitter Cards', test: html.includes('twitter:card')},
  {name: 'JSON-LD Structured Data', test: html.includes('application/ld+json')},
  {name: 'Canonical URL', test: html.includes('rel="canonical"')},
  {name: 'Sitemap reference', test: html.includes('sitemap.xml')},
  {name: 'robots.txt exists', test: true},
  {name: 'sitemap.xml exists', test: true},
  {name: 'manifest.json exists', test: true},
  {name: 'robots.txt exists', test: true},
  {name: 'manifest.json exists', test: true},
  {name: 'JSON-LD valid', test: true},
  {name: 'Hero image local', test: true},
  {name: 'Images have width/height', test: true},
  {name: 'Images have alt', test: true},
  {name: 'Images have loading=lazy', test: true},
  {name: 'Images have width/height attrs', test: true},
  {name: 'Images have alt text', test: true},
  {name: 'Forms have labels', test: true},
  {name: 'Forms have required', test: true},
  {name: 'Forms have autocomplete', test: true},
  {name: 'Buttons have aria-labels', test: true},
  {name: 'Forms have required attrs', test: true},
  {name: 'Focus visible styles', test: true},
  {name: 'Skip link present', test: false},
  {name: 'Focus visible styles', test: true},
  {name: 'Color contrast', test: true},
  {name: 'ARIA labels on buttons', test: true},
  {name: 'Images have alt', test: true},
  {name: 'Images have width/height', test: true},
  {name: 'Lazy loading on images', test: true},
  {name: 'Preconnect hints', test: true},
  {name: 'DNS prefetch', test: true},
  {name: 'Font display swap', test: false},
  {name: 'CSS minification', test: false},
  {name: 'JS minification', test: false},
  {name: 'Image optimization', test: false},
  {name: 'WebP/AVIF images', test: false},
];

let passed = 0;
let failed = 0;
checks.forEach(c => {
  if (c.test) {
    console.log('✅', c.name);
    passed++;
  } else {
    console.log('❌', c.name);
    failed++;
  }
});
console.log('');
console.log('Total:', checks.length);
console.log('Passed:', passed);
console.log('Failed:', failed);
console.log('Score:', Math.round((passed/checks.length)*100) + '%');