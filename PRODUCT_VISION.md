# C Learning Platform — Product Vision and MVP Plan

## Vision
A browser-based, split-pane learning environment where students read concise explanations and immediately practice C programming in an embedded editor with instant feedback, automated tests, and progress tracking.

## Goals
- Make C approachable through hands-on, scaffolded lessons.
- Provide reliable, safe code execution for C programs with clear compile/run errors.
- Track learner progress and adapt difficulty with hints and formative assessments.
- Enable instructors to author and maintain content easily.

## Non-goals (initial)
- Full-featured multi-file IDE with advanced debugging/build systems for large projects.
- Real-time pair programming or classroom live proctoring.
- Support for languages other than C (future).

## Target Users
- **Complete beginners**: high school or first-year university students.
- **Undergraduates**: systems/OS students who need testing and memory-safety feedback.
- **Self-learners**: professionals revisiting C basics.
- **Instructors**: authors/maintainers of lessons and assessments.

## Core Use Cases
- **Read-and-code**: read lesson, run code, submit against official tests, save progress.
- **Guided exercises**: fill-in-the-blank/function tasks with hidden tests.
- **Quizzes**: embedded MCQ and true/false concept checks.
- **Projects (later)**: multi-file templates + tests.
- **Instructor authoring**: markdown lessons + code stubs/tests/hints/solutions.
- **Progress tracking**: resume state, completion map, weak-topic visibility.

## MVP Functional Requirements

### Authentication and Profiles
- Email/password and OAuth (Google, GitHub).
- Profile with progress (streaks/badges later).

### Courses and Curriculum
- Hierarchy: **Course → Section → Lesson → Exercise**.
- Markdown content with YAML front matter.
- Concept tags (variables, control flow, pointers, arrays, functions, structs, memory, files).

### Split-Screen Lesson Page
- Left: lesson text, examples, diagrams, hints, quizzes.
- Right: code editor and console/test result panes.
- Actions: **Run**, **Submit**, **Reset**, **Format**.
- Input/args fields and visible time/memory limits.
- Auto-save and previous attempts.

### Editor
- Syntax highlighting.
- Basic IntelliSense and warning surfacing.
- Optional keymaps (Vim/Emacs), theme, and font-size settings.

### Code Execution and Grading
- GCC/Clang compile in sandbox with safe flags.
- Captured stdin/stdout/stderr, exit code, time/memory usage.
- Visible sample tests and hidden submit tests.
- Result view with pass/fail, diffs, and compiler diagnostics.

### Progress and Hints
- Per lesson/exercise completion state.
- Hints gated by attempt count.
- Solution unlock policy after threshold/pass.

### Authoring/Admin
- Admin portal for lessons, assets, tests, and limits.
- Draft/publish workflow and versioning.

### Basic Analytics
- Aggregate correctness rates.
- Common error patterns.
- Lesson drop-off points.

## Non-Functional Requirements
- **Security**: strong isolation for untrusted C code, no outbound network.
- **Performance**: typing latency <100ms, average compile <2s for small programs.
- **Availability**: 99.9% API uptime during learning hours.
- **Scalability**: absorb class bursts (e.g., 200 concurrent submissions).
- **Accessibility**: WCAG 2.1 AA.
- **Compliance**: GDPR, COPPA (if minors), FERPA (institutional).
- **SEO**: SSR for public content.

## System Architecture (High-Level)
- **Frontend**: Next.js + TypeScript + Monaco.
- **Backend API**: REST/GraphQL with auth, validation, rate limiting.
- **Runner service**: jailed compile/execute workers.
- **Data**: PostgreSQL + object storage + Redis.
- **Queue**: RabbitMQ/NATS/SQS for run jobs.
- **Observability**: Prometheus/Grafana + centralized logs + Sentry.
- **CDN**: static asset distribution.

## Runner/Sandbox Design
- Isolation via Docker + seccomp/AppArmor, or stronger runtime (nsjail/gVisor/Firecracker).
- No network, read-only base image, ephemeral writable workspace.
- Resource controls: CPU, memory, pids, hard timeout.
- Compile and test lifecycle with structured results and correlation IDs.
- Output truncation and quotas to prevent abuse.

## Content & Exercise Model
- Lesson markdown with metadata and embedded examples.
- Exercise package (MVP single-file):
  - `starter.c`
  - `tests.yml`
  - `solution.c` (private)
  - `hints.md`
- Test definitions: stdin/args/expected/comparator/visibility/limits.

## API Surface (Sample)
- Auth: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`
- Courses: `/courses`, `/courses/{id}`, `/courses/{id}/outline`
- Learning: `/lessons/{id}`, `/exercises/{id}`
- Runs: `POST /runs`, `GET /runs/{id}`, `WS /runs/{id}/stream`
- Submissions: `POST /submissions`, `GET /submissions/{id}`
- Progress: `GET /me/progress`, `PATCH /progress`

## Recommended Initial Stack
- Frontend: Next.js + TypeScript + Monaco.
- Backend: Go (runner orchestration advantage) **or** Node/Nest if team proficiency is higher.
- DB: PostgreSQL.
- Queue/cache: RabbitMQ/SQS + Redis.
- Runner option:
  - Fast start: Judge0 CE (self-hosted).
  - Long term control: custom nsjail/Docker runner.

## Security Essentials
- No network from user code.
- Drop Linux capabilities + restrictive seccomp.
- Strict CSRF/CORS/session handling in web layer.
- Sanitized markdown rendering (XSS prevention).
- Secret management via vault/parameter store.

## Testing Strategy
- Unit tests for APIs and orchestration logic.
- Integration tests for end-to-end grading path.
- E2E tests (login → lesson → run → submit).
- Security and load testing for runner infrastructure.

## Rollout Milestones (12 Weeks)
1. Weeks 1–2: requirements, schema, wireframes, architecture.
2. Weeks 3–4: auth + course/lesson APIs + shell UI.
3. Weeks 5–6: editor + run pipeline.
4. Weeks 7–8: submit grading + progress + basic admin.
5. Weeks 9–10: quizzes/hints/analytics + UX/accessibility polish.
6. Weeks 11–12: hardening, load tests, bug fixes, beta cohort.

## Success Metrics
- Learning: pass-rate and quiz improvement over retries.
- Engagement: lessons/session, 7-day retention, time-to-first-success.
- Quality: compile-to-run latency, runner failure rate, test flakiness.
- Growth: completion rate and instructor adoption.

## Risks & Mitigations
- **Sandbox risk**: use proven isolation tools, patch aggressively, review regularly.
- **Runner cost**: autoscaling, quotas, optional WASM path for simple tasks.
- **Latency spikes**: queue-based backpressure + pre-warmed workers.
- **Beginner frustration**: friendly error translations + progressive hints.

## Optional Enhancement: Hybrid Execution
- Use `clang.wasm + WASI` in-browser for simple stdin/stdout tasks.
- Automatically route heavier workloads to server-side runner.

