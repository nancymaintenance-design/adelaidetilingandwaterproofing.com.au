## 2026-10-24 正式发布前复核

用户授权部署32–33：外框16px圆角、全站黑色页尾、服务地区卡片强化。490项全量测试通过，0失败/跳过；38对双语、Feed、SEO 76页7319引用、llms检查通过。76个HTML仅更新共享CSS缓存版本20261024-footer-areas，正文/链接未变。浏览器复核中英地区页8分区40郊区及咨询位置预选通过。发布证据目录 ../reports/footer-areas-release-20261024/；下列本地状态为历史验收快照。

# 黑色页尾与服务地区强化设计QA

final result: passed

日期：2026-10-24。范围：沿用用户截图的椰树配色与既有源代码，将所有页尾黑色化，增强地区卡片；并保留32的16px容器圆角候选。无页面、文案、地区、案例或业务事实新增。

视觉证据：before-areas.jpg / after-areas.jpg、before-footer.jpg / after-footer.jpg；同1280×720桌面视口和相同标题/页尾交互状态比较，已打开comparison-areas.jpg、comparison-footer.jpg并检查局部文字/按钮/边缘。另有390×844的zh-areas-mobile.jpg、en-areas-desktop.jpg。

字体与层级：保留原中英字体，地区h2加粗红/蓝底白字，桌面clamp字号；正文16px/1.6，郊区名称16px/800，不截断。PC两列服务卡片，手机单列，郊区按两列排列。

间距/框体：外框16px、标题/按钮8px；卡片统一内部间距并按行对齐；48px郊区按钮，46px相关服务按钮。手机无横向溢出。

颜色：页尾及分析偏好尾条均rgb(17,17,17)，白字、黄色品牌与电话、红色联系入口；清晰焦点/hover保持。76个正式路由逐页IAB确认黑色页尾及尾条，0异常。

图片/内容：现有图片、施工案例及所有文案保留；8分区40郊区位置和原链接不变。中英文Mawson Lakes点击后可见位置提示分别为“已选择服务地区：北部郊区 · Mawson Lakes”和“Selected area: Northern Suburbs · Mawson Lakes”，未提交表单。

验证：8项专项测试通过，0失败/跳过，包括152个中英文PC/手机视图文字与按钮对比检查。首次运行遇到旧测试在导航DOM呈现前计数，改为等待可见表单后仍执行原URL/唯一表单断言，重跑通过。双语38对、Feed、SEO、llms均通过。证据tests-verified.txt、seo.txt、footer-browser-checks.json、area-journey-checks.json。

P0/P1/P2：无未解决项。本轮仅本地，未提交/推送/部署，正式仍e1c26dc。


---

## 2026-10-23 容器外框圆角（本地）

用户澄清：卡片/地图等外框圆角。共享CSS统一16px，保留照片圆角及现有布局。152视图/724容器四角检查通过，无横向溢出；6项专项及双语/Feed/SEO/llms通过。证据 ../reports/rounded-containers-20261023/。未上线。

## 2026-10-23 卡片与轮播发布前复核

本轮中英卡片配图、16px实际照片圆角、外墙详情图及首页第4张泳池轮播复核完成。490项全量测试通过，0失败/跳过；38对双语、Feed、76页7319引用SEO及llms通过。EN/ZH×PC/手机4个泳池视图均保持原轮播高度、原图比例与16px圆角。76页CSS缓存号更新为20261023-cards-carousel。泳池防水池内施工实拍仍待补，不计为本轮已解决问题。证据 ../reports/card-carousel-release-20261023/。

## 2026-10-23 卡片图片复核与圆角（本地）

两个总览20图不重复；填缝、淋浴密封、外墙交接换适配实拍，外墙详情同步。全部卡片照片16px圆角、完整比例，47项测试及152视图/124实例通过；38对双语/Feed/SEO/llms通过。泳池防水仍需匹配实拍，内容审计不计其通过。未发布；证据 ../reports/card-image-audit-20261023/。

## 2026-10-23 发布前复核

