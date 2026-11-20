import {useEffect,useState} from 'react';
import type {FormEvent,ReactNode} from 'react';
import {Link,NavLink,Route,Routes,useNavigate,useParams,useSearchParams,useLocation} from 'react-router-dom';
import type {Place} from './types';
import {places,cats,nc,uniq,newest,liveChips,filterPlaces,inCat,useSaved,toggleSaved,useSeo} from './lib';
const OWNER_INSTAGRAM='sha.says__';

function Layout({children}:{children:ReactNode}){
 const [open,setOpen]=useState(false);const {pathname}=useLocation();const saved=useSaved();
 useEffect(()=>{setOpen(false);window.scrollTo(0,0)},[pathname]);
 return <>
  <header className="top"><div className="wrap bar"><Link className="logo" to="/">StudySpots Chennai</Link>
   <button className="menubtn" aria-expanded={open} aria-controls="mainnav" onClick={()=>setOpen(!open)}>{open?'Close':'Menu'}</button>
   <nav id="mainnav" aria-label="Main" className={'main'+(open?' open':'')}>
    <NavLink to="/explore">Explore</NavLink><NavLink to="/saved">Saved ({saved.length})</NavLink><NavLink to="/about">About</NavLink><NavLink to="/contact">Contact</NavLink></nav></div></header>
  {children}
  <footer><div className="wrap"><h3>StudySpots Chennai</h3><p>Details come from public sources and may be out of date. Please confirm on Google Maps before you go.</p>
   <div><Link to="/explore">Explore</Link><Link to="/saved">Saved</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></div>
   <div>{cats.map(c=><Link key={c.slug} to={'/'+c.slug}>{c.title}</Link>)}</div></div></footer></>}

function Card({p}:{p:Place}){
 const saved=useSaved().includes(p.id);
 return <article className="card card-no-photo">
  <button className="save" aria-pressed={saved} onClick={()=>toggleSaved(p.id)}>{saved?'Saved':'Save'}</button>
  <div className="b">
   <div className="card-kicker">{p.type} <span aria-hidden="true">·</span> {p.area}</div>
   <h3>{p.name}</h3>
   <p className="card-summary">{p.description}</p>
   <div className="card-price">{nc(p.priceRange)} <span>{p.priceNote!=='Not stated'?p.priceNote:''}</span></div>
   <div className="row">{p.wifiQuality==='Reported good'&&<span className="tag">Wi-Fi reported</span>}{p.powerSockets==='Reported many'&&<span className="tag">Power sockets reported</span>}{p.priceRange==='Free'&&<span className="tag">Free entry</span>}{p.bestFor.slice(0,2).map(b=><span key={b} className="tag">{b}</span>)}</div>
   <span className="meta">Sources checked {p.lastChecked}</span>
   <div className="row card-actions"><Link className="btn sm" to={'/place/'+p.slug}>View details</Link><a className="btn ghost sm" href={p.mapsLink} target="_blank" rel="noopener noreferrer">Google Maps</a>{p.phone&&<a className="btn ghost sm" href={'tel:'+p.phone.replace(/\s/g,'')}>Call</a>}</div>
  </div>
 </article>}

