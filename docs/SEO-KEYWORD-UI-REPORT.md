# Adelaide 本地预览：关键词与 UI 实施核对

日期：2026-10-08。仅本地候选，未提交、未推送、未部署。

## 来源与边界

使用用户提供的 Adelaide_Waterproofing_Tiling_AI_Keyword_Map.md（研究日期 2026-09-29）作为词组与意图参考，不将其候选服务、地点或拟定 AI 问法视为已核验的业务证据。没有取得搜索量、GSC 查询数据或 SERP Top 10 字数数据；没有编造竞品对标、流量预测或排名保证。使用用户已确认的屋面、泳池、厨房和全 Adelaide 服务范围。未恢复独立 Tiling 页面，亦未建立 23 个候选 Owner 页面。

## 页面关键词分配

| 页面 | 搜索意图 | 主标题 | 长尾 / 蒸馏主题 | 场景与科普 |
| --- | --- | --- | --- | --- |
| index.html | commercial | Waterproofing and Tiling Adelaide. | Wet-area leak assessment and coordinated surface repairs | Waterproofing vs water resistance: why the membrane matters；Damp patches beside a shower, lifting balcony tiles or a roof damaged by weather need a repair that addresses the source |
| services.html | commercial | Waterproofing and Tiling Services Adelaide | Single tile replacement, regrouting and shower resealing | Cracked grout or recurring tile damage: repair the cause；A chipped tile after an impact, crumbling grout lines or a split silicone joint can call for a localised repair rather than a full renovation |
| waterproofing-adelaide.html | commercial | Waterproofing Adelaide | Failed waterproofing repair for shower and balcony leaks | Balcony grout, drainage and membrane continuity；A ceiling stain beneath a balcony after rain, a damp wall beside a shower or water collecting at a door threshold each points to a different repair scope |
| bathroom-waterproofing-adelaide.html | commercial | Bathroom Waterproofing Adelaide | Damp walls beside a shower and recurring shower leaks | Shower leak source diagnosis: grout is not the membrane；Carpet wet after shower use, stains below an upstairs bathroom or moisture returning after regrouting need a source-led repair |
| bathroom-renovation-waterproofing-adelaide.html | commercial | Bathroom Renovation Waterproofing Adelaide | Bathroom strip-out and substrate repairs before new tiles | Document the membrane before the tiled finish covers it；An older bathroom with lifting tiles, a relocated shower or a changed floor waste needs preparation before the new finish |
| about.html | navigational | Adelaide Waterproofing and Tiling Specialists | One coordinated waterproofing and tiling service scope | A clear repair scope, not just a cosmetic surface change；Ellis Services Group provides bathroom, laundry, roof, kitchen, pool and balcony waterproofing alongside wall and floor tiling across Adelaide |
| contact.html | transactional | Waterproofing and Tiling Quotes Adelaide | Request an itemised wet-area repair or tile installation quote | Compare quote inclusions: preparation, materials and finish；Tell us your Adelaide suburb and whether you need shower leak repairs, bathroom waterproofing, roof repairs, kitchen waterproofing, pool waterproofing or wall and floor tiling |
| faq.html | informational | Waterproofing and Tiling Adelaide: Your Questions Answered | Regrouting, shower resealing or waterproofing renewal? | Waterproofing vs water resistance and return-to-use timing；Crumbling grout, a split silicone joint and damp patches outside a shower are different symptoms |
| service-areas.html | commercial | Waterproofing and Tiling Across Adelaide | Shower leak repairs and wall &amp; floor tiling in your suburb | Local conditions and the right waterproofing repair；From Adelaide CBD and coastal suburbs to the northern, southern and hills districts, we provide waterproofing and tiling services across all Adelaide areas |

隐私与条款页面标题含服务语境，但保留行政信息目的，不伪装成商业服务页。区域页仍为一个有实际区域信息的 hub，不生成大量薄内容 suburb 页面。

## 可重复的内容分析

运行：`node docs/keyword-analysis.mjs`。统计对象为 main 内容（包括可索引 FAQ，排除导航、页脚和 JSON-LD）。英文词数为近似值；短语匹配会把 & 转成 and。密度 = 完整短语出现次数 / 英文词数，不等同于单个词或同义词组占比。

