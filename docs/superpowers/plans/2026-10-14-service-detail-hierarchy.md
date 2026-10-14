# Unified Service Detail Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 两个相同结构的分类目录，19 项服务各有独立详情入口，并落实用户词条表、自然本地表达及陈述式标题要求。

**Architecture:** 保留两大分类网址和 7 个已存在的服务 owner，新增 12 个静态详情页。共享现有品牌组件，不引入前端框架；旧片段通过原生兼容链接及有限同源增强继续可用。原贴砖合集成为独立意图的施工准备说明，退出服务卡片主路径。

**Tech Stack:** 静态 en-AU HTML、CSS、原生 JavaScript、Node >=20、node:test、项目 preview-server.cjs／verify-seo.mjs。浏览器验证使用已有 Playwright 与 Edge；不新增 npm 依赖。

**Spec:** `E:/Ellis-Services/Adelaide Tiling & Waterproofing/source/docs/superpowers/specs/2026-10-14-service-detail-hierarchy-design.md`，包括 2026-10-14 用户追加内容规则。执行方法已选 Subagent-driven；本计划仍待用户审阅，不能先实施。

## Global Constraints

- 交付仅在 `E:/Ellis-Services/Adelaide Tiling & Waterproofing/source` 制作。完成后提供本地端口与简洁验收报告；未经当次明确发布批准，不推送 GitHub、不部署 Vercel、不修改线上服务器或 Google Cloud。
- 分类网址保持不变：防水 `waterproofing-adelaide.html`；贴砖 `services.html`。
- 卡片标题与主入口指向同一个独立 HTML 页面，不带服务定位片段。卡片不得自跳到分类页、跳到统一合集段落，或以 Contact 代替服务详情。
- 防水 8 张卡片，贴砖 11 张卡片；最终 34 个可索引 URL；不为 near me、地区、同义词或单个问题再新增页面。
- 不重命名已有 7 个独立详情网址，不恢复退休的 `tiling-adelaide.html`。
- 使用现有资源，不额外要求每个页面都配独立照片，也不制造项目照片。
- Adelaide 核心词主要保留在商业页 H1。其余可见文案减少机械重复，采用具体服务、local／nearby 的自然表达或真实覆盖地区。
- 除 faq.html 外，H2–H6 以陈述句／名词短语强调核心服务与蒸馏词。意向问题与科普问题转化成正文中的明确说明。
- 保留准确的搜索 title、网址、canonical、组织名称、地址、项目记录及必要的真实地域标题，不通过删地名破坏本地身份和既有链接。
- 不编造价格、保证、工期、保险、执照、检测记录、客户评价或技术负责人经历。Pool 内部范围保持确认后承接的限制；Pool surround 照片不证明内部膜能力。ABN 不等于行业执照。
- 子代理不自行再分发代理；共享目录内不并行运行多个修改源码的代理。所有文本编辑用 apply_patch；保存报告在本站 reports；本地提交可以，合并 main／push／部署不可以。
- 原生联系表单、当地团队事实及中央 FAQ/schema 同步保护不变；本地 preview 不发送真实询盘。

## Review Focus

1. 老收藏、JS 禁用、编码错误片段、hashchange 与返回／前进：旧入口可用，不把普通目录卡片跳转误当重定向。归属 Task 1／2 的执行回归和 Task 3 浏览器矩阵。
2. 同名但不同服务：Pool 内部与 Pool surround、一般 Tile regrouting 与 Shower resealing 必须各到正确 owner。归属 Task 1／2 的差异内容检查与 Task 3 完整 owner 表测试。
3. 新页面引入后历史测试误判或保护被删：已发布 H1／图片／ID 保护保留，阶段索引数明确为 27 → 34；不以动态探测“当前有几页”代替期望。归属各任务回归适配和 Task 3 mutation／fixture 检查。
4. 本地词误用：near me 不全局替换、候选地区不等于热门排行、真实地址及地名案例不删。归属 Task 3 内容清单及标题测试；Task 1／2 写作时已受约束。
5. 手机及照片迁移：首屏分类容易发现，无双份目录、懒加载图滚动后解码正常，四张供图各显示一次且不裁切。归属 Task 2 图片检查与 Task 3 浏览器矩阵。