function Home(){
 useSeo('StudySpots Chennai | Find your perfect study spot','Discover quiet cafés, libraries and work-friendly spaces in Chennai, filtered by Wi-Fi, plugs, noise, price and area.');
 const nav=useNavigate();const [q,setQ]=useState('');
 const go=(e:FormEvent)=>{e.preventDefault();nav('/explore'+(q?'?q='+encodeURIComponent(q):''))};
 return <main><section className="hero"><div className="wrap"><h1>Find your perfect study spot in Chennai.</h1>
  <p>Discover quiet cafés, libraries, and work-friendly spaces, filtered by Wi-Fi, plugs, noise, price, and area.</p>
  <form className="search" role="search" onSubmit={go}><input type="search" aria-label="Search places" placeholder="Search cafés, libraries, coworking spaces..." value={q} onChange={e=>setQ(e.target.value)}/><button className="btn" type="submit">Search</button></form>
  <div className="chips">{liveChips().map(c=><Link key={c.k} className="chip" to={'/explore?tag='+c.k}>{c.label}</Link>)}</div>
  <p className="meta" style={{marginTop:14}}>Last updated {newest}</p></div></section>
  <section className="s"><div className="wrap"><h2>Featured places</h2><div className="grid">{places.filter(p=>p.featured).slice(0,6).map(p=><Card key={p.id} p={p}/>)}</div></div></section>
  <section className="s" style={{paddingTop:0}}><div className="wrap"><h2>Browse by category</h2><div className="grid">{cats.map(c=><Link key={c.slug} className="cat" to={'/'+c.slug}><b>{c.title}</b>{c.desc}</Link>)}</div></div></section>
  <section className="s" style={{paddingTop:0}}><div className="wrap"><div className="dark"><h2>How it works</h2><ol className="steps">{['Search by area or need','Filter by Wi-Fi, plugs, noise and price','View honest details and directions','Save or share your favourite spot'].map(t=><li key={t}>{t}</li>)}</ol></div></div></section></main>}

const Sel=({l,k,o,s,set}:{l:string;k:string;o:string[];s:URLSearchParams;set:(k:string,v:string)=>void})=>
 <><label htmlFor={'f-'+k}>{l}</label><select id={'f-'+k} value={s.get(k)||''} onChange={e=>set(k,e.target.value)}><option value="">Any</option>{o.map(x=><option key={x} value={x}>{nc(x)}</option>)}</select></>;

function Explore(){
 useSeo('Explore study spots in Chennai | StudySpots Chennai','Search and filter cafés, libraries and coworking spaces in Chennai.');
 const [s,setS]=useSearchParams();const [open,setOpen]=useState(false);const res=filterPlaces(s);const loc=useLocation();
 useEffect(()=>{try{sessionStorage.setItem('ssc-back',loc.pathname+loc.search)}catch{}},[loc]);
 const set=(k:string,v:string)=>{const n=new URLSearchParams(s);v?n.set(k,v):n.delete(k);setS(n,{replace:true})};
 const toggle=(k:string,v:string)=>{const n=new URLSearchParams(s);const a=n.getAll(k);n.delete(k);(a.includes(v)?a.filter(x=>x!==v):[...a,v]).forEach(x=>n.append(k,x));setS(n,{replace:true})};
 const has=s.toString().replace(/sort=[^&]*&?/,'')!=='';
 const common={s,set};
 return <main className="wrap"><div style={{paddingTop:24}}><h1 style={{fontSize:'2rem'}}>Explore study spots</h1>
  <input type="search" aria-label="Search places" placeholder="Search cafés, libraries, coworking spaces..." value={s.get('q')||''} onChange={e=>set('q',e.target.value)}/>
  <div className="chips" style={{marginTop:12}}>{liveChips().map(c=><button key={c.k} className={'chip'+(s.getAll('tag').includes(c.k)?' on':'')} aria-pressed={s.getAll('tag').includes(c.k)} onClick={()=>toggle('tag',c.k)}>{c.label}</button>)}</div></div>
  <div className="layout"><div><button className="btn ghost fbtn" style={{width:'100%'}} onClick={()=>setOpen(true)}>Filters</button>
   <aside className={'side'+(open?' open':'')} aria-label="Filters"><h2 style={{fontSize:'1.2rem'}}>Filters</h2>
    <Sel l="Area" k="area" o={uniq(p=>[p.area])} {...common}/><Sel l="Place type" k="type" o={uniq(p=>[p.type])} {...common}/><Sel l="Wi-Fi" k="wifi" o={uniq(p=>[p.wifiQuality])} {...common}/><Sel l="Power sockets" k="plugs" o={uniq(p=>[p.powerSockets])} {...common}/><Sel l="Noise level" k="noise" o={uniq(p=>[p.noiseLevel])} {...common}/><Sel l="Price" k="price" o={uniq(p=>[p.priceRange])} {...common}/><Sel l="Time limit" k="limit" o={uniq(p=>[p.timeLimit])} {...common}/><Sel l="Best for" k="best" o={uniq(p=>p.bestFor)} {...common}/>
    <label>Amenities</label>{uniq(p=>p.amenities).map(a=><label key={a} className="ck"><input type="checkbox" checked={s.getAll('am').includes(a)} onChange={()=>toggle('am',a)}/>{a}</label>)}
    <div className="applybar"><button className="btn ghost sm" onClick={()=>setS(new URLSearchParams(),{replace:true})}>Clear all</button><button className="btn sm apply" onClick={()=>setOpen(false)}>Apply</button></div></aside></div>
   <div><div className="row between" style={{marginBottom:14}}><strong role="status">Showing {res.length} of {places.length} places</strong>
    <label className="row">Sort <select style={{width:'auto'}} value={s.get('sort')||'match'} onChange={e=>set('sort',e.target.value)}><option value="match">Best matches</option><option value="price">Lowest price</option><option value="checked">Recently checked</option><option value="near">Nearest area</option></select></label></div>
    {has&&<p><button className="btn ghost sm" onClick={()=>setS(new URLSearchParams(),{replace:true})}>Clear all filters</button></p>}
    {res.length?<div className="grid">{res.map(p=><Card key={p.id} p={p}/>)}</div>:<div className="empty"><p>No spots match those filters. Try removing a filter.</p><button className="btn" onClick={()=>setS(new URLSearchParams())}>Clear all filters</button></div>}</div></div></main>}

