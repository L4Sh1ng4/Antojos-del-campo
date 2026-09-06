const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (match) {
  try {
    const json = JSON.parse(match[1]);
    console.log('JSON-LD is valid JSON');
    console.log('Type:', json['@type']);
    console.log('Name:', json.name);
    console.log('Offers count:', json.hasOfferCatalog?.itemListElement?.length || 0);
  } catch (e) {
    console.error('JSON-LD parse error:', e.message);
  }
} else {
  console.log('No JSON-LD found');
}