// Pings IndexNow (Bing, Yandex, Seznam, Naver share the endpoint) with
// every URL in the live sitemap. Runs post-deploy; no-ops outside
// production so preview builds never ping.
const KEY = '6359d279ecb750f4f3faef02240b54f6';
const HOST = 'ba-in.com';


const res = await fetch(`https://${HOST}/sitemap.xml`);
const xml = await res.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) {
  console.error('[indexnow] sitemap yielded no URLs, aborting');
  process.exit(1);
}

const ping = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  }),
});
console.log(`[indexnow] submitted ${urls.length} URLs — HTTP ${ping.status}`);
