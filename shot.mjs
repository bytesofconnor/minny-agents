import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [w,h,f] of [[1440,900,'screenshot.png'],[390,844,'screenshot-mobile.png']]) {
  const p = await b.newPage({ viewport:{width:w,height:h}, deviceScaleFactor: w<500?2:1 });
  await p.goto(process.env.URL||'https://northernbytes-site.vercel.app',{waitUntil:'networkidle'});
  await p.waitForTimeout(3500);
  await p.screenshot({ path:f, fullPage:true });
}
await b.close();