## Evidence and File Map

执行前读取根 AGENTS、当前 DESIGN.md、规格及本计划；再次确认 origin、分支、最新 main 和本地改动。当前基线：`35693e9`，main 最近已核对 `eeb96031b704a2898d1ace0c6764239afb06b17b`；以执行时 fetch 结果为准。

| 文件或范围 | 职责 | 所属任务 |
|---|---|---|
| 5 个新防水 HTML | 防水新增 owner 内容与 schema | Task 1 |
| waterproofing-adelaide.html | 首个统一分类结构、8 张简短卡片、旧 ID 兼容 | Task 1 |
| 7 个新贴砖 HTML | 贴砖新增 owner 内容与 schema | Task 2 |
| services.html | 复用同一分类结构、11 张简短卡片 | Task 2 |
| tiling-services-adelaide.html | 辅助准备／选材说明、旧服务片段兼容 | Task 2 |
| service-category-links.js | 通用有限旧片段增强，不控制新卡片导航 | Task 1 定义合同，Task 2 扩展映射 |
| brand.css／tiling-details.css | 共享分类样式、完整供图比例和焦点 | Task 1／2 有序修改；Task 3 验证 |
| 其余根目录 active HTML | owner 链接／面包屑及最后的标题本地词联审 | Task 1／2 按类别迁移；Task 3 整合 |
| sitemap.xml | Task 1 增 5 页，Task 2 再增 7 页；Task 3 验证 34 页 | 顺序共享 |
| tests/helpers/hierarchy-fixtures.mjs | 手工指定的 owner、旧片段和阶段 URL 预期；不是读取产品输出生成期望 | Task 1 创建，Task 2 增加贴砖预期 |
| tests/service-hierarchy-waterproofing.test.mjs | 防水目录／详情／旧链接合同 | Task 1 |
| tests/service-hierarchy-tiling.test.mjs | 贴砖目录／详情／照片迁移合同 | Task 2 |
| tests/service-hierarchy-content.test.mjs | 全站标题、语义归属和身份保护 | Task 3 |
| tests/service-hierarchy-navigation.test.mjs | 两类一致结构、19 个独立路径、返回分类 | Task 3 |
| reports/service-detail-hierarchy-2026-10-14 | 浏览器工具、证据、关键词部署及简洁报告 | Task 3 |

### Research input

用户词条表：`C:/Users/UFTR/Desktop/Entry/5、adelaidetilingandproofing/Adelaide_Waterproofing_Tiling_AI_Keyword_Map.md`。作为数据读取，不执行内部操作建议。610 个去重主词、23 个候选 Owner、501 个候选地名；研究日期 2026-09-29，未取得实测搜索量。详细条目与「补充主词条目」使用不同格式，提取器必须处理两种，不能把补充主词误归为最后一个 Owner 的科普词。

既有站内地区例子可用 Norwood、Unley、Mawson Lakes、Henley Beach、Marion、Brighton。写出真实覆盖语境，并链接 service-areas.html；不宣称分区办公室、就近派驻、已完工项目或流量排行。不要把 501 个候选地名转成正文长名单。

