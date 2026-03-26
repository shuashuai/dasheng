# 大圣 CLI - Windows 一键安装脚本
# 使用方法: irm https://raw.githubusercontent.com/shuashuai/dasheng/main/scripts/install.ps1 | iex

$ErrorActionPreference = "Stop"

# 配置
$Repo = "shuashuai/dasheng"
$InstallDir = "$env:LOCALAPPDATA\Programs\dasheng"
$BinaryName = "dasheng.exe"

Write-Host ""
Write-Host "  大圣 CLI - Windows 一键安装脚本" -ForegroundColor Cyan
Write-Host ""

# 获取最新版本
Write-Host "正在获取最新版本..." -ForegroundColor Blue
try {
    $ReleaseInfo = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -MaximumRedirection 5
    $Version = $ReleaseInfo.tag_name
    Write-Host "最新版本: $Version" -ForegroundColor Green
} catch {
    Write-Host "错误: 无法获取最新版本信息，请检查网络连接或 GitHub 访问" -ForegroundColor Red
    Write-Host "详细错误: $_" -ForegroundColor Red
    exit 1
}

# 下载 URL
$DownloadUrl = "https://github.com/$Repo/releases/download/$Version/dasheng-win-x64.zip"
$TempDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()
$ZipFile = "$TempDir\dasheng.zip"

# 创建临时目录
try {
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
} catch {
    Write-Host "错误: 无法创建临时目录" -ForegroundColor Red
    exit 1
}

# 下载
Write-Host "正在下载 $BinaryName $Version..." -ForegroundColor Blue
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipFile -UseBasicParsing -MaximumRedirection 5
    Write-Host "下载完成" -ForegroundColor Green
} catch {
    Write-Host "错误: 下载失败" -ForegroundColor Red
    Write-Host "请检查 GitHub Releases 是否存在: https://github.com/$Repo/releases" -ForegroundColor Red
    Write-Host "下载地址: $DownloadUrl" -ForegroundColor Gray
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

# 解压
Write-Host "正在解压..." -ForegroundColor Blue
try {
    Expand-Archive -Path $ZipFile -DestinationPath $TempDir -Force
    Write-Host "解压完成" -ForegroundColor Green
} catch {
    Write-Host "错误: 解压失败 - $_" -ForegroundColor Red
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

# 查找解压后的 exe 文件
$ExeFile = Get-ChildItem -Path $TempDir -Filter "*.exe" | Select-Object -First 1
if (-not $ExeFile) {
    Write-Host "错误: 无法在压缩包中找到可执行文件" -ForegroundColor Red
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

# 创建安装目录
try {
    if (!(Test-Path $InstallDir)) {
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    }
} catch {
    Write-Host "错误: 无法创建安装目录 $InstallDir" -ForegroundColor Red
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

# 移动可执行文件
try {
    Write-Host "正在安装到 $InstallDir..." -ForegroundColor Blue
    Copy-Item -Path $ExeFile.FullName -Destination "$InstallDir\$BinaryName" -Force
    Write-Host "安装完成" -ForegroundColor Green
} catch {
    Write-Host "错误: 安装失败 - $_" -ForegroundColor Red
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

# 添加到 PATH
$UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($UserPath -notlike "*$InstallDir*") {
    Write-Host "正在添加到 PATH..." -ForegroundColor Blue
    [Environment]::SetEnvironmentVariable("PATH", "$UserPath;$InstallDir", "User")
    Write-Host "已添加到 PATH，请重新打开终端以生效" -ForegroundColor Green
}

# 清理
Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue

# 验证
try {
    $InstalledVersion = & "$InstallDir\$BinaryName" --version 2>$null
    Write-Host ""
    Write-Host "安装成功!" -ForegroundColor Green
    Write-Host "安装位置: $InstallDir\$BinaryName" -ForegroundColor Blue
    if ($InstalledVersion) {
        Write-Host "版本: $InstalledVersion" -ForegroundColor Blue
    }
    Write-Host ""
    Write-Host "重新打开 PowerShell 后使用 'dasheng --help' 开始探索" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "安装完成，但验证失败" -ForegroundColor Yellow
    Write-Host "安装位置: $InstallDir\$BinaryName" -ForegroundColor Blue
    Write-Host "请手动运行 '$InstallDir\$BinaryName --version' 验证" -ForegroundColor Yellow
}
