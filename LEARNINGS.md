# Learnings: Storybook + Chromatic for Design System Teams

Built a Toast notification component library from scratch to understand the developer experience and visual testing workflows used by design system teams. This document summarizes what the stack does well, where it's awkward, and what to evaluate before recommending it to a team.

---

## What Storybook is good at

**Component isolation.** Storybook renders components outside your app, which forces you to think about props and state boundaries explicitly. A component that's hard to story is usually a component with unclear dependencies — the act of writing stories surfaces design problems.

**Living documentation.** The `autodocs` tag generates a Docs page from your TypeScript types and story args. When the component changes, the docs change automatically. This is the main reason design system teams use it: documentation that can't go stale because it's derived from the actual code.

**The Controls panel.** Non-engineers can open Storybook, tweak props live, and see results without touching code. For a PM exploring component behavior or a designer checking edge cases (long strings, missing icons), this is genuinely useful.

**Interaction tests via `play` functions.** A single `play` function doubles as a visual demo (shows the interaction in the Storybook UI) and a test (the `expect` assertions run in CI via addon-vitest). You don't write the same scenario twice.

**Context provider patterns.** The decorator system cleanly solves the "this component needs a provider" problem. A one-time decorator in `meta` wraps every story in the file — no repetition per story, no boilerplate.

---

## Where Storybook is awkward

**Setup friction.** The `npx storybook@latest init` scaffold is good, but it assumes npm/yarn. With pnpm 11's strict build-script security model, you spend time approving esbuild builds (`pnpm-workspace.yaml allowBuilds`) before anything works. This is fixable but opaque — the error message points you to `pnpm approve-builds` rather than the workspace config.

**Version mismatches across the ecosystem.** Storybook 10 ships its types across multiple packages (`@storybook/react-vite`, `@storybook/test`, `@storybook/blocks`, `@storybook/addon-docs/blocks`). The `init` script doesn't install all of them, so you hit "Cannot find module" errors when you write your first story that uses a feature not covered by the scaffold. Each error is fixable, but a new user hits several in a row.

**Timing-sensitive stories.** Stories that depend on timers (`auto-dismiss after 1s`) are inherently flaky in snapshot tools. The escape hatch — `chromatic: { disableSnapshot: true }` — works well, but you have to know it exists. It's not something the tooling guides you toward.

**`node_modules` and git.** Storybook's `init` doesn't create a `.gitignore`. If you initialize git after installing packages, you end up tracking 9,000+ files. Not Storybook's fault, but it's a common trap for new projects.

**MDX import paths changed in v10.** `@storybook/blocks` (the v8 package) doesn't exist in v10 — the correct import is `@storybook/addon-docs/blocks`. The docs don't always reflect this, which causes confusing build failures.

---

## What Chromatic adds beyond Storybook alone

**Pixel-level regression detection.** Storybook shows you what a component looks like. Chromatic tells you what *changed* between runs. Changing `rounded-md` to `rounded-lg` across 14 stories is invisible in code review but immediately obvious in Chromatic's diff view. This is the core value proposition.

**A review workflow with accountability.** Chromatic's UI Review creates a named, trackable approval process. Someone accepted the change, on this build, on this date. For design systems used across multiple teams, that audit trail matters.

**Baseline management.** The "accept = new baseline" model is simple but powerful. You're not writing assertions about pixel values — you're saying "this is correct now, alert me if it changes."

**CI integration with PR status checks.** Once wired into GitHub Actions, Chromatic posts a required status check on every PR. A visual change can't be merged without a human reviewing it. This enforces the review workflow without relying on team discipline.

**TurboSnap.** The `--only-changed` flag traces the import graph and only re-snapshots stories affected by the diff. On a large design system (hundreds of components), this is the difference between a 2-minute CI step and a 20-minute one. Also directly controls Chromatic snapshot costs, which are billed per snapshot.

---

## What to evaluate before recommending this stack to a team

**How many components do you have?** Storybook's value scales with component count. For fewer than ~20 components, the setup overhead may not be worth it. For a team shipping a shared component library used across multiple products, it's clearly worth it.

**Who writes and maintains stories?** Stories require ongoing maintenance — when a component's API changes, its stories need updating. If only one engineer owns this, it becomes a bottleneck. The team needs to treat stories as first-class deliverables, not optional extras.

**Chromatic costs at scale.** Chromatic is billed per snapshot per month. 22 stories × every PR = costs grow with team size and PR frequency. TurboSnap mitigates this significantly, but budget for it. Run the numbers before committing.

**Do you have a designer in the review loop?** Chromatic's UI Review is most valuable when a designer or design-system owner is an assigned reviewer. If only engineers review visual diffs, you're not getting the full benefit — you're paying for a tool that a QA engineer could approximate with screenshots.

**Are your components actually isolated?** Storybook works best with components that have well-defined props and minimal side effects. Components tightly coupled to routing, authentication, or complex global state are harder to story and produce less reliable snapshots. If your codebase has a lot of these, refactoring to make them storyable has compounding benefits — but it's work.

**pnpm version.** If your team is on pnpm 9+, budget 30 minutes to understand the `allowBuilds` / `onlyBuiltDependencies` security model before your first Storybook setup. It's a one-time investment but it will bite you on every new machine.