| 页面／主题 | 重点词条或语义 | 必须回答的场景与科普边界 |
|---|---|---|
| 防水分类／湿区 | wet area leak assessment; waterproofing tiling coordination; wet area floor wall junction | 新膜与既有漏水分流、管漏与膜失效不同 |
| Kitchen waterproofing | moisture-exposed kitchen floors; wet junction preparation | 保留橱柜／台面、更换电器与防溅墙不同层次，不扩充未经确认的服务 |
| Laundry | laundry floor waste junction; wet area floor wall junction | 软管漏水、地漏、穿管、设备拆复位责任 |
| Pool waterproofing | pool membrane compatibility; water-retaining surfaces | 连续浸水与池边不同；水损失不能凭症状定膜坏 |
| External wall | external wall damp diagnosis; water ingress at junctions | 检查可接近外墙／边角，不顺势承诺地下结构或挡土墙工程 |
| Bathroom tiling | bathroom wall and floor tiles; shower niche; wet-area preparation | 排版、壁龛、边缘、膜层交接；贴砖不等于膜更新 |
| Balcony tiling | balcony strip out and retile; exterior tile membrane interface | 门槛、出口、移砖损伤膜风险，与防水 owner 协作 |
| Courtyard | exterior tile suitability; alfresco tile drainage | 雨水汇流、室内外衔接、活动缝 |
| Wall tiling | feature tile alignment; wall tile substrate preparation | 重量、砖尺寸、旧涂层与基层适用性 |
| Regrouting | crumbling grout lines; missing grout between tiles; epoxy versus cement grout | 清洗／换填缝／硅胶不同，环氧不替代膜 |
| Pool surround | pool coping tile movement; pool surround slip resistance | 收边、排水、相邻高程；不承接池内意图 |
| 两个 Other 详情 | moisture beneath tiles; small tiling job; substrate preparation | 仅未列空间的评估，不变成重叠总目录或虚构专项能力 |

## Task 1: 防水独立详情与首个统一分类

**Files — ownership:**

- Create: `kitchen-waterproofing-adelaide.html`, `laundry-waterproofing-adelaide.html`, `pool-waterproofing-adelaide.html`, `external-wall-waterproofing-adelaide.html`, `other-wet-area-waterproofing-adelaide.html`。
- Modify: `waterproofing-adelaide.html`, `service-category-links.js`, `brand.css`, `sitemap.xml`；现有 active HTML 中只迁移对应防水服务的详情链接与必要面包屑，不改贴砖语义。
- Create: `tests/helpers/hierarchy-fixtures.mjs`, `tests/service-hierarchy-waterproofing.test.mjs`。
- Modify covering regressions: `tests/service-category-split.test.mjs`, `tests/heading-intent-policy.test.mjs`, `tests/service-hub-integration.test.mjs`, `tests/seo-growth-foundation.test.mjs`, `tests/seo-audit-content-20261013.test.mjs`, `tests/about.test.js`, `tests/content-intent-services.test.mjs`, `tests/service-detail-layout.test.mjs`, `tests/service-destinations.test.mjs`，以及完整测试实际指出的同合同旧断言；不得跳过或删除不相关保护。

**Interfaces:**

- Consumes：规格第 3 节的 8 个防水 owner、现有原生模板及 `createPreviewServer()`。
- Produces：5 个独立 200 HTML；`main.service-category-page` 中唯一一个 `.service-catalogue[data-service-catalogue="waterproofing"]`，包含 8 个 `article.service-item`。
- 卡片 ID 依规格服务名保留现有可用 ID；每卡 `h3 a` 与 `a.service-detail-link` 都直达同一个无片段 owner。卡片只保留一段简短服务介绍。
- 兼容 DOM 合同：`[data-legacy-service]` 元素具有已有 ID，包含一个同源 `.html` 原生链接。只在当前 hash 对应此标记时增强，普通 `.service-item` ID 不能触发重定向。
- `service-category-links.js` 在两类需要兼容的页面上以 defer 载入；初次载入／hashchange 支持，非法编码、空 hash、未知 ID 和跨域链接不跟随。兼容块只在目标片段被访问时显示，禁 JS 可点击。
- 测试 fixture 明确列出阶段一 27 个 canonical 文件，不从 readdir 推断正确数量。记录起点 22 页的旧 ID 清单作为独立回归 fixture，保留旧目的地；新页不向历史 Git 请求不存在的基线。

- [ ] **Step 1 — RED：写可执行路径与内容测试。** 使用真实 preview HTTP 响应，解析目录卡片、schema 和详情；这些断言必须失败于当前片段混合模式。

