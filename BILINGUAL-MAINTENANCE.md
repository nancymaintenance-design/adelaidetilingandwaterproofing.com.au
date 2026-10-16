# 中英文同步维护

本站为 35 对正式页面。英文保留原网址，简体中文使用 `/zh/`；切换按钮位于 Contact／联系我们之后。

## 日常修改

1. 修改根目录英文 HTML，同时更新 `i18n/zh-Hans/<同名>.json` 的对应中文 `entries`。每项记录保存原句 `source`、中文 `target`；品牌、联系资料等保留原文时注明 `unchangedReason`。
2. 使用 `extractUnits(html, file)` 和 `sourceHash(units)`（`tools/i18n/html-localization.mjs`）核对来源。结构或英文改变时，调整对应 key／source，并将词条文件的 `sourceHash` 更新为当前来源指纹。不要删除报错条目以绕过漏译。
3. 逐页对照英文与中文，检查表述、事实、图片说明、搜索摘要和 schema。确认后记录审阅，例如：`node tools/review-i18n.mjs --files contact.html,about.html --confirm-reviewed`。
4. 执行 `npm run i18n:generate`，再运行 `npm run i18n:check` 与 `npm run verify:seo`。`npm test` 会先检查同步；未翻译、来源变化、中文未复核或手改生成页都会报错。
5. 本地查看两种语言及电脑／手机布局。用户确认当次成果并授权上线后，才通过 GitHub → Vercel 发布。

`zh/*.html` 共用英文结构、样式、脚本及图片，不独立编辑。`i18n/reviewed-pairs.json` 是语义复核记录，哈希只检查是否变化，不能证明翻译准确。

## 公共功能

- 动态表单提示、轮播按钮和地区提示在 `site-locale.js`；两种语言的消息 key 必须齐全。
- Contact 下拉显示名称可翻译，英文 `value` 与 API 字段名保持稳定。查询参数和旧锚点不能按显示文字翻译。
- 每页含自身 canonical 与中英文双向 hreflang，x-default 指向对应英文；中文内部链接保持中文。
- 新增页面需登记 `i18n/routes.mjs`、添加源页与中文词条，再生成；现有历史清单测试也应随真实业务范围更新。
- Clarity 两种语言共用同意状态，`/contact.html` 与 `/zh/contact.html` 都排除录制；不要更改正式主机限制来测试本地采集。

## 首次制作辅助资料

`i18n/authoring-source.json` 与 `i18n/zh-Hans/copy-*.json` 保留首次翻译批次来源，正常生成不依赖这些文件。`tools/i18n/seed-translations.mjs` 是首次制作工具，不用于日常更新，避免覆盖之后逐页编辑的词条。运行时不会自动认可审阅；只有明确 `--record-reviewed` 才写审阅记录。

Node.js 要求 `>=20`。先 `npm ci` 安装锁定的开发依赖。Playwright 浏览器测试复用本机已有环境；本地表单预览不发送真实咨询。
