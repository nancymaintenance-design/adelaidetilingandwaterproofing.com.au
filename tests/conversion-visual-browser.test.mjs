import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createPreviewServer}=require('../preview-server.cjs');
let chromium;try{({chromium}=require('playwright'));}catch{}

test('service hero and home use compact material-led layouts across both languages',{
  skip:!chromium&&'Expose installed Playwright through NODE_PATH'
},async t=>{
  const server=createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
  t.after(()=>new Promise(r=>{server.close(r);server.closeAllConnections();}));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true});t.after(()=>browser.close());
  for(const prefix of ['','zh/'])for(const width of [390,1440,1920]){
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
    for(const file of ['kitchen-splashback-tiling-adelaide.html','bathroom-tiling-adelaide.html','index.html']){
      await page.goto(base+'/'+prefix+file,{waitUntil:'load'});
      await page.evaluate(()=>document.fonts.ready);
      const m=await page.evaluate(()=>{
        const hero=document.querySelector('main h1').closest('section');
        const r=hero.getBoundingClientRect(),title=hero.querySelector('h1'),cta=hero.querySelector('a.btn');
        return {height:r.height,pattern:getComputedStyle(hero).backgroundImage,font:parseFloat(getComputedStyle(title).fontSize),
          ctaBottom:cta.getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth,
          image:hero.querySelector('img')?.naturalWidth??null,h1s:document.querySelectorAll('h1').length,
          trades:[...hero.querySelectorAll('.home-trade')].map(n=>({top:n.getBoundingClientRect().top,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height,font:parseFloat(getComputedStyle(n).fontSize)}))};
      });
      assert.equal(m.overflow,false,`${prefix}${file} ${width}: no horizontal overflow`);
      assert.equal(m.h1s,1);if(m.image!==null)assert.ok(m.image>0,'hero photograph remains loaded');
      if(file==='index.html')assert.notEqual(m.pattern,'none',`${prefix}${file}: approved homepage material grid remains`);
      else assert.equal(m.pattern,'none','dossier hero uses the photo and editable enquiry surface, not a background grid');
      if(file==='index.html'){
        assert.equal(m.trades.length,2,'both trades remain in the title');
        for(const trade of m.trades)assert.ok(trade.height<trade.font*1.4,'trade names never break internally');
        if(width>=1440)assert.ok(Math.abs(m.trades[0].top-m.trades[1].top)<2,'desktop trades share one line');
      }
      // Selected homepage now includes a full-width title band above the image/copy row.
      // Keep service entrances compact; give the homepage its measured composition budget.
      if(width>=1440){assert.ok(m.height<=(file==='index.html'?960:800),`${file}: desktop hero ${m.height}px exceeds its composition budget`);assert.ok(m.font>=38,'desktop title must hold its visual weight');assert.ok(m.ctaBottom<850,'primary action remains in the first desktop viewport');}
    }
    await page.close();
  }
});
