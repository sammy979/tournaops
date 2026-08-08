$files = @(
    "C:\Users\magar\Documents\tournaops\app\dashboard\layout.tsx",
    "C:\Users\magar\Documents\tournaops\app\page.tsx",
    "C:\Users\magar\Documents\tournaops\app\(auth)\login\page.tsx",
    "C:\Users\magar\Documents\tournaops\app\(auth)\register\page.tsx"
)

foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath $file)) { continue }
    $lines = Get-Content -LiteralPath $file
    $result = @()
    $skipNext = 0
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($skipNext -gt 0) { $skipNext--; continue }
        $line = $lines[$i]

        # Pattern: <div style={{ ...gradient...f59e0b, #f97316... }}><Image src="/logo.png".../></div>
        # Detect start of gradient wrapper div containing logo
        if ($line -match 'linear-gradient.*#f59e0b.*#f97316' -and $i -gt 0) {
            # Look back to find the opening <div style={{
            $back = $i - 1
            while ($back -ge 0 -and $lines[$back] -notmatch '<div style=\{\{') { $back-- }
            # Look forward for closing </div>
            $forward = $i + 1
            while ($forward -lt $lines.Count -and $lines[$forward] -notmatch '</div>') { $forward++ }
            # Check if there is <Image src="/logo.png" inside
            $hasLogo = $false
            for ($j = $back; $j -le $forward; $j++) {
                if ($lines[$j] -match 'logo\.png') { $hasLogo = $true; break }
            }
            if ($hasLogo -and $back -ge 0 -and $forward -lt $lines.Count) {
                # Remove already added lines from back to i-1
                while ($result.Count -gt $back) { $result = $result[0..($result.Count - 2)] }
                # Add clean logo
                $indent = ($lines[$back] -replace '\S.*$','')
                $result += "$indent<Image src=`"/logo.png`" alt=`"TournaOps`" width={44} height={44} style={{ objectFit: `"contain`", borderRadius: `"0.5rem`" }} priority />"
                $skipNext = $forward - $i
                continue
            }
        }

        $result += $line
    }

    # Remove any redundant <span>TournaOps</span> next to a logo Image
    $final = @()
    for ($i = 0; $i -lt $result.Count; $i++) {
        $ln = $result[$i]
        if ($ln -match '<span[^>]*>TournaOps</span>' -and $i -gt 0) {
            # check if a logo.png is within 3 lines above
            $skip = $false
            for ($j = [Math]::Max(0,$i-3); $j -lt $i; $j++) {
                if ($result[$j] -match 'logo\.png') { $skip = $true; break }
            }
            if ($skip) { continue }
        }
        $final += $ln
    }

    [System.IO.File]::WriteAllLines($file, $final)
    Write-Host "Fixed: $file"
}
