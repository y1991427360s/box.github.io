# Mianbao Worker

这个目录是给博客聊天入口准备的代理层，目的是让前端不直接暴露火山引擎密钥。

## 部署到 Cloudflare Workers

1. 安装 Wrangler

```powershell
npm install -g wrangler
```

2. 登录 Cloudflare

```powershell
wrangler login
```

3. 进入这个目录并写入密钥

```powershell
cd mianbao-worker
wrangler secret put VOLCENGINE_API_KEY
```

4. 发布 Worker

```powershell
wrangler deploy
```

## 部署后要做的事

把 `index.html` 里的 `__MIANBAO_PROXY_URL__` 换成你部署后拿到的 Worker 地址，比如：

```txt
https://sen-mianbao-chat.<your-subdomain>.workers.dev
```

如果你给自己的域名配置了路由，也可以直接写成自己的域名地址。
