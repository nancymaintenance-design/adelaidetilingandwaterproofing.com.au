# 防水与贴砖统一服务层级 — 设计规格

日期：2026-10-14。
状态：用户已确认「复用 7 个现有详情页，补齐 12 项独立服务详情」的范围；本书面规格待审阅，尚未开始实现。
实现起点：本地分支 `codex/seo-local-20261013`，提交 `3a8a338`。

## 1. 目标与范围

用户指出两大分类页内链混乱，要求两者遵循完全相同的操作路径：

**分类目录 → 对应服务内容卡片 → 该服务的独立详情页面 → 咨询。**

当前有 19 个目录选项，其中 7 项已有独立详情页，12 项仍使用本页片段或合集页片段。此次重构不再以段落滚动替代服务详情界面。

交付仅在 `E:/Ellis-Services/Adelaide Tiling & Waterproofing/source` 制作。完成后提供本地端口与简洁验收报告；未经当次明确发布批准，不推送 GitHub、不部署 Vercel、不修改线上服务器或 Google Cloud。

## 2. 两个分类页的共同合同

分类网址保持不变：

- 防水：`waterproofing-adelaide.html`。
- 贴砖：`services.html`。

两页共用同一布局与交互模式：面包屑、H1、简短类别说明、服务卡片网格、相关 FAQ／服务地区链接、咨询及统一页脚。

每张卡片只提供服务名称、帮助选择的简短说明和一个明确的「View service details →」主入口。标题与主入口指向同一个独立 HTML 页面，不带服务定位片段。卡片不得自跳到分类页、跳到统一合集段落，或以 Contact 代替服务详情。

分类页不再同时出现一份快捷目录与另一份重复卡片目录；不继续保留完整服务施工说明造成长页。防水 8 张卡片，贴砖 11 张卡片；贴砖可按安装与修复分组，但两组使用同一套卡片，不能改变入口规则。

具体技术说明搬到对应详情页，而不是直接丢弃。全局导航继续使用 Home、Waterproofing、Tiling、Areas、FAQ、About、Contact、Call。顶部和页尾的一般咨询入口可以保留；「先看详情」是服务卡片的主路径，不是禁止全站直接联系。

视觉继续使用现有颜色、字体、原生链接、圆角及焦点样式，不重新设计品牌。手机端自然换行、纵向阅读，不使用悬停专属入口、隐藏横滑分类或弹窗代替详情页。

## 3. 唯一服务归属表

下列网址是本轮卡片主链接、结构化目录与上下文详情链接的共同权威；不能由各任务自行另起同义网址。

| 分类 | 目录服务 | 唯一详情网址 | 处理 |
|---|---|---|---|
| 防水 | Roof waterproofing | `roof-waterproofing-adelaide.html` | 复用 |
| 防水 | Bathroom waterproofing | `bathroom-waterproofing-adelaide.html` | 复用 |
| 防水 | Kitchen waterproofing | `kitchen-waterproofing-adelaide.html` | 新增 |
| 防水 | Balcony waterproofing | `balcony-waterproofing-adelaide.html` | 复用 |
| 防水 | Laundry waterproofing | `laundry-waterproofing-adelaide.html` | 新增 |
| 防水 | Pool waterproofing | `pool-waterproofing-adelaide.html` | 新增 |
| 防水 | External wall, edge and corner waterproofing | `external-wall-waterproofing-adelaide.html` | 新增 |
| 防水 | Other damp areas | `other-wet-area-waterproofing-adelaide.html` | 新增 |
| 贴砖 | Bathroom tiling | `bathroom-tiling-adelaide.html` | 新增 |
| 贴砖 | Kitchen tiling | `kitchen-splashback-tiling-adelaide.html` | 复用 |
| 贴砖 | Balcony tiling | `balcony-tiling-adelaide.html` | 新增 |
| 贴砖 | Room tiling | `floor-tiling-adelaide.html` | 复用 |
| 贴砖 | Courtyard tiling | `courtyard-tiling-adelaide.html` | 新增 |
| 贴砖 | Wall tiling | `wall-tiling-adelaide.html` | 新增 |
| 贴砖 | Other tiling areas | `other-tiling-areas-adelaide.html` | 新增 |
| 贴砖 | Tile repairs and replacement | `tile-repair-adelaide.html` | 复用 |
| 贴砖 | Tile regrouting | `tile-regrouting-adelaide.html` | 新增 |
| 贴砖 | Shower resealing | `shower-regrouting-resealing-adelaide.html` | 复用 |
| 贴砖 | Pool surround tiling | `pool-surround-tiling-adelaide.html` | 新增 |

