const https = require('https')

const BASE = 'https://tournaops.com'

// All API endpoints to test
const endpoints = [
  // Public (no auth needed)
  { method: 'GET', path: '/api/health', auth: false, name: 'Health check' },
  { method: 'GET', path: '/api/payment-settings/public', auth: false, name: 'Public payment settings' },
  
  // Auth required
  { method: 'GET', path: '/api/auth/me', auth: true, name: 'Current user' },
  
  // Dashboard
  { method: 'GET', path: '/api/dashboard/tournaments', auth: true, name: 'Dashboard tournaments' },
  { method: 'GET', path: '/api/organizer/profile', auth: true, name: 'Organizer profile' },
  { method: 'GET', path: '/api/payments', auth: true, name: 'User payments' },
  
  // Tournament APIs
  { method: 'GET', path: '/api/tournaments', auth: true, name: 'All tournaments' },
  { method: 'GET', path: '/api/tournament-templates', auth: true, name: 'Tournament templates' },
  { method: 'GET', path: '/api/scoring-presets', auth: true, name: 'Scoring presets' },
  { method: 'GET', path: '/api/chat/history', auth: true, name: 'Chat history' },
  
  // Admin (super admin only)
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
      path: url.pathname + url.search,
      method: ep.method,
      timeout: 10000,
      headers: { 'User-Agent': 'TournaOps-API-Audit/1.0' },
    }, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        resolve({
          ...ep,
          status: res.statusCode,
          contentType: res.headers['content-type'],
          body: body.substring(0, 200),
        })
      })
    })
    req.on('error', (e) => resolve({ ...ep, status: 0, error: e.message }))
    req.on('timeout', () => { req.destroy(); resolve({ ...ep, status: 0, error: 'timeout' }) })
    req.end()
  })
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗')
  console.log('║       TOURNAOPS PRODUCTION API AUDIT                     ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')
  
  const results = await Promise.all(endpoints.map(testEndpoint))
  
  let publicOk = 0, authOk = 0, adminOk = 0
  let publicFail = 0, authFail = 0, adminFail = 0
  
  for (const r of results) {
    const emoji = getEmoji(r)
    const badge = r.admin ? '[ADMIN]' : r.auth ? '[AUTH]' : '[PUBLIC]'
    const status = r.status || 'ERR'
    
    console.log(`${emoji} ${badge.padEnd(9)} ${status.toString().padEnd(4)} ${r.method.padEnd(5)} ${r.path}`)
    console.log(`         ${r.name}`)
    if (r.error) console.log(`         Error: ${r.error}`)
    console.log()
    
    // Track results
    if (isSuccess(r)) {
      if (r.admin) adminOk++
      else if (r.auth) authOk++
      else publicOk++
    } else {
      if (r.admin) adminFail++
      else if (r.auth) authFail++
      else publicFail++
    }
  }
  
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  SUMMARY')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`  Public:  ${publicOk}/${publicOk + publicFail} responding`)
  console.log(`  Auth:    ${authOk}/${authOk + authFail} responding (401 = correctly requires auth)`)
  console.log(`  Admin:   ${adminOk}/${adminOk + adminFail} responding (401/403 = correctly requires admin)`)
  console.log('═══════════════════════════════════════════════════════════\n')
}

function getEmoji(r) {
  if (!r.status) return '❌'
  if (r.status === 200) return '✅'
  if (r.status === 401 && (r.auth || r.admin)) return '🔒' // correctly protected
  if (r.status === 403 && r.admin) return '🔒'
  if (r.status === 404) return '⚠️ '
  if (r.status >= 500) return '💥'
  return '❓'
}

function isSuccess(r) {
  if (!r.status) return false
  if (r.status === 200) return true
  // 401/403 on protected routes = working correctly
  if ((r.auth || r.admin) && (r.status === 401 || r.status === 403)) return true
  return false
}

main().catch(console.error)