import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
test('language switch preserves the current query and strict legacy fragment',()=>{
  assert.ok(existsSync(new URL('../site-locale.js',import.meta.url)),'missing bilingual runtime');
  const {languageSwitchUrl}=require('../site-locale.js');
  assert.equal(languageSwitchUrl('http://127.0.0.1/contact.html?service=Bathroom%20tiling#enquiry-form','/zh/contact.html'),'/zh/contact.html?service=Bathroom%20tiling#enquiry-form');
  assert.equal(languageSwitchUrl('http://127.0.0.1/zh/contact.html#enquiry-form?area=East&suburb=Norwood','/contact.html'),'/contact.html#enquiry-form?area=East&suburb=Norwood');
  assert.throws(()=>languageSwitchUrl('https://example.test/','https://untrusted.test/'),/origin/i);
});
test('both languages have complete messages and safe unknown-error fallbacks',()=>{
  assert.ok(existsSync(new URL('../site-locale.js',import.meta.url)),'missing bilingual runtime');
  const {message,errorMessage,messages}=require('../site-locale.js');
  assert.deepEqual(Object.keys(messages['en-AU']).sort(),Object.keys(messages['zh-Hans']).sort());
  assert.match(message('zh-Hans','sending'),/发送/);
  assert.match(errorMessage('zh-Hans',{code:'LOCAL_PREVIEW_ONLY',error:'technical detail'}),/本地预览/);
  assert.equal(errorMessage('zh-Hans',{error:'secret exception'}),message('zh-Hans','failed'));
});
