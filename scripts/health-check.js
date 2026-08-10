const https = require('https')

const BASE = 'https://www.tournaops.com'

async function check(path, expected = [200, 401]) {
  return new Promise((resolve) => {
    const url = new URL(BASE + path)
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      timeout: 10000,
    }, (res) => {
      const isOk = expected.includes(res.statusCode)
      resolve({ path, status: res.statusCode, ok: isOk })
    })
    req.on('error', () => resolve({ path, status: 0, ok: false }))
    req.on('timeout', () => { req.destroy(); resolve({ path, status: 0, ok: false }) })
    req.end()
  })
}

async function main() {
  console.log('\n=== FULL PRODUCTION HEALTH CHECK ===\n')

  const tests = [
    // Public - should return 200
    { path: '/api/health', expected: [200] },
    { path: '/api/payment-settings/public', expected: [200] },

    // Auth-protected - should return 401 (correct behavior when not logged in)
    { path: '/api/auth/me', expected: [401] },
    { path: '/api/dashboard/tournaments', expected: [401] },
    { path: '/api/organizer/profile', expected: [401] },
    { path: '/api/payments', expected: [401] },
    { path: '/api/notifications', expected: [401] },
    { path: '/api/tournaments', expected: [401] },
    { path: '/api/tournament-templates', expected: [401] },
    { path: '/api/scoring-presets', expected: [401] },
    { path: '/api/chat/history', expected: [401] },

    // Admin - should return 401 or 403
    { path: '/api/admin/stats', expected: [401, 403] },
    { path: '/api/admin/users', expected: [401, 403] },
    { path: '/api/admin/payments', expected: [401, 403] },
    { path: '/api/admin/payment-settings', expected: [401, 403] },
    { path: '/api/admin/system-errors', expected: [401, 403] },
    { path: '/api/system-health', expected: [401, 403] },
  ]

  const results = await Promise.all(tests.map(t => check(t.path, t.expected)))

  let pass = 0, fail = 0
  for (const r of results) {
    if (r.ok) { console.log(`✅ ${r.status.toString().padEnd(4)} ${r.path}`); pass++ }
    else { console.log(`❌ ${r.status.toString().padEnd(4)} ${r.path} (unexpected)`); fail++ }
  }

  console.log('\n═══════════════════════════════════════════')
  console.log(`  PASS: ${pass}   FAIL: ${fail}   TOTAL: ${results.length}`)
  if (fail === 0) console.log('  🎉 ALL SYSTEMS OPERATIONAL')
  console.log('═══════════════════════════════════════════\n')
}

main()