| 页面 | 英文词数 | 主短语出现 / 密度 | Flesch 估算 | 年级估算 | 平均句长 | 关键词 / 结构 / 技术 / UX | 内部检查分 |
| --- | ---: | --- | ---: | ---: | ---: | --- | ---: |
| index.html | 448 | 1 / 0.22% | 44 | 10.7 | 14.5 | 20 / 25 / 25 / 20 | 90 |
| services.html | 1065 | 1 / 0.09% | 43 | 10.8 | 14.1 | 20 / 25 / 25 / 20 | 90 |
| waterproofing-adelaide.html | 1731 | 3 / 0.17% | 53 | 10.2 | 17.2 | 25 / 25 / 25 / 20 | 95 |
| bathroom-waterproofing-adelaide.html | 1749 | 2 / 0.11% | 57 | 9.6 | 17.5 | 25 / 25 / 25 / 25 | 100 |
| bathroom-renovation-waterproofing-adelaide.html | 2148 | 1 / 0.05% | 48 | 10.8 | 16.9 | 20 / 25 / 25 / 20 | 90 |
| about.html | 792 | 2 / 0.25% | 48 | 10.4 | 15.4 | 25 / 25 / 25 / 20 | 95 |
| contact.html | 363 | 1 / 0.28% | 45 | 10.8 | 15.2 | 20 / 25 / 25 / 20 | 90 |
| faq.html | 823 | 1 / 0.12% | 48 | 9.8 | 13.2 | 20 / 25 / 25 / 25 | 95 |
| service-areas.html | 669 | 1 / 0.15% | 37 | 11.8 | 15.1 | 20 / 25 / 25 / 20 | 90 |

评分仅是本地可重复的检查清单，不是 Google SEO 分数，也不是全面技术审计或内容质量认证。每维度满分25，五项各5分：

- 关键词：H1 服务主题、H1 地域、具体 H2、场景模块、完整主短语至少两次。最后一项只是分布提示，不为拿满分机械重复。
- 结构：单一 H1、至少两个 H2、至少四个正文段、平均正文段落不超过90词、结构化卡片/列表/FAQ。
- 技术：title、description、HTTPS canonical、可解析 JSON-LD、无 noindex。路由、锚点和 FAQ 一致性另由回归测试验证。
- UX：估算年级≤10、平均正文段≤60词、联系入口、科普模块、场景模块。该维度不代替真实设备体验检查。

Flesch 音节使用简单英文估算器，服务术语、地名、缩写可能失真。平均句长约13–18词。技能中的1–2%仅作检查参考，不是 Google 要求；未为了把完整地域短语提高到1–2%而堆词。候选词已按语义主题分配，未使用“LSI 覆盖”冒充搜索引擎指标。

## UI 与交互

- 两张现代住宅图片本地 WebP：首图优先加载；第二张延迟加载；固定图框防止切换时布局跳动。
- 6.5秒轮播，前后切换、暂停按钮；鼠标悬停、键盘焦点、隐藏标签页暂停；减少动态效果时默认暂停。自动切换不持续打断屏幕阅读器，手动切换才播报状态。
- 卡片18px圆角；图片框22px；按钮和小内链10px。保留可见原生内链和焦点样式。
- 图片来源：Max Vakhtbovych / Pexels 与 Gustavo Galeano Maz / Pexels，来源记录在 assets/photo-sources.json。注明为住宅示意，不能当作 Ellis 实际施工案例。授权参考 https://www.pexels.com/license/ 。

## 发布准备与尚需外部证据

本地预览已具备供用户确认的条件，地址 http://127.0.0.1:4173/ 。未调用 GitHub push 或 Vercel 部署；本地表单不发送真实邮件。

- 已检查47项回归测试：导航、卡片、核心标题、内链锚点、重定向、FAQ Schema一致性、表单字段保留、轮播暂停与减少动态效果。
- 桌面1440px及手机390px检查：首页图片与手动切换可见；所有活跃页面无横向溢出；服务/信息卡片计算样式18px圆角。
- P2 后续衡量：发布并有数据后，根据 GSC 查询与实际获客情况调整标题和段落，不基于未测搜索量拆新页面。
- P2 真实信任证据：取得有授权的公司实际项目照片后可替换示意图库；没有新造项目、评论、资质或保证。

下一步仅等待用户确认本地效果，然后另行核验远程提交与部署来源，再发布。
