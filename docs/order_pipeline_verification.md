# VERIFIED REPORT — The Order / Staging Pipeline ("Agency OS")
### Does the back-end already support gathering many deliverables without timing out?
*Verification by reading the live code, 2026-07-09. Founder asked: confirm the anti-timeout staging architecture is real, engineered, and ready to carry the expanded deliverable list.*

---

## BOTTOM LINE (verdict)
**Yes — it's real, and it's well-built.** The pipeline is purpose-designed so that no single step can time out, pieces are held and resumed (never restarted), and **new deliverables are added as data, not code rewrites.** Your plan will not fail on the timeout/staging front. Two honest precisions and one status note are below — nothing that breaks the plan, but you should know them.

---

## HOW IT WORKS (the hierarchy, plain then precise)

A paid order becomes a **job** with a checklist of small **tasks**. A tireless **Foreman** does the tasks one at a time; a **Watchdog** patrols for anything stuck; an **Assembler** puts the finished pieces together at the end. In precise terms:

1. **`order-open` / `order-start`** — turns one order into one job row + its task list (from a manifest), then wakes the Foreman.
2. **`order-foreman-background` (THE FOREMAN)** — wakes, takes **exactly ONE** pending task, finishes it in seconds, saves the result, then **calls itself for the next task and exits.** No single invocation ever carries more than one small task. Each department call has a **24-second guard**.
3. **Departments** (`naming`, `judge`, `copy`, `design`, `cinema`, and stubs for `web`, `print`, `campaign`, `apps`) — do the actual work, called as locked functions over HTTP or as code-only steps.
4. **`order-watchdog` (THE WATCHDOG)** — re-queues anything stuck, with backoff; enforces budgets; never blocks an order.
5. **`order-assemble-background` (THE ASSEMBLER)** — when all *required* tasks are green, composes the final report from the saved pieces, enforces the locked card counts, reveals it in the workspace, and triggers the ready email. **Graceful degradation: a report always ships complete at its tier — never late, never never.**
6. **Supabase (the Storage / Holding Room)** — every finished piece is saved (small JSON + file keys in `smn_tasks`; big image blobs in Supabase Storage). The Foreman reads prior pieces as inputs, so work **resumes from where it left off and never restarts.**

---

## THE ANTI-TIMEOUT DESIGN (verified, with the real numbers)
This is the heart of what you engineered, and it checks out:
- **One task per wake, then chain + exit.** Because each invocation does one small thing and hands off, nothing runs long enough to hit a platform time limit. (Verified in `order-foreman-background`: it awaits its own re-trigger so "the chain leaves the building before we return.")
- **Heavy work runs as Netlify *background* functions** (15-minute allowance, not the 10-second synchronous wall). The naming pool alone is budgeted to 7 minutes (`420000ms`) — comfortably inside that.
- **Per-call guard = 24 seconds** (`GUARD_MS = 24000`).
- **Watchdog:** tasks stuck "running" past **5 minutes** (`OS_STALL_MINUTES`, default 5) go back to pending with **backoff** (retry delayed up to 10 minutes). Optional tasks retry up to 5 times; **required** tasks get up to ~7 bounded attempts before the job is "parked" with a loud alarm. Jobs stuck "assembling" past 10 minutes are reopened and re-poked.
- **Budget cap:** if a job exceeds its cost budget, remaining *optional* tasks are dropped (graceful degradation) — required tasks are protected.

---

## DELIVERABLES ARE DATA (the scaling claim — verified)
This is the most important finding for your expansion plan. In `order-manifests.js`:
> *"Adding a new deliverable = adding a manifest here. The Foreman, Watchdog and Assembler never change."*

A manifest is just a list of tasks like `{ dept:'web', type:'onepager' }`. **Manifest stubs already exist** for `brand_website_v1`, `print_pack_v1`, `campaign_pack_v1`, and `small_applications_v1`. So the architecture is *already pre-wired* for exactly the kind of expansion you want — website, print pack, campaign, apps. To add a T-shirt, business card, letterhead, etc., you add a manifest entry and a department that builds it; **the pipeline machinery is untouched.** That's the "add a registry row" design working as intended.

---

## TWO HONEST PRECISIONS + ONE STATUS NOTE
1. **"24 hours" is actually 24 *seconds* per call.** The `24000` in the code is the per-call guard (24s), and the watchdog works in minutes (5-min stall, 10-min backoff). **I found no explicit 24-hour ceiling.** That's not a problem — because of the chain + watchdog + retries, an order is **not time-boxed to one invocation** and *can* gather over a long window. So the *spirit* of "it won't time out over a long gather" is true; the literal "24-hour window" is a mental model, not a coded limit. If you want a hard 24-hour max, it's a tiny config to add.
2. **Each new deliverable still needs its builder written + tested.** The manifest (the data) is trivial. The **department that actually generates** the T-shirt/card/website — that's the real per-deliverable work, and each builder must either finish inside the 24-second guard or run as its own background department. The pipeline carries them; it doesn't invent them.
3. **The pipeline is currently STAGED / DARK, not live.** It's gated behind `SMN_ASSEMBLY` (= `shadow` or `on`) and `ORDER_START_KEY`, and is **not wired to payment** — turning it on is the "Phase D cutover," a separate Founder GO. So it is exactly as you said: *engineered and waiting* — just not switched on yet.

---

## HONEST LIMIT OF THIS VERIFICATION
I confirmed the **structure** by reading the code — the design is sound and does what you said. I did **not** run the live pipeline here (that needs Supabase + the live keys). The system supports a **shadow-mode** dry run (`SMN_ASSEMBLY='shadow'`), which is the right way to prove it end-to-end before going live — no guessing.

## BOTTOM LINE, RESTATED
The staging engine you built is genuinely good and does the hard thing right: it can gather a large, growing pile of deliverables without timing out, hold them safely, and assemble them at the end — and it's built to accept new deliverables as data. Adding the expanded list rides on top of this cleanly. The work ahead is **the individual deliverable builders**, not the plumbing. The plumbing is done and waiting.

*Verified against the codebase 2026-07-09. Changeable only by the Founder.*
