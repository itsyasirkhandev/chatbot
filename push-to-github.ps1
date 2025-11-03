# Push to GitHub Script
# Repository: https://github.com/itsyasirkhandev/chatbot.git

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Push to GitHub - Quick Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git initialized" -ForegroundColor Green
    Write-Host ""
}

# Check if remote exists
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host "Adding remote repository..." -ForegroundColor Yellow
    git remote add origin https://github.com/itsyasirkhandev/chatbot.git
    Write-Host "✓ Remote added" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Remote already configured: $remoteUrl" -ForegroundColor Green
    Write-Host ""
}

# Show status
Write-Host "Checking repository status..." -ForegroundColor Yellow
Write-Host ""
git status
Write-Host ""

# Warning about .env.local
Write-Host "⚠️  IMPORTANT: Checking for sensitive files..." -ForegroundColor Yellow
$envFiles = git ls-files | Select-String -Pattern "\.env"
if ($envFiles) {
    Write-Host "❌ WARNING: .env files found in repository!" -ForegroundColor Red
    Write-Host "   Run: git rm --cached .env.local" -ForegroundColor Red
    Write-Host ""
    exit 1
} else {
    Write-Host "✓ No .env files in repository (API key is safe)" -ForegroundColor Green
    Write-Host ""
}

# Confirm before proceeding
$confirm = Read-Host "Do you want to proceed with commit and push? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Aborted." -ForegroundColor Yellow
    exit 0
}

# Stage all files
Write-Host ""
Write-Host "Staging files..." -ForegroundColor Yellow
git add .
Write-Host "✓ Files staged" -ForegroundColor Green
Write-Host ""

# Get commit message
Write-Host "Enter commit message (or press Enter for default):" -ForegroundColor Cyan
$commitMsg = Read-Host
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Update chatbot: Light mode with Gemini 2.5 Flash"
}

# Commit
Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "$commitMsg"
Write-Host "✓ Changes committed" -ForegroundColor Green
Write-Host ""

# Set main branch
Write-Host "Setting branch to main..." -ForegroundColor Yellow
git branch -M main
Write-Host ""

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository: https://github.com/itsyasirkhandev/chatbot" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Visit https://vercel.com" -ForegroundColor White
    Write-Host "2. Import your GitHub repository" -ForegroundColor White
    Write-Host "3. Add GEMINI_API_KEY environment variable" -ForegroundColor White
    Write-Host "4. Deploy!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Check the error above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "- If authentication failed, set up GitHub credentials" -ForegroundColor White
    Write-Host "- If rejected, try: git pull origin main --rebase" -ForegroundColor White
    Write-Host "- If repository doesn't exist, create it on GitHub first" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