```js
test('waterproofing cards open eight distinct service screens', async () => {
  const expected = [
    'roof-waterproofing-adelaide.html', 'bathroom-waterproofing-adelaide.html',
    'kitchen-waterproofing-adelaide.html', 'balcony-waterproofing-adelaide.html',
    'laundry-waterproofing-adelaide.html', 'pool-waterproofing-adelaide.html',
    'external-wall-waterproofing-adelaide.html', 'other-wet-area-waterproofing-adelaide.html'
  ];
  assert.deepEqual(cardPrimaryHrefs, expected);
  assert.deepEqual(cardHeadingHrefs, expected);
  assert.equal(catalogues.length, 1);
  assert.equal(cards.length, 8);
  for (const href of expected) {
    assert.equal(new URL(href, localOrigin).hash, '');
    assert.equal(detailResponses[href].status, 200);
    assert.ok(detailResponses[href].html.includes('href="waterproofing-adelaide.html"'));
    assert.ok(detailResponses[href].html.includes('href="contact.html"'));
  }
});
```

上述变量由该测试通过真实响应提取，不能调用产品映射来计算 expected。补充不同页面唯一标题／描述、Service provider、面包屑对应、Pool 限制及 Other 非总目录检查。兼容脚本从实际 HTML script src HTTP 读取后执行，覆盖已知映射、hashchange、错误编码、普通卡片不跳、跨域拒绝；不只 grep 脚本文字。

- [ ] **Step 2 — 验证 RED。** `node --test tests/service-hierarchy-waterproofing.test.mjs`；预期明确因缺独立入口／缺新页失败，不是测试语法或环境错误。
- [ ] **Step 3 — GREEN：实现 5 页及目录。** 将原防水服务段落搬到相应 owner，补足区别性场景与 scope；3 个已有 owner 只调整必要返回入口／布局合同，不改网址。分类统一结构：相同 page-hero、简短 lead、一个 card catalogue；旧长段落退出分类页。复用 brand token，不新造深色图片遮罩。
- [ ] **Step 4 — GREEN：完成兼容和 SEO 接线。** 根据原 ID fixture 分配兼容目标；8 个 ItemList 与可见卡片完全一致；新页与已更新分类加入 sitemap、实际日期。新页面都从 Home 可达，不留临时 noindex。全站防水详情内链更新 owner，通用分类链接保持分类网址。维护全局导航及 provider 联系信息。
- [ ] **Step 5 — 完整验证及旧断言适配。** 先跑新测试，再 `npm test`、`npm run verify:seo`、`git diff --check`；预期 27 页、无失败。更新明确过时的“22 页／防水长页在原处”断言，保留每页单 H1、真实图片、旧 ID、Contact、防水与管道分流检查。
- [ ] **Step 6 — 自检并本地提交。** 使用 seo-content、frontend-design 组合和 TDD；不得以无专属照片编造案例。提交仅 Task 1 文件，写 task-1-report，报告实际 RED／GREEN 命令和输出，返回 DONE／DONE_WITH_CONCERNS。随后独立 task reviewer 核对规格与质量；通过才进入 Task 2。

## Task 2: 贴砖独立详情、统一目录和真实图片迁移

**Files — ownership:**

- Create: `bathroom-tiling-adelaide.html`, `balcony-tiling-adelaide.html`, `courtyard-tiling-adelaide.html`, `wall-tiling-adelaide.html`, `other-tiling-areas-adelaide.html`, `tile-regrouting-adelaide.html`, `pool-surround-tiling-adelaide.html`。
- Modify: `services.html`, `tiling-services-adelaide.html`, `tiling-details.css`, `service-category-links.js`（只扩展必要 DOM 支持，不改 Task 1 规则）, `sitemap.xml`；active HTML 中迁移贴砖详情链接。共享 brand.css 仅复用／补完同一分类组件，不另做一套布局。
- Create: `tests/service-hierarchy-tiling.test.mjs`。
- Modify: `tests/helpers/hierarchy-fixtures.mjs` 预期从 27 扩到精确 34；旧 `tiling-detail-journey`、供图、SEO 图片、catalogue、date／H1 及 owner 回归断言按新路径升级。

**Interfaces:**

