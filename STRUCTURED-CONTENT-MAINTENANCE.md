# 双语结构化数据与 Feed 维护

本轮仅在本地制作；正式发布仍需用户当次授权，经 GitHub → Vercel。

- 英文 HTML 为源，中文文案为 `i18n/zh-Hans`；只通过 `npm run i18n:generate` 更新中文 HTML。
- 页面级 `inLanguage` 分别为 `en-AU`、`zh-Hans`；共享 `/#website` 支持两种语言。不要另造中文公司实体。
- 目录用 `CollectionPage → #service-list → 详情页 #service`，详情页保留 `WebPage → #service → /#organization`。面包屑 ID 使用规范地址加 `#breadcrumb`。
- FAQ 是同一个带 `#webpage` ID 的 FAQPage，36 个问答（原 30 条及本轮 6 条雨后问答）与可见内容一致；不承诺 FAQ 富结果。
- 不为补字段编造作者、证书、价格、评分、施工结果或视频上传时间。现有 Article 机构作者记录保留，责任署名待用户确认后再调整。
- 公司核心业务语义及已复核双语术语记录于 `tools/business-profile.mjs`。`knowsAbout` 的主题必须有真实服务页支持；公司 `hasOfferCatalog` 使用独立 OfferCatalog，再引用原有详情服务 ID，不把页面的 ItemList 当成 OfferCatalog。维护目录时同步核对这两层，不批量塞候选关键词或未确认地区。

## 公开登记和 Feed

`i18n/publication-records.json` 区分 `published` 与 `draft`。本轮用户已明确授权雨后指南与 Feed 正式发布：每种语言登记四篇指南，提供 RSS 2.0 与 JSON Feed 1.1 摘要，不冒充全文。原三篇稳定 ID 和内容指纹保留；雨后指南使用新的稳定 ID、已审阅双语指纹和 2026-10-21 首次发布日期。发布记录中的授权说明不代替实际部署结果，线上核验另存本站 reports。生成器不会读取 `.local-admin` 草稿。

固定条目 ID 不随标题变化。标题和摘要直接取对应语言 Article；规范地址取现有路由。`contentHash` 绑定已核对的文章主内容和元数据：未确认的指南修改会使校验失败，不自动变更发布状态或哈希。不要为通过校验而直接批量重算哈希。

指南后续修改流程：先完成中英文同步与语义复核 → 核对公开／待发布版本及用户授权 → 保留稳定 ID，明确更新对应公开记录 → 生成 Feed → 本地检查 → 获准后发布。后台候选打包也执行此校验；若修改了指南，可继续保存本地草稿，但需 Codex 核对发布记录后再制作最终包。其他页面仍按原后台流程操作。

真实精确发布时间尚缺，因此 Feed 不填可选时间字段；现有正文和 Article 的日期保持不变，也不把构建日期写成文章日期。作者责任未确认，Feed 暂不新增作者字段。视频结构化信息和 Atom 留待真实资料齐备。

```powershell
npm run i18n:check
npm run feeds:generate
npm run feeds:check
npm test -- --test-concurrency=1
npm run verify:seo
```

四个输出为 `/feed.xml`、`/feed.json`、`/zh/feed.xml`、`/zh/feed.json`。头部发现链接按页面语言对应；本地预览、内容后台与待部署 Vercel 配置声明相应 MIME。私有登记表和草稿不公开。

协议依据：[RSS 2.0](https://www.rssboard.org/rss-specification)、[JSON Feed 1.1](https://www.jsonfeed.org/version/1.1/)。Feed 是内容分发入口，不保证收录、排名或 AI 引用。