全站紧凑椰树广告UI、按钮清晰度及五组新实拍完成复核。新样式缓存号20261023-coconut-release2已同步76页。490项全量测试通过，0失败/跳过；38对双语、Feed、76页7315引用SEO及llms检查通过。证据：../reports/release-coconut-20261023/tests-final.txt 与 seo.txt。premium-audit.json不纳入发布。

## 2026-10-23 两张贴砖总览实拍替换（本地）

其他区域贴砖与修复卡片按用户指定换图；EN/ZH均加载成功，200px、contain、原链接保留。6项专项测试及双语/Feed/SEO/llms通过。详见 ../reports/tiling-card-supplied-photos-20261023/ 。未上线。

# 阳台防水实拍替换重复图片（2026-10-23）

状态：仅本地，未提交、未推送、未上线。正式仍71747d1。保留24记录的全站按钮候选。

用户指出防水总览的阳台与外墙卡片重复，并提供新的灰色地面、玻璃栏杆阳台照片。仅替换阳台对应图片：英文/中文防水总览卡片、对应阳台详情首图、OG/Twitter分享图同步。外墙卡片与旧图片文件保留供原有使用位置引用；其它服务图片、案例与正文不改。详情替换了旧示意图注释，alt按照片可见内容描述，不补写地点、产品、涂层化学体系、施工日期或质保。

原图575×712，保持完整比例，不放大或裁切。导出575×712 WebP 58288 bytes及400px宽响应图21104 bytes。卡片200px高、详情约420px高；PC详情使用独立竖图栏，避免无意义横向空框。中文通过i18n/zh-Hans/balcony-waterproofing-adelaide.json维护，审阅指纹确认后生成zh页面，未独立手改生成文件。

验证：38对双语、四Feed、76页SEO/7307引用及llms通过。47项针对性测试通过（tests.txt），覆盖历史内容保留、标题/图片原位置、全站文字和按钮回归、服务图片/卡片及首页目录；历史测试只归一化本次明确授权的阳台图片/说明差异，其它内容严格对照保留。IAB中英详情新图均加载、无横向溢出、图高约420px；中文总览阳台与外墙src不同、两图均加载并为200px高（zh-overview-card.jpg）。

详情：http://127.0.0.1:4215/zh/balcony-waterproofing-adelaide.html
总览：http://127.0.0.1:4215/zh/waterproofing-adelaide.html#card-balconies-and-external-wet-exposed-areas

final result: passed

---

# 全站按钮醒目度复核与本地验收（2026-10-23）

状态：仅本地，未提交、未推送、未上线；正式仍71747d1。本轮继续保留全部此前本地UI、真实照片与内容候选。

按用户截图逐类处理所有正式页面的动作入口。报价/咨询为红底白字；电话按钮为黑底黄字；FAQ分类、指南、返回服务和导航操作为蓝底白字。强化实色底、2px边框、字号与44px以上操作高度；FAQ分类52px、电话46–50px，保留此前页尾联系我们52px。FAQ原生展开使用明显黄/蓝标记；轮播控制、指南列表和地区服务入口同步。没有将正文中的普通引用链接机械改成大按钮，原文本、链接目的地、案例、语言结构和Feed不变。

检查：IAB覆盖76页×1440/390共152视图，初轮记录768处主要操作入口，无小于44px、文字对比不足或横向溢出；完整控件集合后来补入回归测试（页头/页尾联系、顶部电话、FAQ展开等）。颜色回归门槛普通文字4.5:1、大字3:1，非完整无障碍认证。

最终490全量测试通过（full-tests-final.txt），包含全站152次文字/动作高度/分类实色底检查、八组中英悬停与焦点检查、FAQ分类锚点/展开和联系表单跳转。键盘焦点有3px以上轮廓，悬停后文字对比仍达4.5:1。未启动电话拨号、未发送询盘。双语、四Feed、76页SEO/7307引用与llms检查通过（seo-final.txt）。首轮full-tests.txt唯一失败为旧测试仍要求已被用户选中连续色带取代的首页背景网格，已仅更新该视觉预期，其余内容与几何约束保留，最终490通过。

