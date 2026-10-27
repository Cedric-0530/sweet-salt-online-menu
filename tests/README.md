# Menu regression checks

These tests exercise the real local page in a headless browser. They require Node.js and Playwright, but the menu itself still has no build step or runtime dependencies.

With Playwright and its Chromium browser available, run from the project directory:

```sh
node --test tests/menu.test.cjs
```

Alternatively, set `CHROME_PATH` to an installed Chrome executable. If Playwright is supplied by a bundled runtime instead of a local installation, set `NODE_PATH` to that runtime's `node_modules` directory.

Coverage includes normalized and multiword search, drink aliases, clear-search recovery, category scroll positioning, hidden empty groups, meal-upgrade navigation, Chef's Choice, zero results, keyboard carousel controls, and overflow at six responsive widths.
