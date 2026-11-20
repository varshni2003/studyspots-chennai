import {useEffect,useSyncExternalStore} from 'react';
import raw from './data/places.json';import catsRaw from './data/categories.json';
import type {Place,Category} from './types';
export const places=raw as Place[];export const cats=catsRaw as Category[];
export const nc=(v:string)=>v==='Unknown'?'Not confirmed':v;
export const uniq=(f:(p:Place)=>string[])=>[...new Set(places.flatMap(f))].sort();
export const newest=places.map(p=>p.lastChecked).sort().pop()!;
const RANK:Record<string,number>={Free:0,'₹':1,'₹₹':2,'₹₹₹':3,Unknown:4};
export const CHIPS:{k:string;label:string;fn:(p:Place)=>boolean}[]=[
{k:'quiet',label:'Quiet',fn:p=>['Silent','Calm'].includes(p.noiseLevel)},
{k:'plugs',label:'Power sockets',fn:p=>p.powerSockets==='Reported many'},
{k:'wifi',label:'Free Wi-Fi',fn:p=>p.wifiQuality==='Reported good'},
{k:'budget',label:'Budget-friendly',fn:p=>['Free','₹'].includes(p.priceRange)},
{k:'late',label:'Open late',fn:p=>/late|midnight|11 PM|12 AM/i.test(p.openingHours)},
{k:'groups',label:'Good for groups',fn:p=>p.bestFor.includes('Group project')}];
// chips only show when at least one place matches, so none lead to an empty page
export const liveChips=()=>CHIPS.filter(c=>places.some(c.fn));
export const inCat=(c:Category,p:Place)=>(!c.match.type||p.type===c.match.type)&&(!c.match.plugs||p.powerSockets===c.match.plugs)&&(!c.match.price||c.match.price.includes(p.priceRange));
export function filterPlaces(s:URLSearchParams){
 const q=(s.get('q')||'').toLowerCase().trim();const tags=s.getAll('tag');const am=s.getAll('am');
 const r=places.filter(p=>{
  if(q&&!`${p.name} ${p.area} ${p.type} ${p.amenities.join(' ')} ${p.bestFor.join(' ')} ${p.description}`.toLowerCase().includes(q))return false;
  for(const t of tags){const c=CHIPS.find(x=>x.k===t);if(c&&!c.fn(p))return false}
  const eq:[string,string][]=[['area',p.area],['type',p.type],['wifi',p.wifiQuality],['plugs',p.powerSockets],['noise',p.noiseLevel],['price',p.priceRange],['limit',p.timeLimit]];
  for(const[k,v]of eq){const x=s.get(k);if(x&&x!==v)return false}
  const b=s.get('best');if(b&&!p.bestFor.includes(b))return false;
  return am.every(a=>p.amenities.includes(a))});
 const so=s.get('sort')||'match';
 return [...r].sort((a,b)=>so==='price'?RANK[a.priceRange]-RANK[b.priceRange]:so==='checked'?b.lastChecked.localeCompare(a.lastChecked):so==='near'?a.distanceKm-b.distanceKm:Number(b.featured)-Number(a.featured)||a.id-b.id)}
// saved places, kept only in the visitor's own browser
let saved:number[]=[];try{saved=JSON.parse(localStorage.getItem('ssc-saved')||'[]')}catch{}
const subs=new Set<()=>void>();
const EMPTY_SAVED:number[]=[];
export const toggleSaved=(id:number)=>{saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];try{localStorage.setItem('ssc-saved',JSON.stringify(saved))}catch{}subs.forEach(f=>f())};
export const useSaved=()=>useSyncExternalStore(f=>{subs.add(f);return()=>{subs.delete(f)}},()=>saved,()=>EMPTY_SAVED);
export function useSeo(title:string,desc:string){useEffect(()=>{document.title=title;document.querySelector('meta[name=description]')?.setAttribute('content',desc)},[title,desc])}
