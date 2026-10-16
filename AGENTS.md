# 本站双语维护约定

遵守父目录 `E:/Ellis-Services/AGENTS.md`。唯一工作副本为本站 source，报告存同级 reports。

- 全站同时维护 `en-AU` 英文与 `zh-Hans` 简体中文。后续功能、内容、业务事实或结构修改必须同步两种语言。
- 英文源文件位于根目录；逐页中文文案位于 `i18n/zh-Hans/<同名>.json`；`zh/*.html` 是生成产物，禁止独立手改。
- 页面对应关系由 `i18n/routes.mjs` 定义。新增正式页必须同时登记两种语言及 sitemap。
- 中文修改也需复核英文对应含义。电话、邮箱、公司身份、日期、案例和材料不能在两种语言中矛盾。
- 阅读并核对两种语言后，才记录 `i18n/reviewed-pairs.json` 的审阅指纹。生成器不能代替语义审阅。
- 修改后运行 `npm run i18n:generate`、`npm run i18n:check`、必要功能测试与 `npm run verify:seo`；本地先验收，再按用户当次明确授权发布。
- 保留原业务电话 `0425 170 688`、`tel:+61425170688` 和邮箱 `handyman.lyric@outlook.com`，除非用户明确要求修改。
- 正式发布仍走 GitHub → Vercel；未经当次上线授权，不 push，不直接 CLI 部署。

具体维护操作参阅 `BILINGUAL-MAINTENANCE.md`。
