---
title: 部署meilisearch作为Openlist的后端索引
date: 2025-12-02
category: 部署
tags:
  - 部署
  - openlist
  - meilisearch
description: 部署meilisearch作为Openlist的后端索引
---

# Debian 系统部署 Meilisearch 完全指南

## 环境说明

- **操作系统**: Debian
- **Meilisearch 版本**: Latest
- **服务管理**: systemd
- **应用场景**: 生产环境部署

## 一、安装 Meilisearch

### 1.1 使用官方安装脚本

```bash
# 下载并安装 Meilisearch
curl -L https://install.meilisearch.com | sh

# 移动到系统路径
sudo mv ./meilisearch /usr/local/bin/

# 添加执行权限
sudo chmod +x /usr/local/bin/meilisearch

# 验证安装
/usr/local/bin/meilisearch --version
```

### 1.2 创建专用用户和目录

```bash
# 创建 meilisearch 系统用户（无登录权限）
sudo useradd -r -s /bin/false meilisearch

# 创建工作目录结构
sudo mkdir -p /var/lib/meilisearch/{data,dumps,snapshots}

# 设置目录权限
sudo chown -R meilisearch:meilisearch /var/lib/meilisearch
```

## 二、配置 Meilisearch

### 2.1 下载官方配置文件

```bash
# 下载默认配置模板
sudo curl https://raw.githubusercontent.com/meilisearch/meilisearch/latest/config.toml -o /etc/meilisearch.toml
```

### 2.2 编辑配置文件

```bash
sudo nano /etc/meilisearch.toml
```

**关键配置项**：

```toml
# 运行环境（生产环境必须设置为 production）
env = "production"

# Master Key（生产环境强制要求，至少 16 字符）
master_key = "YOUR_SECURE_MASTER_KEY_HERE"

# 数据存储路径
db_path = "/var/lib/meilisearch/data"

# 导出数据路径
dump_dir = "/var/lib/meilisearch/dumps"

# 快照路径
snapshot_dir = "/var/lib/meilisearch/snapshots"

# HTTP 监听地址（默认仅本地访问）
http_addr = "127.0.0.1:7700"
# 如需外部访问可改为: http_addr = "0.0.0.0:7700"
```

### 2.3 生成安全的 Master Key

```bash
# 生成 32 字符随机密钥
openssl rand -base64 32
```

## 三、配置 systemd 服务

### 3.1 创建服务文件

```bash
sudo cat << 'EOF' > /etc/systemd/system/meilisearch.service
[Unit]
Description=Meilisearch
After=systemd-user-sessions.service

[Service]
Type=simple
WorkingDirectory=/var/lib/meilisearch
ExecStart=/usr/local/bin/meilisearch --config-file-path /etc/meilisearch.toml
User=meilisearch
Group=meilisearch
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
```

### 3.2 启用并启动服务

```bash
# 重载 systemd 配置
sudo systemctl daemon-reload

# 启用开机自启动
sudo systemctl enable meilisearch

# 启动服务
sudo systemctl start meilisearch

# 检查服务状态
sudo systemctl status meilisearch
```

## 四、常见问题排查

### 4.1 错误 203/EXEC - 无法执行可执行文件

**症状**：
```
Process: 21298 ExecStart=/usr/local/bin/meilisearch (code=exited, status=203/EXEC)
```

**原因**：
- 可执行文件不存在
- 缺少执行权限

**解决方案**：
```bash
# 检查文件是否存在
ls -l /usr/local/bin/meilisearch

# 重新安装并设置权限
cd ~/meilisearch
sudo cp meilisearch /usr/local/bin/
sudo chmod +x /usr/local/bin/meilisearch

# 重启服务
sudo systemctl restart meilisearch
```

### 4.2 错误 401 - 认证失败

**症状**：
```
Error: The Authorization header is missing. It must use the bearer authorization method.
```

**原因**：客户端连接时未提供 API Key

## 五、服务管理命令

```bash
# 查看服务状态
sudo systemctl status meilisearch

# 启动服务
sudo systemctl start meilisearch

# 停止服务
sudo systemctl stop meilisearch

# 重启服务
sudo systemctl restart meilisearch

# 查看实时日志
sudo journalctl -u meilisearch -f

# 查看最近 50 条日志
sudo journalctl -u meilisearch -n 50 --no-pager

# 禁用开机自启动
sudo systemctl disable meilisearch

# 重新启用开机自启动
sudo systemctl enable meilisearch
```

## 参考资源

- [Meilisearch 官方文档](https://www.meilisearch.com/docs)
- [生产环境部署指南](https://www.meilisearch.com/docs/guides/running_production)
- [Meilisearch Go SDK](https://github.com/meilisearch/meilisearch-go)
- [配置选项参考](https://www.meilisearch.com/docs/learn/self_hosted/configure_meilisearch_at_launch)

---