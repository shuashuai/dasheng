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
    
    # 检查网络连接
    Write-Log "检查网络连接..." "Info"
    try {
        $testConnection = Test-Connection -ComputerName github.com -Count 1 -Quiet -ErrorAction SilentlyContinue
        if (-not $testConnection) {
            Write-Log "警告: 无法连接到 github.com，请检查网络" "Warning"
        }
    } catch {
        Write-Log "警告: 网络检查失败 - $_" "Warning"
    }
    
    # 获取最新版本
    Write-Log "获取最新版本信息..." "Info"
    $releaseUrl = "https://api.github.com/repos/$Repo/releases/latest"
    Write-Log "API 地址: $releaseUrl" "Info"
    
    try {
        $ReleaseInfo = Invoke-RestMethod -Uri $releaseUrl -MaximumRedirection 5 -TimeoutSec 30
        $Version = $ReleaseInfo.tag_name
        Write-Log "最新版本: $Version" "Success"
    } catch {
        Write-Log "错误: 无法获取版本信息" "Error"
        Write-Log "详细错误: $_" "Error"
        Write-Log "请检查: 1) 网络连接 2) GitHub 访问 3) 仓库是否存在" "Error"
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    # 下载 URL
    $DownloadUrl = "https://github.com/$Repo/releases/download/$Version/dasheng-win-x64.zip"
    Write-Log "下载地址: $DownloadUrl" "Info"
    
    $TempDir = Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString())
    $ZipFile = Join-Path $TempDir "dasheng.zip"
    
    Write-Log "临时目录: $TempDir" "Info"
    
    # 创建临时目录
    try {
        New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
        Write-Log "创建临时目录成功" "Success"
    } catch {
        Write-Log "错误: 无法创建临时目录 - $_" "Error"
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    # 下载
    Write-Log "开始下载..." "Info"
    try {
        $progressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipFile -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 120
        Write-Log "下载完成" "Success"
    } catch {
        Write-Log "错误: 下载失败" "Error"
        Write-Log "详细错误: $_" "Error"
        Write-Log "可能的解决方案:" "Error"
        Write-Log "  1. 检查 GitHub Releases 是否存在: https://github.com/$Repo/releases" "Error"
        Write-Log "  2. 手动下载并安装" "Error"
        Write-Log "  3. 检查网络连接" "Error"
        
        # 清理
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    # 检查文件是否存在
    if (-not (Test-Path $ZipFile)) {
        Write-Log "错误: 下载的文件不存在" "Error"
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    $fileSize = (Get-Item $ZipFile).Length
    Write-Log "下载文件大小: $fileSize bytes" "Info"
    
    # 解压
    Write-Log "开始解压..." "Info"
    try {
        Expand-Archive -Path $ZipFile -DestinationPath $TempDir -Force
        Write-Log "解压完成" "Success"
    } catch {
        Write-Log "错误: 解压失败 - $_" "Error"
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    # 查找解压后的 exe 文件
    Write-Log "查找可执行文件..." "Info"
    $ExeFile = Get-ChildItem -Path $TempDir -Filter "*.exe" -Recurse | Select-Object -First 1
    
    if (-not $ExeFile) {
        Write-Log "错误: 无法在压缩包中找到可执行文件" "Error"
        Write-Log "压缩包内容:" "Error"
        Get-ChildItem -Path $TempDir -Recurse | ForEach-Object { Write-Log "  $_" "Error" }
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    Write-Log "找到可执行文件: $($ExeFile.FullName)" "Success"
    
    # 创建安装目录
    Write-Log "创建安装目录..." "Info"
    try {
        if (!(Test-Path $InstallDir)) {
            New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        }
        Write-Log "安装目录准备完成" "Success"
    } catch {
        Write-Log "错误: 无法创建安装目录 $InstallDir" "Error"
        Write-Log "详细错误: $_" "Error"
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    # 移动可执行文件
    Write-Log "安装可执行文件..." "Info"
    try {
        $destPath = Join-Path $InstallDir $BinaryName
        Copy-Item -Path $ExeFile.FullName -Destination $destPath -Force
        Write-Log "安装完成: $destPath" "Success"
    } catch {
        Write-Log "错误: 安装失败 - $_" "Error"
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    # 添加到 PATH
    Write-Log "配置 PATH..." "Info"
    $UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($UserPath -notlike "*$InstallDir*") {
        try {
            [Environment]::SetEnvironmentVariable("PATH", "$UserPath;$InstallDir", "User")
            Write-Log "已添加到 PATH" "Success"
            Write-Log "请重新打开 PowerShell 以使用 'dasheng' 命令" "Warning"
        } catch {
            Write-Log "警告: 无法添加到 PATH - $_" "Warning"
        }
    } else {
        Write-Log "PATH 中已存在安装目录" "Info"
    }
    
    # 清理
    Write-Log "清理临时文件..." "Info"
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    
    # 验证
    Write-Log "验证安装..." "Info"
    $finalPath = Join-Path $InstallDir $BinaryName
    if (Test-Path $finalPath) {
        Write-Log ""
        Write-Log "=== 安装成功! ===" "Success"
        Write-Log "安装位置: $finalPath" "Success"
        Write-Log ""
        Write-Log "使用方法:" "Info"
        Write-Log "  1. 重新打开 PowerShell" "Info"
        Write-Log "  2. 运行 'dasheng --help' 查看帮助" "Info"
        Write-Log ""
        
        # 尝试运行版本命令
        try {
            $version = & $finalPath --version 2>$null
            if ($version) {
                Write-Log "版本: $version" "Success"
            }
        } catch {
            Write-Log "版本检查跳过" "Warning"
        }
    } else {
        Write-Log "错误: 安装验证失败，文件不存在" "Error"
        Read-Host "按 Enter 键退出"
        exit 1
    }
    
    Write-Log ""
    Read-Host "按 Enter 键退出"
    
} catch {
    Write-Log "未捕获的错误: $_" "Error"
    Write-Log "错误发生在: $($_.ScriptStackTrace)" "Error"
    Read-Host "按 Enter 键退出"
    exit 1
}