function Detail(){
 const {slug}=useParams();const p=places.find(x=>x.slug===slug);const saved=useSaved();const [copied,setCopied]=useState(false);
 useSeo(p?`${p.name}, ${p.area} | StudySpots Chennai`:'Not found | StudySpots Chennai',p?p.description:'Page not found');
 if(!p)return <NotFound/>;
 const back=(()=>{try{return sessionStorage.getItem('ssc-back')||'/explore'}catch{return '/explore'}})();
 const share=async()=>{const u=location.href;if(navigator.share){try{await navigator.share({title:p.name,url:u})}catch{}}else{try{await navigator.clipboard.writeText(u);setCopied(true)}catch{}}};
 const sim=places.filter(x=>x.id!==p.id&&(x.area===p.area||x.type===p.type)).slice(0,3);
 const F=(a:string,b:string)=><div key={a}><small>{a}</small>{nc(b)}</div>;
 return <main className="wrap"><p className="crumb"><Link to="/">Home</Link> / <Link to="/explore">Explore</Link> / {p.name} · <Link to={back}>Back to results</Link></p>
  <h1 style={{marginTop:20}}>{p.name}</h1><p>{p.area} · {p.type} · {nc(p.priceRange)} · <span className="meta">Sources checked {p.lastChecked}</span></p><p>{p.description}</p>
  <div className="row" style={{margin:'16px 0'}}><a className="btn" href={p.mapsLink} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>{p.phone&&<a className="btn ghost" href={'tel:'+p.phone.replace(/\s/g,'')}>Call {p.phone}</a>}<button className="btn gold" aria-pressed={saved.includes(p.id)} onClick={()=>toggleSaved(p.id)}>{saved.includes(p.id)?'Saved':'Save'}</button><button className="btn ghost" onClick={share}>{copied?'Link copied':'Share'}</button></div>
  <h2>Facilities</h2><div className="facts">{[F('Wi-Fi',p.wifiQuality),F('Power sockets',p.powerSockets),F('Noise level',p.noiseLevel),F('Opening hours',p.openingHours),F('Price',p.priceNote),F('Time limit',p.timeLimit),F('Amenities',p.amenities.join(', ')||'Unknown'),F('Address',p.address)]}</div>
  <h2 style={{marginTop:26}}>Good for</h2><div className="chips">{p.bestFor.map(b=><span className="tag" key={b}>{b}</span>)}</div>
  <h2 style={{marginTop:26}}>Practical notes</h2><p>{p.notes}</p>
  <h2>Sources</h2><ul>{p.sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.label}</a></li>)}</ul><p>Anything marked Not confirmed could not be verified. Please check Google Maps and call ahead.</p>
  <h2 style={{marginTop:26}}>Similar places</h2><div className="grid">{sim.map(x=><Card key={x.id} p={x}/>)}</div></main>}

