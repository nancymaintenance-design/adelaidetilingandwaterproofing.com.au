# Ellis Adelaide SEO 本地预览交接 · 2026-10-10

本轮交付是本地代码、检查工具和可供用户审阅的预览。尚未 push、合并、部署、提交索引、操作外部账号或发送真实询盘。用户确认最终本地预览后，才可进入 GitHub → Vercel 发布流程；本地检查通过不代表已上线、已收录或排名提升。

## 已实现

- 保留原有设计和主导航 Home、Services、Areas、FAQ、About、Contact、Call。
- 新增五个独立服务页：`shower-leak-repair-adelaide.html`、`balcony-waterproofing-adelaide.html`、`roof-waterproofing-adelaide.html`、`shower-regrouting-resealing-adelaide.html`、`tile-repair-adelaide.html`；首页及服务中心提供可抓取的相关入口和询价路径。
- About 补充 Adelaide 办公室与独立本地团队同属 ELLIS SERVICES GROUP PTY LTD 的关系、ACN 645 821 745、ABN/GST 登记事实与官方 ABR 入口；Contact 的询盘区和办公室信息明确本地团队。首页和 Areas 提供自然的正文 About/Contact/Services 入口，Services 补充铺砖、防水及表面准备的选择说明。四张登记卡、既有企业 schema 和公开 NAP 保持一致。
- 完整铺砖目录保留在 `services.html`；通用铺砖入口指向 `#tiling-services`，具体服务使用对应片段。FAQ 内容集中在 `faq.html`，可见问答与 FAQPage JSON-LD 一致。
- Areas 的区域/郊区链接改为 `contact.html#enquiry-form?area=...&suburb=...`，选择只用于客户端表单状态；预填保留地区、郊区、隐藏字段与 hash 导航更新，旧的 `contact.html?area=...&suburb=...` 仍兼容。Contact 在原始 HTML 中始终声明干净 canonical，未给参数页新增 noindex 或 robots 屏蔽。静态检查器验证真实 form 锚点及允许的参数，拒绝错误锚点、重复/未知参数和其他页面的伪预填。
- 16 个可索引页面使用 `https://www.adelaidetilingandwaterproofing.com.au` 的 canonical；主动维护的 `sitemap.xml` 和 `robots.txt` 已存在，不需要从旧模板生成。
- 保留原有商业页面并统一服务关联、页面实体和企业实体；保留公开电话、邮箱与企业信息，未新增未经核实的案例、资质、价格、评价、营业时间或保证。
- 保留四条重定向：`/index.html` → `/`，`/products.html` → `/services.html`，`/news.html` → `/faq.html`，`/tiling-adelaide.html` → `/services.html#room-tiling`。
- 本地服务器默认端口 4188，仅监听 `127.0.0.1`，支持 `PORT`；所有本地响应使用 `no-store` 和配置中的安全响应头。GET/HEAD、404、路径限制及方法处理已有测试，HEAD 不返回正文。
- 本地 `/api/contact` 只返回明确的 503 预览提示，POST 也不会发信。localhost 和 127.0.0.1 的生产 Analytics 初始化与事件已关闭。
- 提供零依赖的 `npm run verify:seo`；两份 ES module 测试改为 `.mjs`，保持项目其余 CommonJS 模块兼容。

## 启动、停止与重启

Node.js 20+，在项目目录运行；无需安装新依赖或配置邮件密钥：

```powershell
Set-Location 'E:\Ellis\Adelaidetilingandwqater\work\preview-20261008'
npm test
npm run verify:seo
npm run preview
```

访问 `http://127.0.0.1:4188/`。关闭自己启动的前台进程用 Ctrl+C，再运行 `npm run preview` 即可重启。端口被占用时程序会退出并提示，不会终止其他服务。需要改端口时：

```powershell
$env:PORT = '4189'
npm run preview
# Ctrl+C 停止后清除覆盖值，下次恢复默认 4188：
Remove-Item Env:PORT -ErrorAction SilentlyContinue
```

本次交接时持续预览进程 PID 27988 正在运行，`http://127.0.0.1:4188/` 的实际 HEAD 检查为 HTTP 200；未停止或管理该进程。测试另外使用临时端口和独立子进程，结束后仅清理自己的进程。浏览器中原有外部地图和 Analytics 脚本 URL 仍可能发起资源请求；关闭本机统计不等于完全离线。

## 本地验证结果

2026-10-10，Node.js 本地执行：

| 命令 | 结果 |
| --- | --- |
| `node --test tests/preview-server.test.mjs` | 47 项通过，0 失败 |
| `node --test tests/local-identity-discovery.test.mjs` | RED 4 项按缺少内容/入口失败；GREEN 4 项通过 |
| `npm test` | 148 项通过，0 失败，无原有 Node module-type 警告 |
| `npm run verify:seo` | 16 个可索引页面、1,090 条引用检查通过；不请求生产站点 |

持续预览实际 GET 检查：Home、About、Contact、Areas、Services 均为 HTTP 200，原始 HTML 各有一个 H1 且 canonical 为对应干净生产 URL。主控另完成浏览器核验：About 桌面版展示同一法律主体、本地团队和四张登记卡；五个修改页面的 390px 视口没有横向溢出，已加载图片无破损。实际点击 Hyde Park 新片段链接与旧 Morphett Vale query 链接均正确预填，Contact canonical 保持干净。未发送询盘。

