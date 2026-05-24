# GitHub Pages 部署指南

## 第一步：注册 GitHub 账号

### 1. 访问 GitHub 官网
- 打开浏览器，访问：https://github.com
- 点击右上角的 **"Sign up"** 按钮

### 2. 填写注册信息
- **Email**：输入你的邮箱地址（建议使用 18686089854@163.com）
- **Password**：设置一个强密码（至少15个字符，或至少8个字符包含数字和小写字母）
- **Username**：设置你的用户名（这将是你博客网址的一部分）
  - 例如：如果你的用户名是 `byl`，你的博客地址将是 `byl.github.io`
  - 用户名只能包含字母、数字和连字符
  - 建议使用简短、易记的用户名

### 3. 完成验证
- 完成拼图验证
- 点击 **"Create account"**

### 4. 验证邮箱
- GitHub 会发送验证邮件到你的邮箱
- 登录邮箱，点击验证链接完成验证

### 5. 选择计划
- 选择 **"Free"** 免费计划
- 点击 **"Continue"**

### 6. 完成设置
- 根据提示完成初始设置（可以跳过）

---

## 第二步：创建 GitHub 仓库

### 1. 创建新仓库
- 登录 GitHub 后，点击右上角的 **"+"** 号
- 选择 **"New repository"**

### 2. 配置仓库
- **Repository name**：输入 `你的用户名.github.io`
  - 例如：如果你的用户名是 `byl`，仓库名就是 `byl.github.io`
  - ⚠️ 注意：仓库名必须严格按照这个格式，否则无法使用 GitHub Pages
- **Description**：可以填写博客描述（可选）
- **Public/Private**：选择 **Public**（公开仓库）
- **Initialize this repository with**：勾选 **Add a README file**
- 点击 **"Create repository"**

---

## 第三步：获取 GitHub Token

### 1. 访问设置页面
- 点击右上角头像，选择 **"Settings"**

### 2. 进入开发者设置
- 在左侧菜单最下方，点击 **"Developer settings"**

### 3. 创建 Personal Access Token
- 点击 **"Personal access tokens"**
- 选择 **"Tokens (classic)"**
- 点击 **"Generate new token"**
- 选择 **"Generate new token (classic)"**

### 4. 配置 Token
- **Note**：填写 `hexo-blog-deploy`
- **Expiration**：选择 **"No expiration"**（永不过期）
- **Select scopes**：勾选以下选项：
  - ✅ `repo`（完整的仓库访问权限）
  - ✅ `workflow`（工作流权限）
- 点击 **"Generate token"**

### 5. 保存 Token
- ⚠️ **重要**：立即复制生成的 Token（以 `ghp_` 开头）
- 这个 Token 只会显示一次，请妥善保存
- 如果忘记了，需要重新生成

---

## 第四步：配置本地 Git

### 1. 安装 Git（如果还没有安装）
- 访问：https://git-scm.com/download/win
- 下载并安装 Git

### 2. 配置 Git 用户信息
打开 PowerShell，运行以下命令：

```powershell
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的邮箱地址"
```

例如：
```powershell
git config --global user.name "byl"
git config --global user.email "18686089854@163.com"
```

---

## 第五步：配置 Hexo 部署

### 1. 安装部署插件
在博客根目录运行：

```powershell
npm install hexo-deployer-git --save
```

### 2. 修改配置文件
编辑 `_config.yml` 文件，在最后添加：

```yaml
deploy:
  type: git
  repo: https://github.com/你的用户名/你的用户名.github.io.git
  branch: main
```

例如：
```yaml
deploy:
  type: git
  repo: https://github.com/byl/byl.github.io.git
  branch: main
```

---

## 第六步：部署博客

### 1. 生成静态文件
```powershell
hexo clean
hexo generate
```

### 2. 部署到 GitHub
```powershell
hexo deploy
```

首次部署时，会提示输入：
- **Username**：输入你的 GitHub 用户名
- **Password**：输入你的 Personal Access Token（不是 GitHub 密码）

### 3. 等待部署完成
- 部署完成后，访问：`https://你的用户名.github.io`
- 例如：`https://byl.github.io`
- 首次访问可能需要等待几分钟

---

## 第七步：后续更新博客

### 1. 创建新文章
```powershell
hexo new "文章标题"
```

### 2. 编辑文章
编辑 `source/_posts/` 目录下的 Markdown 文件

### 3. 预览效果
```powershell
hexo server
```
访问 http://localhost:4000 预览

### 4. 部署更新
```powershell
hexo clean
hexo generate
hexo deploy
```

---

## 常见问题

### Q1: 部署失败怎么办？
- 检查 GitHub Token 是否正确
- 检查仓库名是否正确（必须是 `用户名.github.io`）
- 检查网络连接

### Q2: 访问博客显示 404？
- 等待几分钟，GitHub Pages 需要时间部署
- 检查仓库设置中的 Pages 是否启用
- 确认仓库是公开的

### Q3: 如何启用 GitHub Pages？
- 进入仓库页面
- 点击 **"Settings"**
- 左侧菜单找到 **"Pages"**
- **Source** 选择 **"Deploy from a branch"**
- **Branch** 选择 **"main"**，文件夹选择 **"/ (root)"**
- 点击 **"Save"**

### Q4: 如何绑定自定义域名？
- 在仓库根目录创建 `CNAME` 文件
- 文件内容为你的域名（如 `www.example.com`）
- 在域名服务商处配置 DNS 解析

---

## 📝 重要信息记录

请记录以下信息：

- GitHub 用户名：`_________________`
- GitHub 邮箱：`18686089854@163.com`
- 仓库名：`用户名.github.io`
- 博客地址：`https://用户名.github.io`
- Personal Access Token：`ghp_xxxxxxxxxxxx`（妥善保存）

---

## 🎉 完成！

完成以上步骤后，你就可以：

1. 通过 `https://用户名.github.io` 访问你的博客
2. 使用 `hexo new` 创建新文章
3. 使用 `hexo deploy` 更新博客
4. 在任何地方访问你的博客

祝你博客搭建成功！🎊
