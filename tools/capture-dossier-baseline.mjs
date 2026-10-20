import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {routes} from '../i18n/routes.mjs';
import {contentSnapshot} from '../tests/helpers/dossier-content.mjs';
const target='tests/fixtures/dossier-baseline.json';
if(existsSync(target))throw Error('Baseline already exists; do not overwrite the preservation contract');
const result={};for(const {file} of routes)for(const prefix of ['','zh/'])result[prefix+file]=contentSnapshot(readFileSync(prefix+file,'utf8'));
mkdirSync('tests/fixtures',{recursive:true});writeFileSync(target,JSON.stringify(result,null,2)+'\n');
console.log('Captured unchanged content contract for '+Object.keys(result).length+' pages');
