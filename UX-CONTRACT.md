# 本地内容后台操作约定

依据：本轮用户要求与前两个后台一致、仅本地使用；本站 AGENTS.md 要求中英文同步，正式发布另行授权。

对象是本机中文编辑者，主要使用桌面浏览器；后台简体中文，预览支持 en-AU / zh-Hans，历史记录使用北京时间。

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Form | local-admin/ui/editor.js 编辑对话框 | 本文件与 AGENTS.md | 中文文字、图片替换 | tests/local-admin.test.mjs 与浏览器 |
| Scrollbar | local-admin/ui/admin.css | DESIGN.md | 全局基线、弹窗稳定边距 | 浏览器计算样式 |
| Toast | editor.js 的 message / status | 本文件 | 正常、错误、保存中 | 浏览器 |
| CRUD | local-admin/content.mjs 草稿与历史 | AGENTS.md、本轮用户要求 | 保存草稿、恢复版本、导出候选包 | tests/local-admin-http.test.mjs |
| Select/Listbox | local-admin/studio/client.ts 原生 select | 本轮指定 Perth Handymate 同款界面 | 页面、字段、预览语言、宽度、历史 | tools/check-local-studio.mjs |

沿用 Canberra Woodwork 后台的页面列表、搜索、每页 20 个字段、编辑弹窗和状态提示。无批量删除、付费、账号管理或线上发布功能。原站文件不是可任意操作的文件管理器。

2026-10-19 用户指定 Perth Handymate 界面：默认 /admin/ 改为其同款上方筛选、左侧原网页预览、右侧编辑面板。样式和主要操作代码直接复用；页面、字段和历史 select 接受系统弹出菜单。点击预览文字进入右侧字段，英文对照只读；图片继续提供文件选择。页面整批保存是原子事务，恢复只影响所选页，其他页草稿保留。原列表界面保留于 /admin/legacy/ 备查，仍共用同一草稿文件，没有复制或清空草稿。

新界面操作、提示和输入由 studio/client.ts 统一管理，样式由 studio/editor.css 与 field-design.css 拥有。预览剥离原网页脚本和 iframe，禁止导航、表单提交及跟踪请求；点选通信仅接受当前预览 frame 和本机 origin。原生 select、文件选择器与 dialog 保持键盘可用，未保存输入通过应用内 dialog 保护。

- 中文保存到 .local-admin/state.json；页面和静态文件不覆盖，英文待同步时禁止生成上传包。
- 图片导入 assets/uploads，原图保留。图片绑定两种语言，图片说明按语言分别核对。接受原生文件选择器。
- 英文由 Codex 按当前中文和修订号核对后同步；后台不调用翻译服务。
- 恢复追加历史而非删除历史；源码变化或并发版本冲突必须停止覆盖，保留输入后刷新比较。
- 保存后留在原列表；分页、页面选择、搜索和待同步过滤一致。页面写入 URL；临时搜索不进入 URL，避免桌面入口过长。
- 编辑通过原生 dialog，取消未保存修改需应用内二次确认，保存失败保留输入并聚焦错误字段。
- 所有列表、编辑、状态与历史元素使用文本节点，输入不作为 HTML 执行。POST 需要精确本机 Origin 和会话 token，静态服务不公开私有文件。
- 候选包只在同级 reports 生成；不修改唯一源码、不推送、不上线。Codex 后续合并包内容回唯一源码时必须保留后台草稿映射并复核双语。
