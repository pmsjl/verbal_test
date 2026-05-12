# Verbal Memory 实验平台

研究音乐对短时记忆/学习效率影响的实验数据采集系统。被试在「听音乐」与「不听音乐」两种条件下完成一个 humanbenchmark 风格的 Verbal Memory 测试，系统记录其得分与完成时长。

## 为什么自建而非用 humanbenchmark.com

humanbenchmark 是第三方网站，无法在其服务器加埋点；其词表和难度算法也不公开。本项目构建一个**功能等价**的实现，自管词表、自管难度曲线、自管音频播放与数据采集，保证两组被试条件可比。

## 实验设计

- **分组**：两组，组间被试设计
  - `no_music`：静音环境
  - `music`：播放实验组指定音频（统一曲目、统一音量、与测试同步开始）
- **采集指标**：只采两个
  - `score`：最终得分（答对总次数）
  - `duration_ms`：完成时长，从被试点击「开始」到第 3 次答错的毫秒差
- **已知混淆变量**：英文水平。词库为英文，被试为中文母语者，词汇量会影响表现。被试问卷中以 3 档自评量表（1=弱 / 2=中 / 3=强）采集，作为有序类别协变量纳入分析模型。

> 注意：`score` 和 `duration_ms` 高度相关——得分越高，答题轮数自然越多，时长也越长。两者不是独立指标，统计分析时不要当独立变量处理。

## 测试机制（功能等价规范）

严格遵循 humanbenchmark Verbal Memory 规则：

- 初始 **3 条命**，初始分数 0
- 屏幕一次显示一个英文词，被试判断是 **NEW**（本轮没见过）还是 **SEEN**（本轮见过）
- 答对：`score += 1`
- 答错：`lives -= 1`
- 命扣完 → 游戏结束，提交 `score` 和 `duration_ms`
- 键盘快捷键：`N` = New，`S` = Seen

### 词库

- 来源：英语专四专八高频词汇 1500 词（原始文件 `C:\Users\jerry\Desktop\test.md`）
- 规模：1361 个（原 1500 中剔除长度 >10 字母的词）
- 难度：整体偏中高频，对中文母语者具备明显记忆挑战，匹配实验对"生僻感"的要求
- 存放位置：`frontend/src/data/wordlist.ts`，`export const WORDLIST`

### 难度算法

每轮决定显示「新词」还是「已见词」的概率：

```
p_seen = n / (n + k)
```

- `n` = 当前 `seen_pool` 大小（已经出现过的不重复词数量）
- `k` = 平滑常数，**默认 3**（可调）
  - `n=3` 时 `p_seen=0.5`
  - `n=10` 时 `p_seen≈0.77`
  - `n` 越大，重复词概率越高 → 记忆压力越大

实测后可微调 k 值匹配原版手感，调完写回此文档。

## 技术栈

| 层 | 选型 |
|---|---|
| 前端 | Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3 |
| 后端 | Spring Boot 3.2 + MyBatis-Plus 3.5（Java 17） |
| 数据库 | MySQL |
| 音频 | HTML5 `<audio>`，文件放 `frontend/src/assets/audio/`，Vite 自动发现 |

**不引入 Redis**——数据量小、无缓存需求。

## 数据模型

### participant（被试）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| code | VARCHAR(32) | 被试编号（实验员指定） |
| age | INT | 年龄 |
| gender | VARCHAR(8) | 性别 |
| english_level | TINYINT | 英语水平自评：1=弱 / 2=中 / 3=强 |
| music_habit | VARCHAR(64) | 日常听音乐习惯（频率/类型） |
| created_at | DATETIME | 记录创建时间 |

### test_record（测试记录）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| participant_id | BIGINT FK | 关联 participant.id |
| condition | VARCHAR(16) | `no_music` / `music` |
| score | INT | 最终得分 |
| duration_ms | BIGINT | 完成时长（毫秒） |
| created_at | DATETIME | 测试完成时间 |

> 同一被试可以做多次（不同条件各一次），所以 participant : test_record = 1 : N。

## API 契约

| Method | Path | 用途 |
|---|---|---|
| POST | `/api/participants` | 录入被试信息，返回 `participant_id` |
| POST | `/api/records` | 提交一条测试结果 `{participant_id, condition, score, duration_ms}` |
| GET  | `/api/records` | 列出全部记录（已 JOIN participant），管理页用 |
| GET  | `/api/records/export` | 导出全部记录为 CSV，直接拖进 SPSS / Python 分析 |

## 目录结构

```
verbal_test/
├── CLAUDE.md                            # 本文件
├── .gitignore
├── frontend/                            # Vite + React + TS + Tailwind
│   ├── package.json
│   ├── vite.config.ts                   # @ → src 别名
│   ├── tsconfig.json / tsconfig.node.json
│   ├── tailwind.config.ts / postcss.config.js
│   ├── index.html                       # Vite 入口
│   ├── .env / .env.example              # VITE_API_BASE
│   └── src/
│       ├── main.tsx / App.tsx           # 入口 + ?admin=1 路由
│       ├── index.css                    # @tailwind base/components/utilities
│       ├── assets/audio/                # 实验音频（放文件即用，Vite 自动发现）
│       ├── data/wordlist.ts             # 1361 个英文词
│       ├── lib/
│       │   ├── api.ts                   # 类型化的后端 HTTP 封装
│       │   └── verbalTest.ts            # 纯 TS 状态机（p_seen / 命数）
│       └── components/
│           ├── InfoForm.tsx             # 被试信息表单
│           ├── ReadyScreen.tsx          # 准备页
│           ├── TestScreen.tsx           # 测试核心 UI + 音频 + 键盘
│           ├── DoneScreen.tsx           # 结果 + 自动提交
│           └── AdminPage.tsx            # 实验员管理页（表格 + 导出）
└── backend/
    ├── pom.xml                          # Spring Boot 3.2 + MyBatis-Plus 3.5
    ├── src/main/
    │   ├── java/com/verbaltest/
    │   │   ├── VerbalTestApplication.java
    │   │   ├── config/CorsConfig.java
    │   │   ├── controller/              # ParticipantController, RecordController
    │   │   ├── service/                 # 接口
    │   │   ├── service/impl/            # 实现类
    │   │   ├── mapper/                  # MyBatis-Plus Mapper 接口
    │   │   ├── entity/                  # Participant, TestRecord
    │   │   └── dto/                     # 请求/响应 DTO + RecordView（Java record）
    │   └── resources/
    │       ├── application.yml          # DB 连接 + Jackson SNAKE_CASE
    │       └── mapper/                  # （预留 MyBatis XML 目录，当前未使用）
    └── sql/init.sql                     # 建库 + 建表
```