不重命名已有 7 个独立详情网址，不恢复退休的 `tiling-adelaide.html`。淋浴漏水维修及浴室翻新已有页面继续保留，作为相关服务，不冒充上述缺失详情页。

## 4. 详情页共同合同

新旧 19 个详情入口均遵循同一信息组织原则，不要求机械复制相同正文：

1. 面包屑：Home → Waterproofing 或 Tiling → 当前服务。
2. 单一 H1：对应服务的 Adelaide 核心词；简介直接说明服务对象及适用场景。
3. 本服务的工作范围和报价前需要核实的条件。
4. 对应场景、材料／基层／接缝等技术区别及常见误区，以服务说明承载科普词。
5. 评估、确认范围、准备施工、完成交接的流程；时间按选用材料及现场条件确认，不写统一保证小时数。
6. 少量确有关联的服务及中央 FAQ 具体分类或问题链接。
7. 「Back to waterproofing services」或「Back to tiling services」明确返回分类页顶端；电话与 Contact 咨询入口清楚可见。

不以固定字数凑内容。12 个新详情必须说明各自不同的现场条件、工作边界和选择问题，不能仅替换房间名称。副标题使用具体服务需求、长尾与蒸馏词，不重复堆叠 Adelaide。正文沿用原品牌英文语气与用户词条表的有效语义，不逐项机械塞词。

FAQ 答案继续由中央 `faq.html` 管理；详情页链接到适合的问题，不批量复制 FAQPage。可以在必要时补充真实、区别明确的中央问题，并同步可见答案及 schema。

## 5. 必须保留的业务事实边界

- Ellis 法人、ABN、Adelaide 地址、本地团队、电话及邮箱不变；ABN 不等于行业执照。
- 厨房防水与厨房防溅墙贴砖分开；贴砖更新不自动证明需要或已安装防水。
- 洗衣房的供水软管／排水连接漏水和基层膜失效分开说明；管道维修是独立 trade scope。
- Pool waterproofing 页面保留当前「先确认 Ellis 是否能承接所需泳池内部范围，再确定方案与报价」的限制。不能把泳池周边照片或用户一般服务确认外推为已验证的泳池内部膜案例。
- Pool surround tiling 只描述泳池外周、平台、收边及排水协调，不把它写成泳池内部贴砖或防水。
- 通用 Tile regrouting 不等于只做淋浴；淋浴专页继续服务 shower joint／silicone 场景，不能用它吞掉一般墙地面填缝需求。
- 两个 Other 类别定义为未被明确房间选项覆盖的现有湿区／墙地面需求评估，不另造一套全站总目录，不承诺未经确认的泳池内部、商业特殊工艺或结构修复能力。
- 不编造价格、保证、工期、保险、执照、检测记录、客户评价或技术负责人经历。

## 6. 图片与旧合集内容

使用现有资源，不额外要求每个页面都配独立照片，也不制造项目照片。

- 厨房防溅墙照片保留在现有厨房详情页。
- 阳台、庭院／alfresco、泳池周边三张用户照片，从原贴砖合集移到各自新增详情页；保留响应式变体、4:3 尺寸预留、完整画面及中性说明，不在多个详情页反复展示。
- 已有真实项目保持原服务关联：King William Street 旧砖更换、North Terrace 淋浴翻新；Merbau Decking 是木材施工，不用于证明瓷砖安装。
- 缺少专属图的页面可采用纯文字说明；不放坏图、空占位或暗示真实项目的通用图注。

原 `tiling-services-adelaide.html` 不再作为 7 项服务的共同详情入口。保留网址，收窄为施工准备、选材与安装协调的辅助说明页，使用与分类及各详情不同的标题和页面意图。原服务长段落迁移到对应详情，不保留整套重复全文。已有旧服务片段在此页保留兼容入口，指向唯一详情 owner。

此辅助页可以有上下文服务链接，但不出现在 19 张卡片的主路径上，也不是第三个一级分类。原有指南网址及隐私／条款内容不借此重构重写。

## 7. 内链、旧链接和结构化数据

### 新路径

全站指向具体服务详情的正文链接、首页快捷服务、中央 FAQ 相关服务链接及目录 schema，统一采用第 3 节 owner 表。指向整个类别时使用无片段分类网址。分类页自身的旧卡片片段可以继续定位对应卡片，供旧收藏访问；新的服务主链接不使用这些片段。

### 旧片段兼容

迁移前盘点已有分类、合集的全部 ID。每个旧 ID 保留有效定位目标，或保留一个有明确原生链接的兼容目标，不能静默删除。

