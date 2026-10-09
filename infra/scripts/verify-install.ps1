<#
.SYNOPSIS
  Verifica o instalador do ADVERTEX AI Studio em um Windows real.

.DESCRIPTION
  1. Executa o instalador em modo silencioso (/S).
  2. Confirma o executável, o atalho na Área de Trabalho, o atalho no menu
     Iniciar (ambos apontando para o executável instalado) e o registro de
     desinstalação.
  3. Abre o aplicativo PELO ATALHO, usando uma pasta de dados temporária, e
     confirma no log de diagnóstico que ele iniciou e abriu o banco de dados
     sem depender da pasta de desenvolvimento.
  4. Opcionalmente (-Uninstall), desinstala e confirma a remoção.

  Compilar não prova que o atalho foi criado: este script prova.

.EXAMPLE
  npm run verify:install
  powershell -ExecutionPolicy Bypass -File infra/scripts/verify-install.ps1 -Uninstall
#>
[CmdletBinding()]
param(
  [string]$Installer,
  [switch]$Uninstall,
  [int]$StartupTimeoutSeconds = 45
)

$ErrorActionPreference = 'Stop'
$AppName = 'ADVERTEX AI Studio'
$ExeName = "$AppName.exe"
$failures = New-Object System.Collections.Generic.List[string]

function Pass([string]$msg) { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Fail([string]$msg) { Write-Host "  [FALHA] $msg" -ForegroundColor Red; $failures.Add($msg) | Out-Null }
function Step([string]$msg) { Write-Host "`n== $msg" -ForegroundColor Cyan }

function Resolve-Shortcut([string]$path) {
  $shell = New-Object -ComObject WScript.Shell
  return $shell.CreateShortcut($path).TargetPath
}

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
if (-not $Installer) {
  $candidate = Get-ChildItem -Path (Join-Path $root 'release') -Filter 'ADVERTEX-AI-Studio-Setup-*.exe' -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $candidate) { throw 'Instalador não encontrado em release\. Rode "npm run dist:win" antes.' }
  $Installer = $candidate.FullName
}
Write-Host "Instalador: $Installer"

$installDir = Join-Path $env:LOCALAPPDATA "Programs\$AppName"
$exePath = Join-Path $installDir $ExeName
$desktopLnk = Join-Path ([Environment]::GetFolderPath('Desktop')) "$AppName.lnk"
$startMenuLnk = Join-Path ([Environment]::GetFolderPath('Programs')) "$AppName.lnk"

Step 'Instalação silenciosa'
$proc = Start-Process -FilePath $Installer -ArgumentList '/S' -PassThru -Wait
if ($proc.ExitCode -eq 0) { Pass "Instalador terminou (código 0)" } else { Fail "Instalador retornou código $($proc.ExitCode)" }

Step 'Arquivos e atalhos'
if (Test-Path $exePath) { Pass "Executável: $exePath" } else { Fail "Executável ausente: $exePath" }

foreach ($lnk in @(@{ Name = 'Área de Trabalho'; Path = $desktopLnk }, @{ Name = 'Menu Iniciar'; Path = $startMenuLnk })) {
  if (Test-Path $lnk.Path) {
    $target = Resolve-Shortcut $lnk.Path
    if ($target -and (Test-Path $target) -and ((Resolve-Path $target).Path -eq (Resolve-Path $exePath).Path)) {
      Pass "Atalho ($($lnk.Name)) aponta para o executável instalado"
    } else {
      Fail "Atalho ($($lnk.Name)) aponta para destino inválido: '$target'"
    }
  } else {
    Fail "Atalho ($($lnk.Name)) não encontrado: $($lnk.Path)"
  }
}

$uninstallKey = Get-ChildItem 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall', 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall' -ErrorAction SilentlyContinue |
  ForEach-Object { Get-ItemProperty $_.PSPath } | Where-Object { $_.DisplayName -like "$AppName*" } | Select-Object -First 1
if ($uninstallKey) { Pass "Registro de desinstalação: $($uninstallKey.DisplayName) $($uninstallKey.DisplayVersion)" } else { Fail 'Registro de desinstalação não encontrado' }

Step 'Abertura pelo atalho (independente da pasta de desenvolvimento)'
$userData = Join-Path ([IO.Path]::GetTempPath()) ("advertex-verify-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $userData | Out-Null
$env:ADVERTEX_USER_DATA = $userData
$target = if (Test-Path $desktopLnk) { Resolve-Shortcut $desktopLnk } else { $exePath }
# Diretório de trabalho fora do repositório para provar que nada é lido daqui.
$app = Start-Process -FilePath $target -WorkingDirectory ([IO.Path]::GetTempPath()) -PassThru
$deadline = (Get-Date).AddSeconds($StartupTimeoutSeconds)
$started = $false
$dbOpened = $false
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 1
  $log = Get-ChildItem (Join-Path $userData 'logs') -Filter '*.log' -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($log) {
    $content = Get-Content $log.FullName -Raw
    $started = $content -match '"msg":"app.start"'
    $dbOpened = $content -match '"msg":"db.open"'
    if ($content -match '"msg":"bootstrap.failed"') { break }
    if ($started -and $dbOpened) { break }
  }
}
Remove-Item Env:\ADVERTEX_USER_DATA
if ($started) { Pass 'Aplicativo iniciou (app.start no log)' } else { Fail 'Aplicativo não registrou app.start no log' }
if ($dbOpened) { Pass 'Banco de dados aberto (db.open no log)' } else { Fail 'Banco de dados não foi aberto' }
if (Test-Path (Join-Path $userData 'data\advertex.sqlite')) { Pass 'Arquivo de banco criado na pasta de dados do usuário' } else { Fail 'Arquivo de banco não criado' }

$running = Get-Process -Id $app.Id -ErrorAction SilentlyContinue
if ($running) { Pass 'Processo em execução após a inicialização' } else { Fail 'Processo encerrou inesperadamente' }
Get-Process | Where-Object { $_.Path -eq $exePath } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

if ($Uninstall) {
  Step 'Desinstalação'
  $uninstaller = Join-Path $installDir "Uninstall $AppName.exe"
  if (Test-Path $uninstaller) {
    Start-Process -FilePath $uninstaller -ArgumentList '/S' -Wait | Out-Null
    # O desinstalador NSIS se copia para %TEMP% e continua em segundo plano.
    $deadline = (Get-Date).AddSeconds(60)
    while ((Test-Path $exePath) -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 1 }
    if (-not (Test-Path $exePath)) { Pass 'Executável removido' } else { Fail 'Executável ainda presente após desinstalar' }
    if (-not (Test-Path $desktopLnk)) { Pass 'Atalho da Área de Trabalho removido' } else { Fail 'Atalho da Área de Trabalho permanece' }
    if (-not (Test-Path $startMenuLnk)) { Pass 'Atalho do menu Iniciar removido' } else { Fail 'Atalho do menu Iniciar permanece' }
  } else {
    Fail "Desinstalador não encontrado: $uninstaller"
  }
}

Remove-Item -Recurse -Force $userData -ErrorAction SilentlyContinue

Write-Host ''
if ($failures.Count -eq 0) {
  Write-Host 'VERIFICAÇÃO CONCLUÍDA: instalação, atalhos e abertura funcionando.' -ForegroundColor Green
  exit 0
}
Write-Host "VERIFICAÇÃO FALHOU ($($failures.Count) problema(s)):" -ForegroundColor Red
$failures | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
exit 1
