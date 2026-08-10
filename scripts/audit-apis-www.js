const https = require('https')

// Use www subdomain to avoid redirects
const BASE = 'https://www.tournaops.com'

const endpoints = [
  { method: 'GET', path: '/api/health', auth: false, name: 'Health check' },
  { method: 'GET', path: '/api/payment-settings/public', auth: false, name: 'Public payment settings' },
  { method: 'GET', path: '/api/auth/me', auth: true, name: 'Current user' },
  { method: 'GET', path: '/api/dashboard/tournaments', auth: true, name: 'Dashboard tournaments' },
  { method: 'GET', path: '/api/organizer/profile', auth: true, name: 'Organizer profile' },
  { method: 'GET', path: '/api/payments', auth: true, name: 'User payments' },
  { method: 'GET', path: '/api/tournaments', auth: true, name: 'All tournaments' },
  { method: 'GET', path: '/api/tournament-templates', auth: true, name: 'Tournament templates' },
  { method: 'GET', path: '/api/scoring-presets', auth: true, name: 'Scoring presets' },
  { method: 'GET', path: '/api/chat/history', auth: true, name: 'Chat history' },
  { method: 'GET', path: '/api/notifications', auth: true, name: 'Notifications (new)' },
  { method: 'GET', path: '/api/admin/stats', auth: true, admin: true, name: 'Admin stats' },
  { method: 'GET', path: '/api/admin/users', auth: true, admin: true, name: 'Admin users' },
  { method: 'GET', path: '/api/admin/payments', auth: true, admin: true, name: 'Admin payments' },
  { method: 'GET', path: '/api/admin/payment-settings', auth: true, admin: true, name: 'Payment settings' },
  { method: 'GET', path: '/api/admin/system-errors', auth: true, admin: true, name: 'System errors' },
  { method: 'GET', path: '/api/system-health', auth: true, admin: true, name: 'System health' },
]

function testEndpoint(ep) {
  return new Promise((resolve) => {
    const url = new URL(BASE + ep.path)
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: ep.method,
      timeout: 15000,
      headers: { 'User-Agent': 'TournaOps-Audit/1.0', 'Accept': 'application/json' },
    }, (res) => {
      let body = ''
      res.on('data', (c) => { body += c })
      res.on('end', () => {
        resolve({ ...ep, status: res.statusCode, body: body.substring(0, 150) })
      })
    })
    req.on('error', (e) => resolve({ ...ep, status: 0, error: e.message }))
    req.on('timeout', () => { req.destroy(); resolve({ ...ep, status: 0, error: 'timeout' }) })
    req.end()
  })
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗')
  console.log('║       TOURNAOPS PRODUCTION API AUDIT (www)               ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  const results = await Promise.all(endpoints.map(testEndpoint))
  let ok = 0, protected_ = 0, broken = 0

  for (const r of results) {
    const status = r.status || 'ERR'
    let emoji, verdict
    if (r.status === 200) { emoji = '✅'; verdict = 'OK'; ok++ }
    else if ((r.auth || r.admin) && (r.status === 401 || r.status === 403)) { emoji = '🔒'; verdict = 'PROTECTED'; protected_++ }
    else if (r.status === 404) { emoji = '⚠️ '; verdict = 'NOT FOUND'; broken++ }
    else if (r.status === 308) { emoji = '↪️ '; verdict = 'REDIRECT'; broken++ }
    else if (r.status >= 500) { emoji = '💥'; verdict = 'SERVER ERROR'; broken++ }
    else { emoji = '❓'; verdict = 'UNKNOWN'; broken++ }

    const badge = r.admin ? '[ADMIN]' : r.auth ? '[AUTH]' : '[PUBLIC]'
    console.log(`${emoji} ${badge.padEnd(9)} ${status.toString().padEnd(4)} ${verdict.padEnd(12)} ${r.path}`)
    if (r.error) console.log('         ' + r.error)
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log(`  ✅ OK: ${ok}   🔒 Protected: ${protected_}   ❌ Issues: ${broken}`)
  console.log('═══════════════════════════════════════════════════════════\n')
}

main().catch(console.error)