- 旧 `services.html#...waterproofing...` 片段更新为相应独立防水详情。
- 防水分类页原服务详情片段，迁移后提供通向对应独立详情的兼容链接；通用流程片段可定位保留下来的简短公共说明或返回分类选择。
- 旧贴砖合集的各服务片段提供通向相应独立详情的兼容链接。
- JavaScript 增强只跟随已知、同源、明确的兼容目标；禁用 JavaScript 时，访问相同旧片段仍看到并能点击普通链接。
- 未知片段、错误编码、普通贴砖目录卡片锚点不被错误劫持；hashchange 和浏览器返回／前进纳入验收。

URL 片段不会发送到服务器，不能宣称用 301 直接识别片段。本轮不新增依赖 query 标记的迁移中转，不引入客户端路由框架，也不借机调整 Vercel 线上配置。

### SEO 数据

- 防水 ItemList 精确列出 8 个独立详情 URL；贴砖 ItemList 精确列出 11 个。可见卡片、顺序、服务名与 schema 一致。
- 每个服务详情有自指 canonical、唯一非空 title／description、相符的社交标题与摘要、可解析的 WebPage／Service／BreadcrumbList，provider 指向已有 Ellis 组织。
- 新详情通过分类页直接可达，不形成孤页；sitemap 增加 12 个新 URL。保留的辅助说明页仍是独立意图页面，因此正常目标为 34 个可索引 URL。
- sitemap 日期仅更新实际有实质内容变化的页面；新页面及 Article 日期采用实际完成日期，不修改原指南发表日期。
- 不捏造评分、Offer、Person 评审者或资质 schema。无需 GSC 提交、索引请求、PageSpeed／CrUX 云配置变更。

## 8. 实施边界及 Subagent-driven 分工原则

详细步骤在书面规格批准后另写实施计划。后续任务边界为：

- 防水详情组：5 个新增页面及所迁移内容；不同时重写全局导航。
- 贴砖详情组：7 个新增页面、对应图片迁移及辅助说明页；不与防水组争用共享文件。
- 分类／全站整合组：两个统一分类页、共享样式、全站 owner 路由、面包屑、兼容脚本、sitemap、测试。
- 每个实施任务完成后独立核对规格及代码质量，最终再做完整用户路径复核。

子代理不自行再分发代理；共享目录内不并行运行多个修改源码的代理。主代理负责规格、任务接口、复核和交付协调，不跳过审查自行修补代理发现的问题。

只使用迁移后唯一源码和当前 feature 分支。不新建历史副本，不覆盖未同步成果；本次不合并 main、不推送、不创建生产部署。

## 9. 验收标准

验收不仅检查 HTTP 200，还检查用户是否真正到达对应独立页面：

- 19 张卡片的标题及主 CTA 均指向 owner 表中的独立 URL，无服务片段、无 Contact 冒充详情、无合集替代详情。
- 在 390 手机／1440 桌面，从两个导航入口进入分类，再通过全部 19 张卡片进入详情，能返回正确分类及进入咨询。
- 分类页共用结构，无重复目录，无长篇详情混入；正文、图片和按钮无横向溢出、遮挡或标题跳级。
- 34 页全部检查单一 H1、真实存在图片、非空元信息、自指 canonical、结构化数据和面包屑一致性；非服务的辅助指南按自身主题命名。
- 浏览器分别覆盖鼠标／触摸可达、键盘焦点与 Enter、移动端布局、已知旧片段、有／无 JavaScript、错误片段及返回／前进。
- 用户照片完整、无深色遮罩、无虚构信息；一张供图只在对应详情展示，不重复铺满分类。
- 更新原先允许片段混合模式的测试，使其覆盖新的真实路径；保留原 ID 兼容、联系方式、FAQ HTML/schema 同步及本地禁止发送询盘的保护。
- 执行完整 `npm test`、`npm run verify:seo`、`git diff --check`，报告实际输出；没有配置的 build／类型检查不虚报通过。
- 生成简洁中文报告，列明新增与复用页、验证结果、真实资料缺口及本地预览地址。缺资料不编造；不是必须的信息不阻塞制作。
- 未获得新的发布批准前，所有提交只保留本地。

## 10. 本规格自检

- 已明确两个分类入口、19 项归属、12 个新增网址及旧合集职责，没有未决定的路由。
- 分类「简短卡片」与详情「完整说明」分工一致；一般咨询可达不等于主卡片跳过详情。
- 两个 Other 选项、泳池内部范围、通用填缝和淋浴专页的边界明确。
- 不删除旧入口，不声称服务器可识别片段；原生链接与增强路径都需验证。
- 本地专用、图片真实性及禁止发布约束贯穿任务与验收。

书面规格批准后，下一阶段仅编写可执行任务计划，沿用用户已经选择的 Subagent-driven 执行方式；计划审阅后才派发实施任务。