- Consumes：Task 1 的 `main.service-category-page`／`.service-catalogue`／`article.service-item`／`.service-detail-link` 及 `[data-legacy-service]` 合同，不能换组件名或创建第二个目录。
- Produces：贴砖 `.service-catalogue[data-service-catalogue="tiling"]` 共 11 卡，顺序沿规格表；所有主 href 无片段。
- 新页 breadcrumbs Home → Tiling → service，返回分类链接是 `services.html`。
- 原 `tiling-services-adelaide.html` 辅助说明页的 H1 使用 `Tile Preparation and Installation Planning`；自指 canonical，不再定位 7 项服务的完整长文。只保留独特的基层、供料、排版、工序协调说明及旧 ID 兼容，不与 services.html 形成另一个完整目录。
- 三张供图的 src/srcset/尺寸/中性说明整体搬到 balcony／courtyard／pool-surround 对应详情，每张只显示一次；厨房图原页不动，assets 二进制及原文件不改。

- [ ] **Step 1 — RED：目录与详情路由测试。** 测试通过真实 HTML 取得标题和 primary links，独立 expected 如下。

```js
const expectedTiling = [
 'bathroom-tiling-adelaide.html', 'kitchen-splashback-tiling-adelaide.html',
 'balcony-tiling-adelaide.html', 'floor-tiling-adelaide.html',
 'courtyard-tiling-adelaide.html', 'wall-tiling-adelaide.html',
 'other-tiling-areas-adelaide.html', 'tile-repair-adelaide.html',
 'tile-regrouting-adelaide.html', 'shower-regrouting-resealing-adelaide.html',
 'pool-surround-tiling-adelaide.html'
];
assert.deepEqual(cardPrimaryHrefs, expectedTiling);
assert.deepEqual(cardHeadingHrefs, expectedTiling);
assert.equal(cards.length, 11);
assert.equal(catalogues.length, 1);
assert.ok(cardPrimaryHrefs.every(href => !href.includes('#')));
assert.ok(!cardPrimaryHrefs.includes('tiling-services-adelaide.html'));
```

补充通用 regrouting 不是 shower-only、Pool surround 不承接池内、辅助页不是目录的测试。供图断言从实际页面收集 img：四个 supplied 源各计 1，目标 page 固定，width=1448／height=1086、响应式变体存在；浏览器阶段验证 object-fit／画面。

- [ ] **Step 2 — 验证 RED。** `node --test tests/service-hierarchy-tiling.test.mjs`；当前预期因合集片段链接及缺新页失败。
- [ ] **Step 3 — GREEN：实现 7 页并迁移内容。** 将原 7 个段落及必要材料／scope 内容放到对应 owner，按词条部署表写区别性陈述标题。保留现有厨房、floor、repair、shower resealing 4 个 owner，补足清晰返回入口。Other 只承接未列墙地面场景，不另造专用石材等未经证实业务。
- [ ] **Step 4 — GREEN：替换目录并保留旧路径。** services.html 使用 Task 1 同组件；撤销快捷目录与全文重复，11 个 ItemList 与卡片一致。原合集改为辅助说明；原服务 fragment 用兼容块指向新 owner，准备／工序 fragment 保持同页有效。不得把一般目录卡片 ID 也标成 data-legacy-service。
- [ ] **Step 5 — 图片和全站接线。** 搬移 3 张真实供图，厨房图留原页，不复制展示。迁移具体贴砖正文 href；泛指全部贴砖的链接直达 services.html。sitemap 加 7 页，精确 34 页；适配旧测试，保持图文件和安全契约。
- [ ] **Step 6 — 验证、自检、本地提交与独立评审。** 跑新测试、完整 `npm test`、`npm run verify:seo`、diff check；预期 34 页且没有失败。用 seo-content 校验服务区别，用 seo-images 校验素材搬移；不读取或生成新客户证据。写 task-2-report，Task 2 独立规格／质量双结论通过后进入 Task 3。

## Task 3: 全站关键词与一致性联审、真实浏览器验收

**Files — ownership:**

- Modify: `DESIGN.md` 记录最终目录／详情合同；所有需改陈述式标题、机械本地词及相关链接的 active HTML；仅必要内容日期与相符 schema 更新。
- Create: `tests/service-hierarchy-content.test.mjs`, `tests/service-hierarchy-navigation.test.mjs`。
- Create in reports: `verify-hierarchy.cjs`, `关键词部署表.md`, `验收报告.md` 与执行产生的 JSON／截图；报告只能写本站 reports。
- Modify: 所有被实际新合同影响的测试和 sitemap 日期；不删除旧联系表单、媒体、provider、ID 安全检查。

