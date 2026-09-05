param(
  [string]$ApiUrl = ''
)

$ErrorActionPreference = 'Stop'

function Read-DotEnvValue($name) {
  $line = Get-Content (Join-Path $PSScriptRoot '.env') |
    Where-Object { $_ -match "^$name=(.*)$" } |
    Select-Object -First 1

  if (-not $line) {
    throw "$name is missing from backend/.env"
  }

  return ($line -replace "^$name=", '').Trim()
}

$port = Read-DotEnvValue 'PORT'
if (-not $ApiUrl) {
  $ApiUrl = "http://localhost:$port"
}
$ApiUrl = $ApiUrl.TrimEnd('/')
$setupKey = Read-DotEnvValue 'TUTOR_SETUP_KEY'

Write-Host 'Create Campus2Class tutor account' -ForegroundColor Cyan
$name = Read-Host 'Tutor name'
$email = Read-Host 'Tutor email'
$passwordSecure = Read-Host 'Tutor password (minimum 8 characters)' -AsSecureString
$password = [System.Net.NetworkCredential]::new('', $passwordSecure).Password
$subjectsInput = Read-Host 'Subjects, comma-separated (example: math,english)'
$subjects = @(
  $subjectsInput -split ',' |
    ForEach-Object { $_.Trim().ToLower() } |
    Where-Object { $_ }
)

if ($password.Length -lt 8) {
  throw 'The tutor password must be at least 8 characters.'
}

$body = @{
  name = $name
  email = $email
  password = $password
  subjects = $subjects
} | ConvertTo-Json

try {
  $result = Invoke-RestMethod `
    -Uri "$apiUrl/api/tutor/setup" `
    -Method Post `
    -Headers @{ 'x-tutor-setup-key' = $setupKey } `
    -ContentType 'application/json' `
    -Body $body

  Write-Host "Tutor created: $($result.email)" -ForegroundColor Green
  Write-Host 'Open http://localhost:5173/tutor-login to sign in.'
} catch {
  $response = $_.Exception.Response
  if ($response) {
    $reader = [System.IO.StreamReader]::new($response.GetResponseStream())
    $message = $reader.ReadToEnd()
    throw "Tutor setup failed: $message"
  }
  throw
}