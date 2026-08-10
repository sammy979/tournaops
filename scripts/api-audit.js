const fs = require('fs')
const path = require('path')

const report = {
  timestamp: new Date().toISOString(),
  apiRoutes: [],
  fetchCalls: [],
  pages: [],
}

// Scan API routes
function scanApi(dir, base = '') {
  const items = fs.readdirSync(dir)
  for (const item of items) {
    const full = path.join(dir, item)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      scanApi(full, base + '/' + item)
    } else if (item === 'route.ts') {
      const content = fs.readFileSync(full, 'utf8')
      const methods = []
      if (/export\s+async\s+function\s+GET/.test(content)) methods.push('GET')
      if (/export\s+async\s+function\s+POST/.test(content)) methods.push('POST')
      if (/export\s+async\s+function\s+PUT/.test(content)) methods.push('PUT')
      if (/export\s+async\s+function\s+PATCH/.test(content)) methods.push('PATCH')
      if (/export\s+async\s+function\s+DELETE/.test(content)) methods.push('DELETE')
      report.apiRoutes.push({ path: base || '/', methods })
    }
  }
}

// Scan frontend fetches
function scanFetches(dir) {
  const items = fs.readdirSync(dir)
  for (const item of items) {
    if (item === 'node_modules' || item === '.next' || item === '.git') continue
    const full = path.join(dir, item)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      scanFetches(full)
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8')
      const matches = content.matchAll(/fetch\s*\(\s*["`']([\/][^"`']+)/g)
      for (const m of matches) {
        if (m[1].startsWith('/api/')) {
          report.fetchCalls.push({
            file: full.replace(process.cwd(), '').replace(/\\/g, '/'),
            url: m[1],
          })
        }
      }
    }
  }
}

console.log('Scanning API routes...')
if (fs.existsSync('app/api')) scanApi('app/api')

console.log('Scanning frontend fetches...')
scanFetches('app')
scanFetches('components')

// Normalize routes
function normalize(url) {
  return url.split('?')[0].replace(/\$\{[^}]+\}/g, ':param').replace(/\[[^\]]+\]/g, ':param')
}

const apiSet = new Set(report.apiRoutes.map(r => normalize(r.path)))
const uniqueFetches = [...new Set(report.fetchCalls.map(f => f.url))]

const broken = []
const working = []

for (const url of uniqueFetches) {
  const normalized = normalize(url)
  if (apiSet.has(normalized)) {
    working.push(url)
  } else {
    // Try to match with wildcard
    let matched = false
    for (const api of apiSet) {
      const apiPattern = new RegExp('^' + api.replace(/:param/g, '[^/]+') + '$')
      if (apiPattern.test(normalized)) { matched = true; break }
    }
    if (matched) working.push(url)
    else broken.push(url)
  }
}

console.log('\n╔════════════════════════════════════════════════════════╗')
console.log('║           TOURNAOPS API AUDIT REPORT                   ║')
console.log('╚════════════════════════════════════════════════════════╝')
console.log(`\n📊 API Routes:      ${report.apiRoutes.length}`)
console.log(`📞 Fetch calls:     ${report.fetchCalls.length} (${uniqueFetches.length} unique)`)
console.log(`✅ Wired correctly: ${working.length}`)
console.log(`❌ Broken/missing:  ${broken.length}`)

if (broken.length > 0) {
  console.log('\n❌ BROKEN FETCH URLS (no matching API):')
  broken.forEach(url => {
    const files = report.fetchCalls.filter(f => f.url === url).map(f => f.file)
    console.log(`   ${url}`)
    files.forEach(f => console.log(`     used in: ${f}`))
  })
}

console.log('\n📋 API ROUTES:')
report.apiRoutes.sort((a, b) => a.path.localeCompare(b.path)).forEach(r => {
  console.log(`   ${r.methods.join(',').padEnd(20)} ${r.path}`)
})

// Save JSON report
fs.writeFileSync('api-audit-report.json', JSON.stringify({
  ...report,
  summary: {
    totalApis: report.apiRoutes.length,
    totalFetches: report.fetchCalls.length,
    uniqueFetches: uniqueFetches.length,
    working: working.length,
    broken: broken.length,
    brokenUrls: broken,
  }
}, null, 2))

console.log('\n💾 Full report saved to: api-audit-report.json')