证据：before-faq-buttons.png为用户参考，after-faq-buttons-desktop.jpg为同类PC视图；final-primary-buttons-native.jpg为独立验收页实拍，包含蓝色分类、红色报价、黑黄电话及可见键盘焦点。两图视口/滚动略异，仅用于视觉层次对照。all-buttons-152-views.json保存初轮逐项尺寸与颜色数据。

本地预览：http://127.0.0.1:4215/zh/faq.html#tile-materials

final result: passed

---

# 全站PC广告布局、文字清晰度与联系入口：本地验收（2026-10-23）

状态：未提交、未推送、未上线。正式仍为71747d1。保留此前20的贴砖总览真实施工照片、21/22的视觉成果，按用户后续要求继续完成全站。

覆盖范围：38对76个正式页面（首页、两类服务总览、各服务详情、既有案例所在页面、全部指南、FAQ、地区、关于、联系、隐私、条款）。修改共享dossier.css而非单页；正文、案例、图片来源、联系方式、Feed、URL及中英内容保持不变。news旧入口仍按既有规则跳转，不重建页面。

PC服务总览：两列横向图文卡片，200px完整缩略图在左，标题/介绍/详情按钮在右。目录黄黑相接，移除旧白底大块卡片。1440px防水卡片由约616.8×397.9改为657×224.8px；全部8项防水与12项贴砖、分类和目的页保留。奇数末项撑满剩余行，避免半行空档。手机保持纵向完整图片。首页轮播、服务入口、案例卡片、地区、关于、FAQ、指南、联系与法律模板完成相同视觉家族适配，表单、表格等使用必要浅底以便阅读。

清晰度修复：用户截图中材料段落因旧规则将深灰字放在黑底，已改为黑底白字；同时核对并修复图片注释、指南介绍、地区链接、报价表格、联系表单按钮及法律页中的类似组合。正文16px/24px，中文系统字体；未添加模糊滤镜、缩放或文字阴影。新增tests/poster-contrast.test.mjs，对76页×1440/390共152次实际计算文本/背景对比；普通文字4.5:1、大字3:1为门槛。它是颜色回归检查，不代表完整无障碍认证。

联系我们强化：全站中英页头/页尾Contact、联系我们改为红底白字、黑边加粗按钮；页尾52px高、18px字号；主要正文咨询按钮52px高；页尾电话为黑底黄字独立入口。保留原链接地址与电话号码。已实际点击中文页尾联系我们，到达/zh/contact.html并存在咨询表单，未提交询盘。

验证：489项全量测试通过（tests-release-candidate.txt）。最后电话/联系按钮与首页色带调整后，11项专项复测通过（contact-emphasis-final.txt），包括上述全站152次对比度检查、移动导航、卡片、轮播及键盘/表格检查。双语/Feed/SEO/llms检查与git diff --check通过。IAB对76页各1440/390共152视图检查通过：无横向溢出、每页一个H1、无已加载首屏破图、最终计算对比无失败；PC76页截图存desktop-pages，模板合集all-template-overview.png用于视觉家族对照，最终重点图另存。部分截图早于最后联系按钮强化，按钮最终状态以contact-button-footer-zh.jpg和contact-emphasis-final.txt为准。

QA历史：targeted-tests.txt记录初次孤立末项未占满行，被原有检查发现后已修正；all-pages-desktop.json与contrast-repairs.json保留颜色审校过程，最终以all-pages-desktop-final.json及all-pages-mobile-final.json和最新回归为准。保留历史证据，不将初轮失败标为通过。

预览：http://127.0.0.1:4215/zh/waterproofing-adelaide.html
材料文字：http://127.0.0.1:4215/zh/services.html#tile-materials

final result: passed

---

# 连续椰树广告版面：参考实现与验收（2026-10-23）

状态：仅本地，未提交、未推送、未部署；正式仍为71747d1。保留此前20的真实贴砖照片及21的密度候选。

用户本轮提供整页浴室贴砖参考，要求色块紧密衔接、不出现过多白色拼接。继续使用Product Design的已选视觉实现与design-qa流程，本轮仅追加共享dossier.css规则，不改变页面内容、案例、图片来源、网址、Feed或中英结构。

