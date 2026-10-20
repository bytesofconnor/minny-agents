import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}});
await p.goto(process.env.URL||'https://northernbytes-site.vercel.app',{waitUntil:'networkidle'}); await p.waitForTimeout(1500); await p.addStyleTag({content:'header{display:none!important}'});
const s = p.locator('section', { hasText: 'earn their keep' }).last(); await s.screenshot({path:'applications.png'}); await b.close();