静态核验检查 sitemap 覆盖及格式、canonical、robots/meta/header 可索引性、单一 H1、独立标题和描述、本地链接与片段、HTML/CSS/manifest 资源、srcset、图片 alt 和正整数尺寸、JSON-LD 解析及实体引用，以及从首页可达的商业页面。故障测试使用独立临时样例，验证缺失资源/片段、孤立页面、重复元数据、无效 schema/sitemap/robots 等会报错并返回非零状态。

该工具针对仓库当前显式闭合的静态 HTML 和 sitemap 格式，遇到不支持或损坏的源内容会失败。它不模拟浏览器渲染、不核实图片实际像素与声明尺寸是否一致、不执行脚本生成的链接、不验证外部链接内容，也不替代搜索引擎或商业事实审核。

## 需要事实、资料或账号权限的后续事项

- **真实案例与图像授权**：需提供可公开的项目位置范围、实际工作内容、照片来源和授权。当前服务示意图不能当作已核实的 Ellis 项目证明。
- **公司登记与 Adelaide 网点已补充核验**：2026-10-10 已读取 [ABN Lookup](https://abr.business.gov.au/ABN/View?id=96645821745)，ELLIS SERVICES GROUP PTY LTD 的 ABN 96 645 821 745 为 Active，GST 已登记。登记主营业地区为 VIC 3030；用户已确认 63 Pirie St, Adelaide SA 5000 是真实办公地址，并有独立本地团队，均属于 Ellis 集团。地址/团队的依据为用户确认，不冒充 ABR 验证。施工执照、保险、案例与服务承诺是另外的证据，不从 ABN 推定。
- **Google Business Profile**：实体办公点与本地团队已由用户确认；GBP 后台类目、营业时间、标识及具体资格条件仍未读取，不声称已完成 GBP 优化。
- **Google Search Console 已可只读访问**：2026-10-10 通过现有 gcloud ADC 加既有配额项目请求头取得该 www HTTPS 属性的 siteOwner 数据，读取了搜索表现、sitemap 和 URL Inspection。最近 28 天 119 展示、3 点击；澳大利亚 113 展示、0 点击。历史快照显示旧 `tiling-adelaide.html` 已收录（最后抓取 2026-09-30），而 Services 未知；当天线上旧页实际已 308 到 `/services.html#room-tiling`，两者时间口径不同。Hyde Park 参数页被 Google 选为 canonical，覆盖了页面声明的干净 Contact canonical，Morphett Vale 参数页也被归并到 Hyde Park。本地现已增强 Services 及 About/Contact 发现路径并规范新区域链接，GSC 仍是发布前的历史基线，详见 [GSC 实际数据报告](GOOGLE-API-REPORT-adelaidetilingandwaterproofing.com.au.md)。没有提交 sitemap 或请求重新收录；发布仍需用户确认。
- **外部引用与评价**：需核对真实目录、NAP 一致性、可引用来源和客户授权；本轮未新增目录记录、外链或评价。
- **生产 Core Web Vitals 与转化**：需生产流量/CrUX/Search Console 或获准的现场测试、Analytics 数据；本地静态通过不证明生产 LCP/INP/CLS 或询盘提升。
- **生产询盘送达**：需确认 Vercel/Resend 配置及已验证发件域，再经授权发送真实测试并确认收件。本轮只验证本地阻止发送。

## 参数归并依据与发布后复核

片段仅承载表单选择，不承载 SEO 正文；正文在干净 Contact 页面直接提供。Google [URL 结构说明](https://developers.google.com/search/docs/crawling-indexing/url-structure)指出片段通常不用于索引。使用统一内部链接与干净 canonical 有助于加强一致信号，但 Google 仍自行选择 canonical；参见 [重复 URL 整合说明](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)。这些修改不保证参数 URL 立即消失、主页面收录或排名提升。

获批发布后先验证生产 308、16 条 sitemap、资源、正文链接、干净 Contact canonical 与新旧预填体验。再按授权读取 Services、About、Contact、装修页、旧铺砖页及 Hyde Park/Morphett Vale 参数 URL 的 Inspection，观察最后抓取和 Google canonical 是否更新；五个新服务页上线后再检查其发现/抓取。以澳大利亚展示/点击和重点页面状态作复核，发布后的 sitemap 提交、收录请求与真实询盘测试均须另获授权。

## 发布边界

先由用户审批最终本地预览，再确认要推送的分支与现有 GitHub/Vercel 关联。连接分支的 push 可能直接触发 Vercel 部署，因此未审批前不 push、不合并、不触发部署。发布后还需单独确认生产重定向、资源、canonical、sitemap 和表单送达；这些生产结果目前全部未执行、未证明。

内部 `docs`、`.superpowers`、`tests`、`tools`、`evidence` 和本地 `preview-server.cjs` 已在 `.vercelignore` 中排除。已有未跟踪图片和证据保留，不自动加入本轮提交。
