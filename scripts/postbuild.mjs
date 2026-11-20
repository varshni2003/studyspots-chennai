// Render every public route to real HTML so search engines receive page content without JavaScript.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const SITE=(process.env.SITE_URL||'https://example.com').replace(/\/$/,'');
const places=JSON.parse(fs.readFileSync('src/data/places.json','utf8'));
const cats=JSON.parse(fs.readFileSync('src/data/categories.json','utf8'));
const template=fs.readFileSync('dist/index.html','utf8');
const serverEntry=path.resolve('dist-server/entry-server.js');
const {render}=await import(pathToFileURL(serverEntry).href);
const esc=value=>String(value??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const safeJson=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const newest=places.map(p=>p.lastChecked).sort().at(-1)||new Date().toISOString().slice(0,10);
const routes=[
  {url:'/',title:'StudySpots Chennai | Find your perfect study spot',desc:'Discover quiet cafés, libraries and work-friendly spaces in Chennai, filtered by Wi-Fi, plugs, noise, price and area.',kind:'WebSite'},
  {url:'/explore',title:'Explore study spots in Chennai | StudySpots Chennai',desc:'Search and filter cafés, libraries and coworking spaces in Chennai.'},
  {url:'/saved',title:'Saved places | StudySpots Chennai',desc:'Your saved study spots, stored in this browser.',noindex:true},
  {url:'/about',title:'About | StudySpots Chennai',desc:'How StudySpots Chennai sources and checks its listings.'},
  {url:'/contact',title:'Contact | StudySpots Chennai',desc:'Get in touch with StudySpots Chennai.'},
  ...cats.map(c=>({url:'/'+c.slug,title:c.title+' | StudySpots Chennai',desc:c.desc,kind:'ItemList',category:c})),
  ...places.map(p=>({url:'/place/'+p.slug,title:`${p.name}, ${p.area} | StudySpots Chennai`,desc:`${p.name} in ${p.area}, Chennai. ${p.description}`.slice(0,300),kind:p.type==='Library'?'Library':'LocalBusiness',place:p}))
];

for(const route of routes){
  const html=render(route.url);
  const canonical=SITE+(route.url==='/'?'/':route.url);
  let structured='';
  if(route.kind==='WebSite') structured=safeJson({'@context':'https://schema.org','@type':'WebSite',name:'StudySpots Chennai',url:SITE+'/'});
  if(route.kind==='ItemList'){
    const c=route.category;
    const list=places.filter(p=>(!c.match.type||p.type===c.match.type)&&(!c.match.plugs||p.powerSockets===c.match.plugs)&&(!c.match.price||c.match.price.includes(p.priceRange)));
    structured=safeJson({'@context':'https://schema.org','@type':'ItemList',name:c.title,itemListElement:list.map((p,i)=>({'@type':'ListItem',position:i+1,url:`${SITE}/place/${p.slug}`,name:p.name}))});
  }
  if(route.place){
    const p=route.place;
    structured=safeJson({'@context':'https://schema.org','@type':route.kind,name:p.name,url:canonical,...(p.address&&p.address!=='Unknown'?{address:p.address}:{}),...(p.phone?{telephone:p.phone}:{}),...(p.mapsLink?{hasMap:p.mapsLink}:{}),...(p.openingHours&&p.openingHours!=='Unknown'?{description:`Opening hours: ${p.openingHours}`}:{})});
  }
  const head=[
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.desc)}">`,
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta property="og:title" content="${esc(route.title)}">`,
    `<meta property="og:description" content="${esc(route.desc)}">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    '<meta property="og:type" content="website">',
    '<meta name="twitter:card" content="summary">',
    `<meta name="twitter:title" content="${esc(route.title)}">`,
    `<meta name="twitter:description" content="${esc(route.desc)}">`,
    route.noindex?'<meta name="robots" content="noindex,follow">':'',
    structured?`<script type="application/ld+json">${structured}</script>`:''
  ].join('');
  let page=template.replace(/<title>.*?<\/title>/s,'').replace(/<meta name="description"[^>]*>/,'').replace('</head>',head+'</head>');
  page=page.replace('<div id="root"></div>',`<div id="root">${html}</div>`);
  const output=route.url==='/'?'dist/index.html':path.join('dist',route.url.slice(1),'index.html');
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,page);
}

// The custom 404 is also rendered as real HTML.
const notFound=render('/this-page-does-not-exist');
const notFoundPage=template.replace(/<title>.*?<\/title>/s,'<title>Page not found | StudySpots Chennai</title>')
  .replace('<div id="root"></div>',`<div id="root">${notFound}</div>`);
fs.writeFileSync('dist/404.html',notFoundPage);

const sitemapRoutes=routes.filter(r=>!r.noindex);
fs.writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapRoutes.map(r=>`<url><loc>${esc(SITE+(r.url==='/'?'/':r.url))}</loc><lastmod>${newest}</lastmod></url>`).join('')}</urlset>`);
fs.writeFileSync('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
fs.rmSync('dist-server',{recursive:true,force:true});
console.log(`Pre-rendered ${routes.length} routes with actual page content.`);
