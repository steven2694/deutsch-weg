# Deutsch Weg 手机桌面 App 安装包

这是 Deutsch Weg 2.0 的 PWA（渐进式 Web App）部署包。

## 文件
- `index.html`：学习程序
- `manifest.webmanifest`：桌面安装信息
- `sw.js`：离线缓存
- `icons/`：桌面图标

## 重要说明
PWA 必须通过 HTTPS 网站或 localhost 提供服务，不能直接从 `file://` 本地文件安装。
本包尚未托管到公网；需要先部署到一个 HTTPS 静态网站。可使用 GitHub Pages 免费托管。

## 免费部署到 GitHub Pages（一次性）
1. 登录 GitHub，创建一个新的 Public repository，例如 `deutsch-weg`。
2. 将本压缩包解压，把里面的所有文件和 `icons` 文件夹上传到仓库根目录。
3. 打开仓库 Settings → Pages。
4. 在 Build and deployment 中选择 Deploy from a branch。
5. Branch 选择 `main`，目录选择 `/ (root)`，保存。
6. 等待 GitHub Pages 发布，得到类似 `https://你的用户名.github.io/deutsch-weg/` 的 HTTPS 地址。

## iPhone 安装到桌面
1. 用 iPhone 的 Safari 打开发布后的 HTTPS 地址。
2. 点击底部“分享”图标。
3. 选择“添加到主屏幕”。
4. 名称保持 Deutsch Weg，点击“添加”。
5. 以后从桌面图标打开。

注意：请用 Safari，不要用微信/其他 App 内置浏览器执行安装。首次在线打开一次以缓存课程文件。学习数据目前保存在该浏览器的本地存储中；卸载/清除网站数据前请在程序内导出 JSON 备份。更换设备不会自动同步数据。

## Android 安装
用 Chrome 打开 HTTPS 地址，点右上角菜单，选择“安装应用”或“添加到主屏幕”。

## 当前离线能力
程序页面、内置课程、词汇和测验会缓存；系统语音合成需要设备语音服务，首次访问及后续课程更新仍建议联网。
