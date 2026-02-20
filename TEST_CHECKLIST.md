# OpenClaw 测试清单 (v1.0)

适用目标：验证 OpenClaw 的稳定性、兼容性与健壮性，并覆盖新闻热点总结能力。

## 1) 系统稳定性 (System Stabilizer)
- [ ] 运行健康检查：`node skills/system-stabilizer/bin/health-check.js`
- [ ] 校验配置文件有效：`~/.openclaw/openclaw.json` 可解析
- [ ] 校验存储可用：`skills/elite-longterm-memory/memory` 存在且可写
- [ ] 校验网络可用：外网连通性检查通过
- [ ] 演练自愈：模拟丢失 `memory` 目录后可自动重建（完成后恢复原数据）

## 2) 技能精准应用 (Skill Optimizer)
- [ ] 低成本任务路由：`node skills/skill-optimizer/bin/route.js "check my calendar"` 推荐 `local-calendar-skill`
- [ ] 高成本任务路由：`node skills/skill-optimizer/bin/route.js "summarize youtube video"` 推荐 `universal-web-summarizer`
- [ ] 路由输出包含成本/预估消耗字段（cost / token_usage_estimate）

## 3) 技能生命周期 (Lifecycle Manager)
- [ ] 审计能力：`node skills/skill-lifecycle-manager/bin/audit-skills.js` 可执行并产出 `audit-report.json`
- [ ] 审计异常可容忍：ClawHub 搜索失败不会导致整体崩溃（允许降级）

## 4) 新闻热点总结能力 (Daily Briefing)
- [ ] 运行抓取：`node skills/autonomous-daily-briefing/bin/fetch-news.js`
- [ ] 输出包含关键分区：Weather / Calendar / AI & Tech News
- [ ] 输出包含至少 2 个可信来源分区（例如 OpenAI / Google / ArXiv）
- [ ] 失败可控：个别来源 404/超时需以错误行体现，但整体输出仍可生成
- [ ] 性能可接受：在合理超时（例如 60~180s）内可产出“主体内容”

## 5) 网页/视频总结能力 (Universal Web Summarizer)
- [ ] 文本网页：`timeout 45s node skills/universal-web-summarizer/bin/summarize.js "http://example.com"` 成功抽取文本
- [ ] 视频链接：`timeout 60s node skills/universal-web-summarizer/bin/summarize.js "<YouTube URL>"` 需满足：
  - [ ] 能拿到 transcript 或给出可用的降级结果
  - [ ] 不应因浏览器导航异常直接失败

## 6) 自动化工作流 (Morning Routine)
- [ ] 端到端执行：`./morning-routine.sh`
- [ ] 生成物存在：`daily-briefing-raw.md`
- [ ] 生成物内容足够：长度 > 500 字符