实现：黄底黑字导航，当前导航红底白字；黑底图文首屏、红底黄字H1；目录蓝底直连正文；正文使用直接相接的黄/黑条带及蓝/红标题；深色正文白字、链接黄色，施工范围使用浅黄底；页尾黄底并压缩布局。保留现有宽屏阅读结构与照片完整比例、420px限高；没有为了复刻示意图而裁切或重复真实照片，也没有引入图中额外口号。

视觉对照：selected-reference.png为用户原图971×1619；bathroom-971-full.jpg为971px CSS视口整页实拍。reference-implementation.png将两者完整等比缩至600px宽并排，左参考、右实现。后者保留网站全部原文、面包屑、9个导航入口、目录、附加材料段落、地址与隐私入口，因此页面更长；不声称像素级复刻。检查首屏、黄黑区块接缝、标题、浅底范围栏及页尾，未发现阻断问题。最终桌面1440与手机390截图另存本目录。

QA迭代：初版发现页头电话按钮深色文字不清晰、页尾文字对比不足，已改为明确黄/黑对比。首轮全量测试还发现820px导航溢出，已改为801–1100px允许导航换行，全部原入口保留；补查820/1024首页、FAQ、联系页共6视图均无横向溢出。初轮tests.txt保留问题证据，最终以tests-final.txt为准。

验证：最终488测试通过、零失败；含全站152个路由/视口布局访问。38对双语、四Feed、76页SEO与llms检查通过。IAB额外32视图（8类页面×两种语言×1440/390），无横向溢出、首屏已加载图片无破图、每页一个H1；补查6个平板视图通过。FAQ原生展开、服务页中英切换通过，错误级日志为空。没有提交询盘或请求索引。git diff --check通过。

本地预览：http://127.0.0.1:4215/zh/bathroom-tiling-adelaide.html

final result: passed

---

# 椰树广告紧凑版：本地验收（2026-10-23）

状态：仅本地，未提交、未推送、未部署。正式站仍为71747d1。保留上一轮贴砖总览真实照片候选。

本轮只修改共享dossier.css：黄色底连接首屏标题/介绍/真实照片，黑色细框收住版面；服务分类上下padding从80px收至24px，手机16px；压缩分类标题、卡片、正文、FAQ与页尾间距。保持红蓝黄广告配色、浅色正文与完整照片，照片限高420px、卡片200px，联系方式和交互保留。所有内容、案例、页面和Feed未改。本轮不新增标语或业务声明。

贴砖中文总览1440×1000 CSS视口：首屏高度542.53→476.58px（减少约66px），页面总高4382→4087px（减少295px，约6.7%）。before-after.png左为本轮前、右为本轮后，相同视口和顶部状态，截图统一缩至720px宽并列。变化是用户要求的密度增强；原椰树色系和图文层级保留。主体照片完整，无截断或新增图片。

验证：488全量测试通过；38对双语、四Feed、76页SEO与llms检查通过。IAB检查8类页面×两种语言×1440/390视口共32视图，无横向溢出、每页一个H1、无已加载的首屏破图。检查了首屏以下浴室正文、FAQ展开、服务页语言切换；本次错误级浏览器日志为空，未发送真实询盘。git diff --check通过。

证据：本目录tests.txt、seo.txt、responsive.json、before-after.png及截图。预览：http://127.0.0.1:4215/zh/services.html

final result: passed

---

# Latest scoped media correction — 2026-10-23

User-supplied real roof membrane installation photo replaces the roof AI illustration. Both locales and the waterproofing hub thumbnail use responsive WebP derivatives with the original full composition. Portrait frame fits the image; detail height remains420px and card height200px. Comparison: original user image1280×1698, rendered en/zh1440/390 screenshots in ../reports/roof-real-photo-20261023/. No retouching, generated projects or other UI redesign. 10 targeted checks and bilingual/SEO pass; local only.

final result: passed

[Evidence](../reports/roof-real-photo-20261023/REPORT.md)

---

# Latest selected advertising UI — 2026-10-23

Option 1, refined per user request to avoid an all-black page. Source, full-page browser implementation, normalized comparison, fonts/layout/color/assets/copy, interaction evidence and fix history are documented in [current design QA](../reports/coconut-light-20261023/REPORT.md).

