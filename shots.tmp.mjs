import { chromium } from 'playwright-core'
const OUT = '/tmp/claude-0/-home-user-mithaq/5f81bde9-f058-5817-9a80-bcbd0d32fcc1/scratchpad/shots'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] })
const p = await b.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 })
await p.goto('http://localhost:5199', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
// المواعيد — تأكد لا قمر متداخل + بطاقة الجدول
await p.locator('nav button').nth(1).click(); await p.waitForTimeout(700)
await p.screenshot({ path: `${OUT}/v2-schedule.png` })
// افتح نافذة موعد جديد — تأكد توسيطها
await p.locator('text=＋ موعد جديد').click(); await p.waitForTimeout(500)
await p.screenshot({ path: `${OUT}/v2-modal.png` })
await p.keyboard.press('Escape'); await p.mouse.click(10,400); await p.waitForTimeout(300)
// افتح الجدول الأسبوعي
await p.locator('text=حددوا جدولكم').click(); await p.waitForTimeout(500)
await p.screenshot({ path: `${OUT}/v2-weekly.png` })
await p.mouse.click(10,400); await p.waitForTimeout(300)
// الأماني — الشرح
await p.locator('nav button').nth(3).click(); await p.waitForTimeout(600)
await p.screenshot({ path: `${OUT}/v2-wishes.png` })
// الإعدادات — زر التصفير (نزول لتحت)
await p.locator('nav button').nth(4).click(); await p.waitForTimeout(600)
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await p.waitForTimeout(400)
await p.screenshot({ path: `${OUT}/v2-settings.png` })
await b.close(); console.log('done')
