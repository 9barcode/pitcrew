// Optional visual regression check: requires Playwright and a Chromium install.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const server=require('node:child_process').spawn(process.execPath,['dev-server.mjs','--port','5187'],{cwd:process.cwd(),stdio:['ignore','pipe','inherit']});
 await new Promise(resolve=>server.stdout.once('data',resolve));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--single-process','--no-zygote']}: {})});
  const context=await browser.newContext({viewport:{width:1700,height:1080},deviceScaleFactor:1,recordVideo:{dir:'output/video',size:{width:1360,height:864}}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  await page.goto('http://127.0.0.1:5187');await page.waitForSelector('#garage[data-loaded="true"]');await page.click('.debug summary');await page.click('#pause');
  for(const phase of ['idle','ready','lift-up','work','lift-down','release','finish']){await page.selectOption('#debugPhase',phase);await page.locator('#debugTime').fill('0.5');await page.waitForFunction(p=>document.querySelector('#garage').dataset.phase===p,phase);await page.screenshot({path:`output/garage-${phase}.png`});}
  await page.click('#garageDemo');await page.waitForSelector('#garage[data-phase="work"]');await page.click('#pause');await page.screenshot({path:'output/garage-live-service.png'});assert.match(await page.locator('#stage').textContent(),/휠 너트|타이어/);
  await page.click('#restart');await page.waitForSelector('#garage[data-phase="idle"]');assert.equal(await page.locator('#debugPhase').inputValue(),'live');
  await page.click('#raceAction');await page.waitForSelector('#garage[data-phase="idle"]');assert.equal(await page.locator('#pause').textContent(),'일시정지');
  await page.click('#pause');await page.selectOption('#debugPhase','work');await page.click('#debugPlay');
  // Capture a real animated loop at constant 1x speed, independent of race speed.
  await page.waitForTimeout(2400);await page.click('#debugPlay');
  await page.setViewportSize({width:900,height:650});await page.screenshot({path:'output/garage-900.png'});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({errors,checkedPhases:7,restart:true,raceAction:true,viewports:[1700,900]}));
  await context.close();
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
