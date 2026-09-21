# ATW 收录聚焦上传说明（2026-09-21）

将本目录中的五个站点文件上传到 `adelaidetilingandwaterproofing.com.au` GitHub 仓库根目录，并覆盖同名文件：

- `services.html`
- `products.html`
- `news.html`
- `faq.html`
- `sitemap.xml`

不要上传本说明文件或 `scripts/` 目录。

上线后的预期状态：

- sitemap 只保留首页、三个核心服务页、FAQ 和 Contact，共 6 个 URL；
- `services.html`、`products.html` 和 `news.html` 仍可正常访问，但使用 `noindex,follow`；
- FAQ 新增到三页核心服务内容的直接链接。

上线后在 Google Search Console 重新提交：

`https://www.adelaidetilingandwaterproofing.com.au/sitemap.xml`

仅对首页、Waterproofing、Bathroom Waterproofing、Tiling 四个 URL 请求编入索引。