## 开发与运行

### 1. 数据库

```bash
mysql -u root -p < backend/sql/init.sql
```

这会建库 `verbal_test` 并建表 `participant`、`test_record`。

若 root 密码不是 `root`，改 `backend/src/main/resources/application.yml` 里的 `spring.datasource.password`。

### 2. 后端

```bash
cd backend
mvn spring-boot:run
```

或在 IDE 直接跑 `VerbalTestApplication.main()`。后端起在 `http://localhost:8080`。

启动后可访问的接口：

- `POST http://localhost:8080/api/participants`
- `POST http://localhost:8080/api/records`
- `GET  http://localhost:8080/api/records/export` （下载 CSV）

### 3. 前端

```bash
cd frontend
pnpm install         # 或 npm install
pnpm dev             # Vite dev server → http://localhost:5173
```

被试入口：`http://localhost:5173/`
实验员管理页：`http://localhost:5173/?admin=1`（表格预览 + 一键导出 CSV 按钮）

> 后端地址通过 `VITE_API_BASE` 配在 `frontend/.env`，默认 `http://localhost:8080`，已被 `CorsConfig` `allowedOriginPatterns("*")` 放行。

构建产物：`pnpm build` → `frontend/dist/`，可直接拖到任何静态托管（Cloudflare Pages 等）。

### 4. 替换实验音频

把音频文件放到 `frontend/src/assets/audio/` 即可，Vite 会在构建和 dev 时用 `import.meta.glob` 自动扫描该目录，取第一个音频文件播放。**无需改任何配置或 env。**

支持的格式：MP3 / M4A / AAC / WAV / OGG / Opus / FLAC（浏览器原生 `<audio>` 能播的都行）。文件名可以是中文、含空格。如需替换音频：删旧放新，保存任意源文件让 HMR 触发重载。

### 5. 数据导出

- 推荐：浏览器开 `http://localhost:5173/?admin=1`，点"导出 CSV"
- 命令行：`curl -O -J http://localhost:8080/api/records/export`

CSV 含 UTF-8 BOM，Excel 直接打开不乱码；pandas/SPSS 也可直接读取。

## 部署

部署后台默认使用环境变量覆盖 `application.yml` 中的占位项，本地开发不设环境变量则继续走 `localhost:3306 / root / 123456 / CORS *` 的默认值。

### 后端：云服务器 (Linux)

前置：服务器装好 Java 17、MySQL 8，已用 `backend/sql/init.sql` 建好库表。

1. 在开发机打包：
   ```bash
   cd backend
   mvn package -DskipTests
   # → backend/target/verbal-test-backend-0.1.0.jar
   ```
2. 上传 jar 到服务器（scp 或 CI 流水线均可）。
3. 用环境变量启动（建议放在 systemd Unit 的 `Environment=` 里）：
   ```bash
   DB_HOST=localhost \
   DB_PORT=3306 \
   DB_NAME=verbal_test \
   DB_USERNAME=verbal \
   DB_PASSWORD=<生产密码> \
   ALLOWED_ORIGINS=https://verbal.example.com \
   java -jar verbal-test-backend-0.1.0.jar
   ```
4. 推荐前面挂 Nginx 反代 + Let's Encrypt HTTPS，证书指向 `api.verbal.example.com`，反代到 `http://127.0.0.1:8080`。

### 前端：Cloudflare Pages

1. 把仓库 push 到 GitHub。
2. Cloudflare Dashboard → Pages → Connect to Git，选这个仓库。
3. 构建配置：
   - **Root directory**: `frontend`
   - **Build command**: `pnpm install && pnpm build`（或 `npm install && npm run build`）
   - **Build output directory**: `dist`
4. 环境变量：`VITE_API_BASE=https://api.verbal.example.com`（覆盖 `.env.production`）。
5. Custom domains 接你购买的域名（例 `verbal.example.com`）。

### 关于管理页安全

⚠️ 当前管理页 (`?admin=1`) 没有鉴权。部署后任何知道这个 URL 参数的人都能访问。短期靠 URL 不外传规避；长期想正式公开必须补一个 Bearer token / 登录态。

## 后续待办

- [ ] 实测难度曲线 k 值，必要时调整 `frontend/src/lib/verbalTest.ts` 中的 `K` 常量
- [ ] 正式实验音频放置到 `frontend/src/assets/audio/`
- [ ] 写一份给被试看的实验同意书 / 简介页（可选）
- [ ] 管理页登录鉴权（当前靠 `?admin=1` URL 私密性，参见「部署」节末尾的警告）
