---
title: 使用Samba在macOS中挂载Linux目录
date: 2026-02-04
category: 部署
tags:
  - 部署
  - Samba
description: 使用Samba挂载远程服务器目录
---

---

# macOS 挂载 Linux SMB 共享操作指南

本指南适用于将 Linux 容器内的路径（如深度学习项目目录）挂载到 macOS，并解决因 FUSE 导致的卡顿问题及非标准端口连接问题。

## 一、 服务端配置 (Linux/Docker 容器内)

### 1. 安装 Samba

```bash
apt-get update && apt-get install samba -y

```

### 2. 编辑配置文件

编辑 `/etc/samba/smb.conf`：

```bash
nano /etc/samba/smb.conf

```

在文件末尾添加以下内容（**注意修改端口和路径**）：

```text
[global]
   # 指定自定义端口
   smb ports = 17824
   # 性能优化：禁用符号链接警告，允许直接读写
   unix extensions = no

[QCNet]
   comment = Project Share
   path = /root/projects/QCNet
   browseable = yes
   writable = yes
   guest ok = yes
   read only = no
   create mask = 0775
   directory mask = 0775
   # 核心：强制以 root 身份操作，避免 Mac 权限冲突
   force user = root

```

### 3. 设置访问账号

设置 Samba 专用密码（建议账号设为 `root`）：

```bash
smbpasswd -a root

```

### 4. 启动服务

```bash
service smbd restart

```

---

## 二、 网络与防火墙配置

### 1. 端口转发 (如果使用 Docker)

确保启动容器时已映射自定义端口：

```bash
docker run -p 17824:17824 ...

```

### 2. 宿主机防火墙放行

如果宿主机开启了 `ufw`：

```bash
sudo ufw allow 17824/tcp

```

---

## 三、 客户端挂载 (macOS)

由于 macOS Finder 对非标准端口支持不稳定，建议优先使用**终端命令**挂载。

### 方案 A：终端手动挂载 (最推荐)

1. 创建本地挂载点：
```bash
mkdir -p ~/Documents/remote_project

```


2. 执行挂载命令：
```bash
mount_smbfs -I [服务器IP] -p 17824 //root@[服务器IP]/QCNet ~/Documents/remote_project

```


*按提示输入之前设置的 `smbpasswd` 密码。*

### 方案 B：Finder 访问 (尝试)

1. 在访达中按 `Command + K`。
2. 输入：`smb://[服务器IP]:17824/QCNet`
3. 选择“注册用户”，输入 `root` 及其密码。

---

## 四、 常见问题排除 (Tips)

### 1. 挂载后权限不足

如果无法新建文件，请在 Linux 端执行：

```bash
chmod -R 777 /root/projects/QCNet

```

### 2. 卸载共享目录

如果连接断开导致 Finder 卡死，执行强制卸载：

```bash
umount -f ~/Documents/remote_project

```

### 3. 检查端口是否连通

在 Mac 终端运行，确认网络路径无误：

```bash
nc -zv [服务器IP] 17824

```

### 4. 解决 Finder 自动生成 .DS_Store

在 Mac 终端执行，防止在 Linux 上产生大量碎片文件：

```bash
defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool TRUE

```

---