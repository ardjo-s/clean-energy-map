# Pull request workflow

Use this workflow only for commit, push, or pull-request delivery.

## Scope and branch

- Start from a recently fetched intended base. Use `origin/main` unless the
  work is intentionally stacked on another pull request.
- One tracker item, one independently reviewable outcome, one branch, one PR.
- Name branches `<agent>/<type>/<tracker>-<slug>`; for example,
  `codex/fix/12-agent-delivery-guide`.
- Prefer a PR reviewable in ten minutes: at most 300 human-written lines and
  five files. Split first; explain a necessary exception in `Risk`.
- Keep tests with behavior. Do not mix unrelated refactors, formatting,
  dependencies, or documentation churn.

## Commits and updates

- Retain one to three atomic commits. Each has one purpose and passes its
  narrowest relevant check.
- Use `git commit --fixup` while iterating. Before first review, fetch,
  autosquash, rebase onto the intended base, verify, then push.
- After a non-trivial rebase, inspect `git range-diff` for semantic drift.
- Never use `git push --force`. Use `--force-with-lease` only after an
  authorized rebase.
- During active review, do not rebase or force-push unless a conflict requires
  it or a reviewer requests it. Say why when updating the PR.

## Pull request

Use English. The body must contain:

```md
## Why
## Change
## Proof
## Risk
## Tracker
## Stack
```

- `Proof` lists checks actually run and their result.
- `Tracker` names the Linear or GitHub issue, or says `Not used`.
- `Stack` is `None` unless the PR depends on another PR; then name its
  repository, number, and base branch.
- Default to squash merge. Use rebase merge only when every retained commit is
  independently useful and green. Merge stacks from the bottom upward.
