import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const visible=h=>h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');

test('bathroom coordination offers direct assessment with optional reading and retained links',()=>{
  const html=read('bathroom-renovation-waterproofing-adelaide.html');
  const paragraph=html.match(/<p>Because both scopes sit with one provider,[\s\S]*?<\/p>/)[0];
  const text=visible(paragraph);
  assert.doesNotMatch(text,/before getting in touch|Review[^.]*check[^.]*before/i);
  assert.match(text,/contact Ellis directly/i);
  assert.match(text,/on-site measur/i);
  assert.match(text,/substrate.*requirements/i);
  assert.match(text,/optional/i);
  assert.deepEqual([...paragraph.matchAll(/href="([^"]+)"/g)].map(m=>m[1]),['services.html#bathroom-tiling','service-areas.html','faq.html']);
});

test('contact secondary guidance does not require reading before contact and retains both links',()=>{
  const html=read('contact.html');
  const section=html.split('<p class="eyebrow">Our service guidance</p>')[1].split('</div>')[0];
  const text=visible(section);
  assert.doesNotMatch(text,/Read[^.]*then book/i);
  assert.match(text,/contact Ellis directly/i);
  assert.match(text,/optional/i);
  assert.deepEqual([...section.matchAll(/href="([^"]+)"/g)].map(m=>m[1]),['faq.html','services.html']);
});

test('contact and form FAQ explicitly arrange on-site assessment and written quote',()=>{
  for(const p of ['contact.html','faq.html']) {const text=visible(read(p));assert.match(text,/arrange an on-site assessment/i,p);assert.match(text,/written quote/i,p);assert.doesNotMatch(text,/responds? with the next steps|respond with the right context|website lists|site includes bathroom/i,p);}
});
test('tile choice is resolved before construction, without blocking first contact',()=>{
  const text=visible(read('bathroom-renovation-waterproofing-adelaide.html'));
  assert.match(text,/contact Ellis before choosing or buying tiles/i);
  assert.doesNotMatch(text,/size and thickness should be decided rather than left open|what to have ready before you ask for a quote/i);
});
test('photos are optional through existing email, never an implied form upload',()=>{
  for(const p of ['waterproofing-adelaide.html','bathroom-waterproofing-adelaide.html','bathroom-renovation-waterproofing-adelaide.html','faq.html','about.html','contact.html']){
    const text=visible(read(p));assert.match(text,/optional[^.]*handyman.lyric@outlook.com/i,p);
    assert.doesNotMatch(text,/current condition and photos through our|Send the room dimensions, wet-area locations and clear photos|Clear photos help us assess the work accurately/i,p);
  }
});
test('new tiling and renovation CTAs use requirements rather than an assumed fault',()=>{
  for(const p of ['tiling-adelaide.html','bathroom-renovation-waterproofing-adelaide.html']) assert.doesNotMatch(visible(read(p)),/checks the affected area, identifies the cause/i,p);
});
test('bathroom service quote path is optional-data and distinguishes installation from leaks',()=>{
  const text=visible(read('bathroom-waterproofing-adelaide.html'));
  assert.doesNotMatch(text,/Having these six things ready|Room dimensions and a few photos[^.]*enough|Photos of the space help us assess the work and prepare the right service response/i);
  assert.match(text,/without photos or measurements/i);
  const booking=read('bathroom-waterproofing-adelaide.html').split('id="book-bathroom-waterproofing-in-adelaide"')[1];
  assert.doesNotMatch(visible(booking),/checks the affected area, identifies the cause/i);
  assert.match(visible(booking),/renovation|requirements/i);
});
test('FAQ schema remains equal to customer-visible answers',()=>{
  for(const p of fs.readdirSync(root).filter(p=>p.endsWith('.html'))) {
    const h=read(p),text=visible(h);
    for(const m of h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)){
      const data=JSON.parse(m[1]);for(const item of data['@graph']||[data])if(item['@type']==='FAQPage')for(const qa of item.mainEntity){assert.ok(text.includes(qa.name),p+': '+qa.name);assert.ok(text.includes(qa.acceptedAnswer.text),p+': '+qa.name);}
    }
  }
});