function CategoryPage(){
 const {pathname}=useLocation();const c=cats.find(x=>'/'+x.slug===pathname);
 useSeo(c?c.title+' | StudySpots Chennai':'Not found',c?c.desc:'');
 if(!c)return <NotFound/>;const list=places.filter(p=>inCat(c,p));
 return <main className="wrap"><p className="crumb"><Link to="/">Home</Link> / {c.title}</p><h1>{c.title}</h1><p>{c.intro}</p><div className="grid">{list.map(p=><Card key={p.id} p={p}/>)}</div></main>}

function Saved(){const ids=useSaved();useSeo('Saved places | StudySpots Chennai','Your saved study spots, stored in this browser.');const l=places.filter(p=>ids.includes(p.id));
 return <main className="wrap" style={{paddingTop:24}}><h1>Saved places</h1><p>Saved on this device only.</p>{l.length?<div className="grid">{l.map(p=><Card key={p.id} p={p}/>)}</div>:<div className="empty"><p>Nothing saved yet. Tap Save on any place.</p><Link className="btn" to="/explore">Explore places</Link></div>}</main>}
function About(){useSeo('About | StudySpots Chennai','How StudySpots Chennai sources and checks its listings.');
 return <main className="wrap" style={{paddingTop:24,maxWidth:760}}><h1>About StudySpots Chennai</h1><p>StudySpots Chennai is a curated guide to cafés, libraries and coworking spaces where students, exam aspirants and remote workers can settle in and focus.</p><p>Each listing is built from public sources such as local guides, library information pages and coworking booking sites. The sources are linked on every place page.</p><h2>What does “Sources checked” mean?</h2><p>It is the date the listing’s sources were last reviewed. Anything we could not confirm is shown as Not confirmed instead of guessed.</p><p>Details such as timings and prices change. Please confirm on Google Maps before you go.</p></main>}
function Contact(){useSeo('Contact | StudySpots Chennai','Connect with StudySpots Chennai on Instagram.');
 return <main className="wrap contact-page" style={{paddingTop:24,maxWidth:760}}><h1>Contact</h1><p>Have a question or a useful update? Connect with us on Instagram.</p><p><a className="btn" href={'https://instagram.com/'+OWNER_INSTAGRAM.replace('@','')} target="_blank" rel="noopener noreferrer">Visit our Instagram</a></p></main>}
function NotFound(){useSeo('Page not found | StudySpots Chennai','This page does not exist.');
 return <main className="wrap" style={{paddingTop:40}}><div className="empty"><h1>Page not found</h1><p>That page does not exist.</p><Link className="btn" to="/explore">Explore places</Link> <Link className="btn ghost" to="/">Home</Link></div></main>}

export default function App(){return <Layout><Routes>
 <Route path="/" element={<Home/>}/><Route path="/explore" element={<Explore/>}/><Route path="/place/:slug" element={<Detail/>}/><Route path="/saved" element={<Saved/>}/><Route path="/about" element={<About/>}/><Route path="/contact" element={<Contact/>}/>
 {cats.map(c=><Route key={c.slug} path={'/'+c.slug} element={<CategoryPage/>}/>)}<Route path="*" element={<NotFound/>}/></Routes></Layout>}
