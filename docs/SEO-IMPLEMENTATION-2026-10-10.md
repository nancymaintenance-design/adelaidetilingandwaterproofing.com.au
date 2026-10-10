# SEO 第一阶段实施记录

日期：2026-10-10（Asia/Shanghai）

## 源码与线上对应关系

- 目录：`E:\Ellis\Adelaidetilingandwqater\work\preview-20261008`
- 仓库：`https://github.com/nancymaintenance-design/adelaidetilingandwaterproofing.com.au.git`
- 现有分支：`codex/seo-ui-preview`
- 修改前核对：线上首页、Services、Bathroom waterproofing、About、scripts.js、styles.css、sitemap.xml 与本地逐字符一致。
- 原有测试：65 项通过。已有未跟踪图片及 evidence 目录保持原样。

## 本阶段已实施

1. 9 个商业页面统一 ProfessionalService、WebSite、WebPage / AboutPage / ContactPage 实体。使用同一商家 ID、公开 ABN、地址和联系方式；补充页面已有的三个官方社交资料链接及现有服务形象图。
2. 三个独立服务页补齐 Service 的名称、ID、provider 关联和 WebPage.mainEntity，使页面、服务与商家可以相互解析。
3. 首页增加与现有 CSS 一致的桌面/移动 Hero 图片预加载；三个服务页首屏图取消懒加载并标记高优先级。未改变原有图片与视觉布局，尚未声称 CWV 已改善。
4. 浴室防水页增加漏水评估、基层与膜层准备、工期和交付三个内容区块；增加通往 resealing、regrouting、tile repairs、renovation、service areas 和中央 FAQ 的上下文链接。文字依据已存在的服务范围编写；未添加未核验的项目、品牌、资质、价格或保修承诺。
5. About 的三处 ABR 链接由九位参数修正为完整 ABN `96645821745`。直接请求官方链接已返回该 ABN 的 Current details 页面。
6. sitemap 为本次结构化数据/内容实际更新的 9 个商业页面添加 `2026-10-10` lastmod。Privacy 和 Terms 未改动，未添加虚假更新日期。以后仅随实质变更更新日期。
7. Vercel 配置增加 `/index.html` 到 `/` 的永久重定向，以及 `nosniff` 和 Referrer-Policy。配置需部署后才能在生产响应上生效。
8. 添加五项回归验证；更新旧测试中的 ABR 链接预期。

## 核对源码后对审计的修正

- About 的真实 meta description 长度正常；此前审计的正则被英文撇号截断，因此“45 字符描述”判断不成立。
- 当前服务锚点已存在于初始 HTML，现有测试能静态解析站内片段链接；无需再次注入。
- 项目已有“贴砖内容集中在 Services、FAQ 集中到 FAQ 页”的明确实现约束。本阶段保留该结构，未直接恢复已被永久重定向的贴砖页，也未在服务页嵌入重复 FAQ。
- 网页字数不是 Google 的最低排名门槛；本次补充的是服务决策信息，而非为了达到固定字数添加填充内容。

## 验证与状态

- `npm test`：70 项通过，0 失败。Node 在两个既有 `.js` ES module 测试文件上提示 MODULE_TYPELESS_PACKAGE_JSON；这是原有提示，未改变模块类型以免影响 CommonJS 预览服务。
- `git diff --check`：通过；Git 显示现有 Windows 换行配置提示，不属于内容错误。
- 已使用项目预览服务在端口 4188 检查 sitemap 中 11 个页面与它们引用的本地资源；4173 已被其他进程占用，未终止那个进程。
- 本阶段改动在本地工作树中，尚未提交、推送或部署。未使用生产表单发送测试邮件。

## 接续工作

1. 先审阅本地浴室页新增区块及生产发布差异，再部署并验证响应头、重定向、Hero 网络加载和页面实体。
2. 继续对 renovation、防水区域和 Services 做针对性的内容与上下文链接扩充。独立服务页应按真实搜索意图和既有合并策略评估，不批量生成近似页面。
3. 用可核验的负责人、资质、保险/保修资料及经同意的真实案例补足专业性；在事实来源齐备后发布。
4. 由具备账号权限的人核对 GBP 地址/服务区模式、目录一致性，并使用 GSC 查询实际收录、曝光与转化。ABR 主营业地和 Adelaide 服务/办公室的关系仍需业务方核实。
5. 域名 HTTP 裸域跳转链应在 Vercel 域名配置层核对；当前源码无法证明该层设置，未加入可能与平台 HTTPS 跳转冲突的规则。

参考：Google 的 [sitemap 指南](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) 说明 lastmod 可用于正文、结构化数据或链接的实质更新；[官方 ABR 记录](https://abr.business.gov.au/ABN/View?id=96645821745) 用于核对现有企业实体。
