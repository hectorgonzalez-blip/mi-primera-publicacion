const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{}),headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1080}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const requests=[];page.on('request',r=>requests.push(r.url()));
 const url=pathToFileURL(path.join(__dirname,'index.html')).href;
 try{
 await page.goto(url);await page.waitForSelector('.platform');
 const expected=JSON.parse(fs.readFileSync(path.join(__dirname,'datos.json'),'utf8'));
 assert.deepEqual(await page.evaluate(()=>window.DEPLOYMENT_DATA),expected,'Los datos del HTML deben coincidir con datos.json');
 assert.equal(await page.locator('.platform').count(),6);
 assert.equal(await page.locator('#matrix tbody tr').count(),11);
 assert.equal(await page.locator('[data-cell]').count(),66);
 assert.equal(await page.locator('#mini-chart .mini-row').count(),6);
 await page.screenshot({path:path.join(__dirname,'vista-escritorio.png'),fullPage:true});
 await page.locator('#search').fill('Lóvable');assert.equal(await page.locator('.platform').count(),2); // Vercel también menciona Lovable entre sus usos.
 await page.locator('#clear').click();
 for(const id of ['chatgpt_sites','lovable','vercel','github_pages']) await page.locator(`#cards [data-select="${id}"]`).click();
 assert.equal(await page.locator('#chips .chip').count(),3);
 assert.match(await page.locator('#toast').textContent(),/hasta tres/);
 await page.locator('#build').selectOption('global');
 assert.equal(await page.locator('.platform').count(),2);assert.equal(await page.locator('#mini-chart .mini-row').count(),2);assert.equal(await page.locator('#chips .chip').count(),3);
 await page.locator('#chips [data-select="lovable"]').click();assert.equal(await page.locator('#build').inputValue(),'global');
 await page.locator('.nav [data-view="comparar"]').click();assert.equal(await page.locator('#compare-selected .detail-card').count(),2);
 assert.equal(await page.locator('#matrix thead th').count(),3);assert.equal(await page.locator('#full-chart .chart-row').count(),2);assert.equal(await page.locator('#pricing .price-card').count(),2);
 await page.locator('#clear').click();
 // Recorre las 66 celdas: deben abrir una explicación con fuentes.
 for(const cell of await page.locator('[data-cell]').all()){await cell.click();assert.equal(await page.locator('dialog[open]').count(),1);assert.ok(await page.locator('#dialog-body a').count()>0);await page.keyboard.press('Escape')}
 await page.locator('#search').fill('no-existe-esta-plataforma');assert.equal(await page.locator('#matrix table').count(),0);assert.ok(await page.locator('#matrix .empty').count());
 await page.locator('#matrix [data-action="clear"]').click();assert.equal(await page.locator('#matrix thead th').count(),7);
 await page.locator('details.requirements summary').click();await page.locator('#needs input[value="database"]').check();assert.equal(await page.locator('.platform').count(),5);assert.equal(await page.locator('#cards h3').filter({hasText:'GitHub Pages'}).count(),0);await page.locator('#clear').click();
 // Recomendación de producto con servicios integrados.
 await page.locator('.nav [data-view="asistente"]').click();assert.ok(await page.locator('#next').isDisabled());
 for(const answer of ['2','2','0']){await page.locator(`#wizard input[name="question"][value="${answer}"]`).check();await page.locator('#next').click()}
 assert.match(await page.locator('.result').textContent(),/Lovable/);assert.equal(await page.locator('.result.warning').count(),0);
 await page.locator('#restart').click();await page.locator('#sensitive').check();
 for(let i=0;i<3;i++)await page.locator('#next').click();
 assert.equal(await page.locator('.result.warning').count(),1);assert.equal(await page.locator('.result-item').count(),0);assert.match(await page.locator('.result.warning').textContent(),/No se genera una recomendación automática/);
 await page.locator('#restart').click();await page.locator('#sensitive').uncheck();await page.locator('#next').click();await page.locator('#wizard input[value="3"]').check();await page.locator('#next').click();await page.locator('#next').click();assert.equal(await page.locator('.result.warning').count(),1);
 // La página debe ser autónoma y funcionar sin recursos de red.
 assert.ok(requests.every(r=>r.startsWith('file:')||r.startsWith('data:')),'No debe depender de recursos de red');
 await page.locator('.nav [data-view="explorar"]').click();
 for(const width of [1440,1024,768,390,360]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Sin desbordamiento en ${width}px`)}
 await page.screenshot({path:path.join(__dirname,'vista-movil.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.locator('.nav [data-view="comparar"]').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Matriz móvil contenida en su propio scroll');
 await page.locator('[data-cell="chatgpt_sites|database"]').click();assert.equal(await page.locator('dialog[open]').count(),1);await page.keyboard.press('Escape');
 assert.deepEqual(errors,[],'Sin errores JavaScript');
 console.log('OK: datos exactos; filtros y búsqueda; máximo de tres; selección persistente; 66 celdas con fuentes; gráficos sincronizados; asistente y bloqueo sensible; funcionamiento sin red; 5 anchos responsive.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