**Interfaces:**

- Consumes：Task 1／2 两个相同目录及最终 19-owner 表、34 个 sitemap URL、兼容 DOM 合同。
- Produces：全站统一「分类→独立详情→咨询／返回分类」；非 FAQ 服务标题为陈述式；34×2=68 次浏览器页面检查及 19×2=38 次主服务键盘路径证据。
- 报告逐页记录核心词／蒸馏词／场景／科普／本地表达及依据，不标实测搜索量或声称排名增长。

### 明确的标题改写

保留原 ID、路径及相关正文边界，改标题而非删除解释。FAQ 的自然问答不批量改。当前检查发现的导向词标题即使语法上是名词从句，也按用户偏好改得更直接：

| 页面 | 当前标题 | 目标陈述式标题 |
|---|---|---|
| shower-leak-repair-adelaide.html | What a shower leak repair can include | Shower leak assessment and repair scope |
| roof-waterproofing-adelaide.html | What changes the quote and schedule | Roof waterproofing scope, access and scheduling |
| tile-repair-adelaide.html | What affects the repair quote and access | Tile repair preparation, access and quote factors |
| about.html | How Ellis delivers your project | Assessment, installation and project handover |
| shower-repair-options-guide.html | When a surface repair may suit | Suitable conditions for surface joint repairs |
| shower-repair-options-guide.html | When to stop using a leaking shower | Signs a leaking shower needs to be taken out of use |
| waterproofing-drying-curing-guide.html | How site conditions and materials affect drying and curing | Site conditions and material-specific curing |
| tiling-services-adelaide.html | How we plan your tiling work | Tiling preparation and installation sequence（若 Task 2 已移除则不重复增加） |

- [ ] **Step 1 — RED：写全站合同测试。** 所有 19 条 literal owner 路径均有无 fragment 卡片路由、200、自指 canonical、provider、正确类别面包屑和返回链接。两个目录具有相同组件，不出现 category-directory 与 catalogue 两套重复导航。对照已有 ID fixture 确认 subset 保留。

```js
for (const file of allActivePagesExceptFaq) {
  for (const heading of visibleH2toH6(file)) {
    assert.ok(!/[?？]/.test(heading), file + ': statement heading required');
    assert.ok(!/^(What|Why|How|When|Which|Can|Do|Does|Is|Are|Should)\b/i.test(heading), file + ': use a direct service statement');
  }
}
```

允许必要真实地理分组 `Adelaide CBD & North Adelaide`、`Adelaide Hills & Foothills`；其余新服务 H2–H6 不重复 Adelaide。保留地址、品牌、案例地点和 title/canonical 的独立断言。不要对所有正文设任意 Adelaide 总次数，也不要设 near me 密度：人工联审自然性，不强迫同义词堆积。

