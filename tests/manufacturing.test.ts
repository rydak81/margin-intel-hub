import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Native TS runner requires explicit extensions.
import { MANUFACTURING_SOURCES, normalizeManufacturingItems, dedupeManufacturingStories, filterManufacturingStories, manufacturingLink, upcomingManufacturingEvents } from '../lib/manufacturing.ts'
// @ts-expect-error Native TS runner requires explicit extensions.
import { readManufacturingFeed, buildManufacturingSnapshot } from '../lib/manufacturing-feeds.ts'
const now = Date.parse('2026-10-11T01:00:00Z')
const source = MANUFACTURING_SOURCES[1]
const item = {title:'A new filament material',link:'https://blog.bambulab.com/new-material/?utm_source=rss',isoDate:'2026-10-09T12:00:00Z'}
test('manufacturing normalization retains actual dates, routes topics, and excludes invalid or future coverage',()=>{
 const rows=normalizeManufacturingItems([item,{...item,isoDate:'invalid'},{...item,isoDate:'2026-10-12'},{...item,isoDate:'2026-01-01'},{...item,title:'Black Friday coupons'},{...item,link:'javascript:alert(1)'}],source,now)
 assert.equal(rows.length,1);assert.equal(rows[0].topic,'Materials');assert.equal(rows[0].publishedAt,item.isoDate.replace('Z','.000Z'));assert.equal(rows[0].url,'https://blog.bambulab.com/new-material/')
 const laser=normalizeManufacturingItems([{...item,title:'Introducing R1',contentSnippet:'Our laser cutter and engraver.'}],source,now)[0]
 assert.equal(laser.process,'Laser & fabrication')
 assert.equal(normalizeManufacturingItems([{...item,title:'3D Printing Workshops'}],source,now)[0].topic,'Events & community')
})
test('outbound article links must stay on the publisher HTTPS host',()=>{
 for(const url of ['http://blog.bambulab.com/post','https://evil.test/post','https://blog.bambulab.com.evil.test/post','https://user:pass@blog.bambulab.com/post','https://blog.bambulab.com:8443/post']) assert.equal(manufacturingLink(url,source),null,url)
})
test('deduplication and combined search filters preserve a distinct story',()=>{
 const rows=normalizeManufacturingItems([item,{...item,link:'https://blog.bambulab.com/second'}, {...item,title:'Firmware update',link:'https://blog.bambulab.com/firmware'}],source,now)
 const unique=dedupeManufacturingStories(rows);assert.equal(unique.length,2)
 const filtered=filterManufacturingStories(unique,{query:'FIRMWARE',topic:'Software & workflow',process:'3D printing',days:7},now)
 assert.equal(filtered.length,1)
 assert.equal(filterManufacturingStories(unique,{query:'unmatched',topic:'',process:'',days:90},now).length,0)
})
test('expired events disappear instead of retaining an upcoming label',()=>{
 assert.equal(upcomingManufacturingEvents(now).length,2)
 assert.equal(upcomingManufacturingEvents(Date.parse('2026-11-21')).length,1)
 assert.equal(upcomingManufacturingEvents(Date.parse('2027-04-16')).length,0)
})
const rss=(url:string)=>`<rss version="2.0"><channel><title>Test publisher</title><link>${url}</link><description>Test</description><item><title>New filament material</title><link>${url}</link><pubDate>Fri, 09 Oct 2026 12:00:00 GMT</pubDate></item></channel></rss>`
test('partial failures retain working sources and never invent successful coverage',async()=>{
 const fetcher=(async(input: string | URL | Request)=>{
  const url=String(input);const s=MANUFACTURING_SOURCES.find(s=>s.feed===url)!
  if(s.id==='xtool') throw new Error('Timeout')
  if(s.id==='carbide') return new Response('Unavailable',{status:503})
  return new Response(rss(s.url+'fixture'))
 }) as typeof fetch
 const snapshot=await buildManufacturingSnapshot(now,fetcher)
 assert.equal(snapshot.sources.filter(s=>s.available).length,3)
 assert.equal(snapshot.sources.find(s=>s.id==='xtool')?.count,0)
 assert.equal(snapshot.checkedAt,new Date(now).toISOString())
 assert.ok(snapshot.stories.length>0)
 const failed=await buildManufacturingSnapshot(now,(async()=>{throw new Error('Unavailable')}) as typeof fetch)
 assert.equal(failed.stories.length,0);assert.equal(failed.sources.some(s=>s.available),false)
})
test('RSS and Atom feeds parse, but oversized and entity-declaring documents do not',async()=>{
 assert.equal((await readManufacturingFeed(source,now,(async()=>new Response(rss(source.url+'fixture'))) as typeof fetch)).length,1)
 const atom=`<feed xmlns="http://www.w3.org/2005/Atom"><title>Test</title><id>test</id><updated>2026-10-09T12:00:00Z</updated><entry><title>Firmware release</title><id>release</id><link href="${source.url}release"/><updated>2026-10-09T12:00:00Z</updated></entry></feed>`
 assert.equal((await readManufacturingFeed(source,now,(async()=>new Response(atom)) as typeof fetch)).length,1)
 await assert.rejects(readManufacturingFeed(source,now,(async()=>new Response(' '.repeat(2_000_001))) as typeof fetch),/size limit/)
 await assert.rejects(readManufacturingFeed(source,now,(async()=>new Response('<!DOCTYPE rss>'+rss(source.url))) as typeof fetch),/Unsupported XML/)
})
