# Named image placement — 2026-10-08

This revision replaces the earlier attachment derivatives using the eight named PNGs in `E:/Download/tiling`. Source files are unchanged. No production deployment.

| User image | Optimised asset | Placement |
|---|---|---|
| 首页主图.png | home-waterproofing-hero | Homepage static hero |
| 防水服务页.png | waterproofing-wall-application | Waterproofing detail page |
| 铺砖服务介绍.png | floor-tiling-service | Services tiling introduction and homepage tiling scene |
| 完工效果展示.png | bathroom-finished-result | Homepage finished-surface panel and bathroom renovation page |
| 阳台场景.png | balcony-waterproofing-scene | Homepage balcony scene |
| 泳池露台铺砖施工现场.png | pool-terrace-tiling | Homepage pool-surround scene |
| 浴室防水页.png | bathroom-waterproofing-membrane | Bathroom waterproofing page and Services waterproofing introduction |
| 展示施工细节.png | waterproofing-junction-detail | Homepage drain/junction detail scene |

Each asset has 1600×900 and 800×450 WebP variants. Desktop variants are approximately 109–248 KiB; mobile variants 34–75 KiB. Inline images use responsive `srcset`, reserved dimensions and lazy loading. The hero uses the 800px derivative on small screens; stylesheet revision prevents reuse of the previous background reference.

Processing: `node tools/prepare-named-media.cjs` resizes and compresses only. It performs no content generation or retouching. Labels describe visible service/stage content; project location, date and company authorship are not invented.

The earlier `SUPPLIED-MEDIA-REPORT.md` is a historical record, superseded by this placement table for current images.

Browser verification: homepage checked at 1440px and 390px with no horizontal overflow; the mobile hero selects the 800px image. Waterproofing, bathroom waterproofing and renovation feature images load their assigned sources. Below-fold images retain lazy loading. Screenshots: `evidence/named-media-home-desktop.png` and `evidence/named-media-home-mobile.png`.
