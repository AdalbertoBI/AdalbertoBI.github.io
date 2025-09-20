param(
  [string]$GitHubToken,
  [string]$GithubUser = "AdalbertoBI",
  [string]$RepoName = "AdalbertoBI/AdalbertoBI.whatintegra"
)

$ErrorActionPreference = 'Stop'

if (-not $GitHubToken) {
  Write-Host "Digite seu GitHub Personal Access Token (entrada oculta):" -ForegroundColor Yellow
  $sec = Read-Host -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  try { $GitHubToken = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

Write-Host "Publicando site para $GithubUser/$RepoName..." -ForegroundColor Cyan

$sitePath = "c:\Users\PCRW\Desktop\WhatIntegra\site"
if (-not (Test-Path $sitePath)) { throw "Pasta do site não encontrada: $sitePath" }

# 1) Criar repositório via API (se não existir)
$headers = @{ Authorization = "token $GitHubToken"; 'User-Agent' = 'WhatIntegra-Publish-Script' }

try {
  $repoCheck = Invoke-RestMethod -Method GET -Headers $headers -Uri "https://api.github.com/repos/$GithubUser/$RepoName"
  Write-Host "Repositório já existe: $GithubUser/$RepoName"
} catch {
  Write-Host "Criando repositório $GithubUser/$RepoName..."
  $body = @{ name = $RepoName; private = $false } | ConvertTo-Json
  $repoCreate = Invoke-RestMethod -Method POST -Headers $headers -Uri "https://api.github.com/user/repos" -Body $body
}

# 2) Inicializar git na pasta do site
Push-Location $sitePath
if (-not (Test-Path ".git")) {
  git init | Out-Null
}
try { git remote remove origin 2>$null } catch {}
$repoUrl = "https://${GithubUser}:${GitHubToken}@github.com/${GithubUser}/${RepoName}.git"
git remote add origin $repoUrl

# 3) Commit e push
git add .
if (-not (git diff --cached --quiet 2>$null)) {
  git commit -m "Publish site"
}
git branch -M main
git push -u origin main

# 4) Habilitar GitHub Pages (branch main, root)
Write-Host "Configurando GitHub Pages..."
$pagesBody = @{ source = @{ branch = "main"; path = "/" } } | ConvertTo-Json
Invoke-RestMethod -Method PUT -Headers $headers -Uri "https://api.github.com/repos/$GithubUser/$RepoName/pages" -Body $pagesBody | Out-Null

# 5) Limpar remote com token (trocar por URL sem credenciais)
git remote remove origin
git remote add origin "https://github.com/$GithubUser/$RepoName.git"

Pop-Location

Write-Host "Publicado. URL:" -NoNewline; Write-Host " https://$GithubUser.github.io" -ForegroundColor Green
