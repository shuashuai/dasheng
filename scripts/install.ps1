# 🐵 大圣 CLI - Windows 一键安装脚本
# 使用方法: .\install.ps1

$ErrorActionPreference = "Stop"

# 配置
$Repo = "YOUR_USERNAME/dasheng"
$InstallDir = "$env:LOCALAPPDATA\Programs\dasheng"
$BinaryName = "dasheng.exe"

# 颜色输出
function Write-Color {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

# 显示 Logo
Write-Color ""
Write-Color "   ____            _               " Blue
Write-Color "  / ___| __ _ _ __| | _____  ___ " Blue
Write-Color " | |  _ / _  | '__| |/ / _ \/ __|" Blue
Write-Color " | |_| | (_| | |  |   <  __/\__ \\" Blue
Write-Color "  \\____|\\__,_|_|  |_|\\_\\___||___/" Blue
Write-Color ""
Write-Color "  🐵 大圣 CLI - Windows 一键安装脚本" Blue
Write-Color ""

# 获取最新版本
Write-Color "🔍 正在获取最新版本..." Blue
try {
    $ReleaseInfo = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest"
    $Version = $ReleaseInfo.tag_name
    Write-Color "📌 最新版本: $Version" Blue
} catch {
    Write-Color "❌ 无法获取最新版本信息" Red
    exit 1
}

# 下载 URL
$DownloadUrl = "https://github.com/$Repo/releases/download/$Version/dasheng-win-x64.zip"
$TempDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()
$ZipFile = "$TempDir\dasheng.zip"

# 创建临时目录
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

# 下载
try {
    Write-Color "📥 正在下载 $BinaryName $Version..." Blue
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipFile -UseBasicParsing
} catch {
    Write-Color "❌ 下载失败: $_" Red
    exit 1
}

# 解压
try {
    Write-Color "📦 正在解压..." Blue
    Expand-Archive -Path $ZipFile -DestinationPath $TempDir -Force
} catch {
    Write-Color "❌ 解压失败: $_" Red
    exit 1
}

# 创建安装目录
if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# 移动可执行文件
try {
    Write-Color "🚀 正在安装到 $InstallDir..." Blue
    Move-Item -Path "$TempDir\dasheng-win-x64.exe" -Destination "$InstallDir\$BinaryName" -Force
} catch {
    Write-Color "❌ 安装失败: $_" Red
    exit 1
}

# 添加到 PATH
$UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($UserPath -notlike "*$InstallDir*") {
    Write-Color "🔧 正在添加到 PATH..." Blue
    [Environment]::SetEnvironmentVariable("PATH", "$UserPath;$InstallDir", "User")
    Write-Color "✅ 已添加到 PATH，请重新打开终端以生效" Green
}

# 清理
Remove-Item -Path $TempDir -Recurse -Force

# 验证
Write-Color ""
Write-Color "✅ $BinaryName 安装成功！" Green
Write-Color "📍 安装位置: $InstallDir\$BinaryName" Blue
Write-Color ""
Write-Color "🎉 安装完成！重新打开 PowerShell 后使用 'dasheng --help' 开始探索。" Green
Write-Color "📖 文档: https://github.com/$Repo/blob/main/docs/USER_GUIDE.md" Blue