Source: ../reports/coconut-light-20261023/selected-light-reference.png. Implementation: ../reports/coconut-light-20261023/bathroom-final-full.png. Full comparison: ../reports/coconut-light-20261023/comparison-full.png. CSS viewport 1440×1000; source and implementation are normalized proportionally by width, with original content preserved.

488 full-suite tests, 13 final layout tests and 152 final IAB views pass. Footer CTA contrast corrected and captured again. Local only, no real enquiries, no deployment.

final result: passed

---

Historical verification follows.

# Latest UI verification — 2026-10-23

Homepage signboard language extended across the existing bilingual public site; local only. Source and rendered comparison, viewport/density, typography, layout, color, assets, copy, interaction evidence and regression fix history are recorded in [current design QA](../reports/coconut-ui-20261023/REPORT.md).

Source: ../reports/coconut-ui-20261023/reference-home-1280.png. Implementation: ../reports/coconut-ui-20261023/bathroom-final-1280.png. Full-view comparison: ../reports/coconut-ui-20261023/comparison-final.png. CSS viewport 1280×900; both captures 1265×889.

488 tests pass; 152 IAB layout checks, 6 final guide checks, FAQ and enquiry navigation interactions pass. No real enquiry submitted, no production deployment.

final result: passed

---

Historical verification follows.

# Full-site dossier — selected inner-page option 3

## Latest correction — service media, 2026-10-20

The user's follow-up correctly identified gaps missed by the original visual acceptance: a file-loading check did not ensure every service had a photo, and flex-growing orphan cards enlarged 4:3 thumbnail frames. The earlier QA below is historical, not evidence that those problems were absent.

Resolved: all 20 cards now have explicit existing-photo mappings; nine previously photo-free service owners have supporting imagery with bilingual accurate descriptions. Card images are uniformly 200px high; service/case photographs are bounded at 420px, with full composition retained. A sole card uses a compact desktop image/text layout. Shared layout tests still require filled rows, working links and intact originals.

Evidence: `../reports/dossier-20261020/media-tiling-fixed-1440.png`, `media-waterproofing-fixed-1440.png`, `media-timber-fixed-1440.png`, `media-kitchen-fixed-1440.png`, `media-tiling-fixed-390.png`. Inspected the actual IAB layouts, not only asset HTTP status. Real case photos remain on their existing pages; added supporting photos do not introduce new project provenance.

Verification: full suite 466/466 passed, no skips (`media-verified-tests.log`); media-specific checks cover both languages at 390/768/1440/1920; all 20 owner pages checked in both languages. Content preservation still passes for all 70 pages, with explicitly additional `dossier-context-photo` imagery separately tested. SEO: 70 pages / 6739 references; i18n/feeds and diff checks pass. Strict static audit: zero findings. Local only; no deployment.

Latest correction final result: passed

Latest QA: 2026-10-20. Local-only candidate. The earlier homepage QA below remains historical evidence; this section covers the complete redesign.

## Source and comparison

- Visual truth: `C:/Users/UFTR/.codex/generated_images/01a123b7-bc5b-76c3-b2e5-f397de6a47d9/exec-8b42447c-6e04-435f-b551-3e5155f2426c.png`, 1448×1086 pixels.
- Implementation: `../reports/dossier-20261020/kitchen-en-final.png` and Chinese `kitchen-zh-final.png`, in-app browser, ordinary page-top state, photo loaded, enquiry and telephone actions visible.
- CSS viewport 1448×1086. The browser screenshot payload is JPEG despite its filename suffix, 1433×1075 pixels after browser/scrollbar scaling. It is normalized to the source 1448×1086 comparison frame, without browser chrome/device framing.
- Full-view evidence: `../reports/dossier-20261020/comparison.png`, source left / implementation right, opened together. Focused type/intro evidence: `comparison-focus.png`; both originals were also inspected at readable native size.
- Additional evidence: 390px EN/ZH kitchen and Contact screenshots, desktop screenshots for both catalogues, photo-free service, FAQ, About, Areas, guide, privacy and homepage, in the same report directory.