- [ ] **Step 2 — 验证 RED。** `node --test tests/service-hierarchy-content.test.mjs tests/service-hierarchy-navigation.test.mjs`；确保标题测试当前确因上述词式失败，而不是实现未定义或 fixtures 错误。
- [ ] **Step 3 — GREEN：逐页内容联审。** 根据词条表、实际 scope 和用户最新规则改写可见副标题／eyebrow／CTA／正文机械重复；商业 H1 保留核心地名词，指南保留主题。near me 意图优先用 local／nearby、真实办公地址、覆盖区及进场语境承接；如果确实自然才保留原短语，不能用 keyword table 的拟定问句当用户引用。
- [ ] **Step 4 — 日期与语义复核。** 有实质修改的指南保持原 datePublished、更新真实 dateModified 及可见更新时间。保留原 schema/@id，主词归属不跨页争抢；记录所有改动和不改的依据。用 seo-content 复核意图、品牌语气与真实性，必要 schema 校验用现有工具，不进行云端提交。
- [ ] **Step 5 — 完整本地验证。** `npm test`、`npm run verify:seo`、`git diff --check`；准确记录实际测试数和引用数，预期 34 页、0 失败。没有 build／类型检查／formatter 命令就如实报告未配置。若使用 Premium 审计，保留原始发现，不能把与本轮无关且合同另有规定的表单警告藏掉或称全绿。
- [ ] **Step 6 — 浏览器矩阵。** 用本机 preview-server.cjs 在空闲 loopback 端口启动，不用 `npm run dev`／Vercel dev。若 4191 是同一源码旧进程且可用则复用；端口被其他项目占用则选新端口，不杀进程。阻断全部非本地网络，请求真实本地 HTML／CSS／JS／图片。

  - 34 页×390／1440：200、单 H1、无标题跳级、非空元信息、schema 可解析、面包屑一致、无页面横向溢出。懒加载图滚动进入视口后 decode 再判断，不把尚未请求的图当坏图。
  - 两导航入口→19 卡片标题／主 CTA→正确独立服务 URL，鼠标与键盘 Enter 均可用；详情的返回分类与 Contact 路由正确，焦点可见且不被 sticky header 遮挡。主要键盘路径各宽度 19 次，共 38 次。
  - 两目录截图一致性与服务发现性；供图 4:3 完整画面、无 mask、移动端无重叠。About 原图片／文字分离与对比不回退。
  - 对每个旧服务片段验证 JS 初次、hashchange、JS 禁用的原生 fallback；空／未知／错误编码不跳，普通目录卡片不被劫持；检查浏览器 Back／Forward 不形成循环。
  - 本地 Contact 只读检查和已有 preview 单测证明禁止真实发送，不点击生产 API、Maps 或邮件发送动作。

- [ ] **Step 7 — 报告与本地提交。** 保存 `关键词部署表.md`、`验收报告.md`、JSON 与截图，列新增 12 页、复用 7 页、资料缺口（无必须缺口也写明）、预览 URL、命令实际结果和没有部署。执行代理只返回状态／提交／一行测试总结／concerns。
- [ ] **Step 8 — 独立评审与最终交付。** Task 3 规格／质量评审通过后，按 SDD 做一次全变更 final review；发现问题交回实施代理修复并 scoped re-review，不在主代理会话直接改产品。最终只交本地预览，不做 main merge、push、PR 发布或 Vercel 部署。

## Skill Routing and Review Boundaries

控制流程使用 writing-plans → subagent-driven-development；执行前使用 using-git-worktrees 技能核验当前 feature 工作区，用户唯一 source 约定优先，不创建新站副本。内容组用 seo-content，界面组使用 frontend-design 与 frontend-design-premium 的品牌网站分支，图片搬移用 seo-images，代码按 TDD，完成声明前用 verification-before-completion；每任务独立 reviewer 与最终 requesting-code-review。主代理及各实施代理在使用所选技能前自行完整阅读，不用另一代理摘要代替。

依赖表：Task 1 定义分类及兼容 DOM；Task 2 复用；Task 3 只做联审与验收，不再改变 owner 表或页面总数。每个任务独立提交、独立报告、独立规格与质量结论；不得同时启动两个源码实施者。Review package 必须覆盖任务的完整 BASE..HEAD，不用 HEAD~1 代替多提交任务。

## Plan Self-Review

1. 规格 1–3／7：Task 1、2 完成目录、19-owner、12 新页、旧片段与 34 页索引合同。
2. 规格 4–6 与用户追加文案：Task 1／2 做内容和照片分工，Task 3 做全站标题、自然本地词与证据联审。
3. 规格 8–9：任务文件责任明确，按顺序使用共享文件；Task 3 覆盖全部用户路径、回退与验证报告。
4. 五项 Review Focus 均有归属测试或浏览器步骤；无未决定的产品接口、无隐含新增服务／地区／外部写操作。
5. 计划预期数字 27→34、卡片 8＋11、原网址 7＋新增 12 相互一致；旧合集保留为一个独立辅助意图页，未再增加类别。
6. keyword table 主词数、地名候选、拟定 AI 问法仅是研究数据；无量化流量／排名承诺。

## Execution Handoff

本计划已按用户要求保留 Subagent-driven 执行方式。请用户审阅确认计划反映其要求；确认后连续执行全部任务及复核，中途不重复询问是否继续，但发布仍需新的明确批准。
