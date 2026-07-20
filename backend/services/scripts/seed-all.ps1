param(
    [switch]$SkipMigrations
)

$services = @(
    "identity",
    "event",
    "ticket",
    "checkin",
    "crm",
    "sponsor",
    "payment"
)

$root = Split-Path -Parent $PSScriptRoot

foreach ($svc in $services) {
    $path = Join-Path $root $svc
    Write-Host "=== $svc ===" -ForegroundColor Cyan

    if (-not $SkipMigrations) {
        Write-Host "  -> Running migrations..." -ForegroundColor Yellow
        Push-Location $path
        npx prisma migrate deploy
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [ERROR] Migration failed for $svc" -ForegroundColor Red
            Pop-Location
            exit 1
        }
        Pop-Location
    }

    Write-Host "  -> Seeding..." -ForegroundColor Yellow
    Push-Location $path
    npx prisma db seed
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Seed failed for $svc" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location

    Write-Host "  [OK] $svc done" -ForegroundColor Green
}

Write-Host "`nAll services seeded successfully!" -ForegroundColor Green