## Iterations and resolved findings

1. Inherited 480px image-height limit caused letterboxing. Removed through a stronger final-layer selector; full natural composition now retained.
2. A tall checklist beside a short paragraph left an empty-looking half. Scope introductions/checklists now span the chapter surface; ordinary prose remains two columns.
3. Guides had both a new index and their existing index. Removed only the new duplicate and styled the original native index. All original destinations remain.
4. The first same-input comparison showed small intro typography and no telephone shortcut. Increased desktop intro type and added the existing business telephone route; recaptured and compared again.

Final full/focused comparisons show no actionable P0/P1/P2 findings.

## Required fidelity surfaces

- Typography: original condensed display family/body fonts; prominent editable H1; 21.6px-max desktop intro. Chinese independently sized. English mobile headings wrap at whole words, without clipping. Full original chapter labels retained.
- Layout: title above photo/independent enquiry surface; compact native index; full-width teal-accent chapter headings and balanced desktop columns. Mobile places enquiry before photo. 140 route/viewport visits have no horizontal page overflow.
- Tokens: existing ink/cream/teal and orange/amber action palette, with no photo overlay. The live H1 remains wholly ink rather than the reference's final-word teal; a minor retained-brand choice, not a hierarchy or readability blocker.
- Images: original kitchen and other source photographs, full natural proportions. The live hero is taller than the mock's cropped-photo composition, intentionally satisfying the user's full-image/content preservation requirement. No invented work image or decorative CSS image substitute.
- Content: all 70 original pages match their text, heading, link, image, JSON-LD and form-field baseline. Only new duplicated chapter labels, decorative thumbnail copies and the existing-phone shortcut are excluded from the original-content hash and checked separately. No new business claim.

## Verification

- `npm test -- --test-concurrency=1`: 464 passed, 0 failed, 0 skipped, `../reports/dossier-20261020/verified-tests.log`.
- New 140-visit matrix: all 70 pages at 390/1440; HTTP 200, one H1, no skipped heading levels, visible broken images, overflow, duplicate IDs or first-party script errors. JSON-LD parses and chapter anchors resolve.
- IAB interactions: chapter jump, service quotation route/preselection, EN→ZH switch retaining query/fragment, FAQ open state. Error/warning log check on final service state returned none. No real enquiry sent.
- `npm run verify:seo`: 70 pages / 6635 references; bilingual mappings and both feeds pass. Feed bytes/publication dates unchanged.
- `git diff --check`: passed, ordinary Windows line-ending notices only.

## Accepted differences / P3 polish

Complete uncropped photo instead of the mock crop; full chapter labels instead of shortened labels; wholly ink H1 instead of final-word teal. No outstanding core-flow/responsive blocker. Optional future coloured trade-word emphasis is P3 only.

final result: passed

---

# Earlier homepage signboard QA

Date: 2026-10-20. Scope: existing English and Chinese homepages, local preview only.

## Visual truth and rendered evidence

- English source: `C:/Users/UFTR/.codex/generated_images/01a123b7-bc5b-76c3-b2e5-f397de6a47d9/exec-72b07dea-d8f4-4859-84bf-374e3dc702eb.png`.
- Chinese source: `C:/Users/UFTR/.codex/generated_images/01a123b7-bc5b-76c3-b2e5-f397de6a47d9/exec-aedcc0b4-6e45-46b3-8ab0-141cefca2c4e.png`.
- Implementation: `http://127.0.0.1:4202/` and `/zh/`, captured with the in-app browser.
- Screenshots: `../reports/signboard-20261020/en-1440.png`, `zh-1440.png`, `en-390.png`, `zh-390.png`.
- CSS viewport: desktop 1440×1000; captured PNG 1425×990 (browser capture scaling), not a device frame. Source EN 1505×1045; source ZH has the same desktop composition. Full comparisons normalize each complete image into a 720×500 box without cropping. No pixel-perfect claims across raster density differences.
- State: page top, kitchen photograph / first slide, complete loaded membrane photograph. Carousel controls retain previous, pause/start and next.
- Full-view comparison: `../reports/signboard-20261020/en-comparison.png` and `zh-comparison.png`; source left, implementation right, opened together for review.
- Focused typography comparison: `en-title-comparison.png` and `zh-title-comparison.png` in the same report directory. Crops cover the trade title, city and signature; each pair was opened together. Phone captures were inspected at full size.

