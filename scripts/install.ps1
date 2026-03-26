# 大圣 CLI - Windows 一键安装脚本
# 使用方法: irm https://raw.githubusercontent.com/shuashuai/dasheng/main/scripts/install.ps1 | iex

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# 日志函数
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "Info"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $colorMap = @{
        "Info" = "White"
        "Success" = "Green"
        "Warning" = "Yellow"
        "Error" = "Red"
    }
    $color = $colorMap[$Level]
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

try {
    Write-Log "=== 大圣 CLI Windows 安装脚本 ===" "Info"
    Write-Log ""
    
    # 配置
    $Repo = "shuashuai/dasheng"
    $InstallDir = "$env:LOCALAPPDATA\Programs\dasheng"
    $BinaryName = "dasheng.exe"
    
    Write-Log "安装目录: $InstallDir" "Info"
    
    # 获取最新版本
    Write-Log "获取最新版本信息..." "Info"
    $releaseUrl = "https://api.github.com/repos/$Repo/releases/latest"
    
    try {
        $ReleaseInfo = Invoke-RestMethod -Uri $releaseUrl -MaximumRedirection 5 -TimeoutSec 30
        $Version = $ReleaseInfo.tag_name
        Write-Log "最新版本: $Version" "Success"
    } catch {
        Write-Log "错误: 无法获取版本信息" "Error"
        Write-Log "可能原因: GitHub Releases 尚未发布" "Error"
        Write-Log ""
        Write-Log "解决方案:" "Info"
        Write-Log "  1. 访问 https://github.com/$Repo/releases 查看是否有发布版本" "Info"
        Write-Log "  2. 如果没有，请等待 GitHub Actions 构建完成" "Info"
        Write-Log "  3. 或从源码构建安装" "Info"
        Write-Log ""
        Write-Log "详细错误: $_" "Error"
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    # 检查是否存在 Windows 构建资源
    $asset = $ReleaseInfo.assets | Where-Object { $_.name -like "*win*.zip" -or $_.name -like "*win*.exe" } | Select-Object -First 1
    
    if (-not $asset) {
        Write-Log "错误: 该版本没有 Windows 构建资源" "Error"
        Write-Log "可用资源:" "Error"
        $ReleaseInfo.assets | ForEach-Object { Write-Log "  - $($_.name)" "Error" }
        Write-Log ""
        Write-Log "请等待 GitHub Actions 完成 Windows 构建" "Warning"
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    Write-Log "找到 Windows 构建: $($asset.name)" "Success"
    
    # 下载 URL
    $DownloadUrl = $asset.browser_download_url
    Write-Log "下载地址: $DownloadUrl" "Info"
    
    $TempDir = Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString())
    $DownloadedFile = Join-Path $TempDir $asset.name
    
    Write-Log "临时目录: $TempDir" "Info"
    
    # 创建临时目录
    try {
        New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
    } catch {
        Write-Log "错误: 无法创建临时目录 - $_" "Error"
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    # 下载
    Write-Log "开始下载..." "Info"
    try {
        $progressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $DownloadUrl -OutFile $DownloadedFile -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 120
        Write-Log "下载完成" "Success"
    } catch {
        Write-Log "错误: 下载失败 - $_" "Error"
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    # 检查文件
    if (-not (Test-Path $DownloadedFile)) {
        Write-Log "错误: 下载的文件不存在" "Error"
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    $fileSize = (Get-Item $DownloadedFile).Length
    Write-Log "文件大小: $fileSize bytes" "Info"
    
    # 处理 zip 或 exe
    $ExeFile = $null
    if ($asset.name -like "*.zip") {
        Write-Log "解压 zip 文件..." "Info"
        try {
            Expand-Archive -Path $DownloadedFile -DestinationPath $TempDir -Force
            $ExeFile = Get-ChildItem -Path $TempDir -Filter "*.exe" -Recurse | Select-Object -First 1
        } catch {
            Write-Log "错误: 解压失败 - $_" "Error"
            Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
            Read-Host "按 Enter 键退出"
            exit 1
        }
    } else {
        $ExeFile = Get-Item $DownloadedFile
    }
    
    if (-not $ExeFile) {
        Write-Log "错误: 无法找到可执行文件" "Error"
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    Write-Log "找到可执行文件: $($ExeFile.Name)" "Success"
    
    # 创建安装目录
    try {
        if (!(Test-Path $InstallDir)) {
            New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        }
    } catch {
        Write-Log "错误: 无法创建安装目录 - $_" "Error"
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    # 安装
    Write-Log "安装到 $InstallDir..." "Info"
    try {
        $destPath = Join-Path $InstallDir $BinaryName
        Copy-Item -Path $ExeFile.FullName -Destination $destPath -Force
        Write-Log "安装完成" "Success"
    } catch {
        Write-Log "错误: 安装失败 - $_" "Error"
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    # 添加到 PATH
    $UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($UserPath -notlike "*$InstallDir*") {
        try {
            [Environment]::SetEnvironmentVariable("PATH", "$UserPath;$InstallDir", "User")
            Write-Log "已添加到 PATH，请重新打开 PowerShell" "Warning"
        } catch {
            Write-Log "警告: 无法添加到 PATH - $_" "Warning"
        }
    }
    
    # 清理
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    
    # 验证
    $finalPath = Join-Path $InstallDir $BinaryName
    if (Test-Path $finalPath) {
        Write-Log ""
        Write-Log "=== 安装成功! ===" "Success"
        Write-Log "安装位置: $finalPath" "Success"
        Write-Log ""
        Write-Log "重新打开 PowerShell 后运行 'dasheng --help'" "Info"
    } else {
        Write-Log "错误: 安装验证失败" "Error"
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    Write-Log ""
    Read-Host "按 Enter 键退出"
    
} catch {
    Write-Log "未捕获的错误: $_" "Error"
    Read-Host "按 Enter 键退出"
    exit 1
}
