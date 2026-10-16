// Avisa Bing, Yandex, Seznam e Naver (via IndexNow) que as páginas do sitemap mudaram.
// Rodar depois de publicar: npm run indexnow
// A chave é pública por definição: o arquivo public/<chave>.txt prova que o site é nosso.
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const RAIZ = join(import.meta.dirname, '..');
const HOST = 'realcredmais.com.br';

const arquivoChave = (await readdir(join(RAIZ, 'public'))).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!arquivoChave) throw new Error('Arquivo de chave do IndexNow não encontrado em public/');
const key = arquivoChave.replace('.txt', '');

const sitemap = await readFile(join(RAIZ, 'public', 'sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

const resposta = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList }),
});
console.log(`IndexNow: ${resposta.status} ${resposta.statusText} (${urlList.length} URLs)`);