## Findings and iteration history

1. [P2, resolved] The earlier first-child copy-card selector overrode the selected open copy layout. Removed its effect through a correctly scoped later selector. Post-fix full comparisons show no white card or teal copy-column edge.
2. [P2, resolved] Initial heading scale underused the signboard width. Increased English condensed type to a 134.4px cap, with an independent Chinese 120px cap. Final focused comparisons preserve large white/amber trade names; desktop names remain on one line, with no clipping or internal English word breaks.
3. [Capture issue, resolved] A rapid viewport/reload capture preceded the membrane image paint. Final desktop captures were taken after load and confirmed `naturalWidth=800`; both photographs are present in the final comparisons. This was not treated as evidence of missing production content.

No remaining actionable P0/P1/P2 issues in this bounded homepage change.

## Required fidelity surfaces

- Fonts / typography: existing self-hosted Barlow Condensed 800 for English, explicit Chinese-capable sans fallback. One semantic H1 includes both trades and the city; no duplicated H1. Whitespace separates Tiling and Adelaide for assistive reading. Mobile line breaks occur between whole trade labels. The raster mock's exact glyph shapes are not reproduced as an image.
- Spacing / layout: full-width dark title band followed by open copy/photograph columns. The reference's wider cropped photograph is intentionally replaced with the existing complete 4:3 photo, per the site's image-preservation contract. This gives a slightly taller lower row; no fixed viewport-height shell or empty copy card. At narrow widths copy precedes the main carousel; the secondary membrane image remains available in the existing service-scene section rather than repeating above it.
- Colors / tokens: signboard consumes `--ink`, trade accent `--sun`, actions existing brand/amber tokens. Body uses the existing warm surface and material grid. No dark photograph overlay. Existing palette remains canonical in `brand.css`.
- Image quality / fidelity: actual supplied kitchen, balcony, courtyard and pool photographs are retained, with original responsive derivatives. Existing membrane photograph fills the secondary desktop slot. No generated replacement, fake project provenance or illustration substitute was introduced.
- Copy / content: direct first-person service statement, short quotation invitation, original telephone, service links and case links retained. The two locales are reviewed and generated from one structure. No invented claims, reviews or guarantees.

## Responsive and interaction checks

- In-app browser: EN/ZH at 320, 390, 768, 1024, 1440, 1920 CSS px; final measurements in `../reports/signboard-20261020/responsive.json`. No horizontal overflow; one H1. Desktop trade labels share a row; phone labels stack without breaking the English words.
- Carousel: pause/start and next/previous exercised; status moves 1→2→1. Keyboard Tab reaches next with a visible solid focus outline. Both language links exercised. Error-level browser log query returned no entries during the checked interaction pass.
- Full project suite: 460 passed, 0 failed, 0 skipped, including existing reduced-motion, carousel and bilingual/browser tests. New structural and responsive regressions cover signboard position, trade labels and retained photographs.
- `npm run verify:seo`: 35 bilingual pairs, four feeds, 70 indexable pages, 6323 references passed. `git diff --check` passed.
- Premium strict static audit: no findings. DESIGN lint: zero errors; four existing unreferenced-token warnings remain. No independent build/typecheck/formatter scripts exist in this static project.
- No real enquiry was sent, no remote indexing requested and no deployment/push performed. Existing prior local conversion edits were preserved.

## Follow-up polish

- P3: the mock's ampersand/divider and small signature details differ slightly; the real page prioritizes editable, accessible bilingual text and unchanged source photographs. These do not affect the selected visual hierarchy or lead path.

## Implementation checklist

- [x] Selected option 3 in both languages.
- [x] Full-width trade H1; desktop and phone break rules.
- [x] Existing carousel, photographs, service destinations and contact entry retained.
- [x] Generated Chinese source and review fingerprints current.
- [x] Browser comparison and full test suite passed.
- [x] Local preview retained; not deployed.

final result: passed
