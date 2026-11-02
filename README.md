# PaperReading · tianxl64

公开论文—代码闭环精读索引站，结构参考 `linchunhui/PaperReading-skills`。

- 入口：`index.html`
- 机器可读清单：`reports.json`
- 报告页面：`reports/<slug>/index.html`
- 当前收录：12 篇

只发布已确认的最终 HTML 报告和其实际展示所需的资源。`.codex`、`.paseo`、子代理工作区、日志、凭据、PaperQA2 缓存和 ImageGen 候选图均不进入公开仓库。

## 后续添加

新增报告时，将自包含 HTML 和资源放入新的 `reports/<slug>/`，再在 `reports.json` 添加一条记录；索引页会按 `category` 自动分组，并提供搜索。

## 来源

本机来源登记在未提交的 `.local/canonical-sources.json`；完整本机路径不进入公开目录。公开清单中的 `source_html_sha256` 和各报告的 `publication.json` 绑定源 HTML 版本、交付状态、正文保全结果和资源哈希。

更新报告时先读取任务的当前 `run-manifest.json` 和最终交付回执，核对它们绑定的 HTML 路径与 SHA-256，再生成发布副本。不得从旧发布脚本、历史路径或 HTML 标题中的“候选”字样推断当前正式版本。迁移后的任务以本机登记的完整路径为准，不能假定所有报告都位于 C 盘或固定的 `08_report/`、`11_html/` 目录。
