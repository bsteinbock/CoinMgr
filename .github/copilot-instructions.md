# Coin Ledger workspace guidance

- The public collection catalog is `public/coin-catalog.json`; all published content is visible to visitors.
- Found counts are persisted in browser local storage and are not synchronized across devices.
- Preserve stable catalog item IDs so saved progress remains associated with the same entries.
- Keep GitHub Pages base-path handling in `vite.config.ts` aligned with the deployment workflow.
- Format supported files with Prettier using `npm run format`; validate formatting with `npm run format:check`.
- Validate changes with `npm run lint` and `npm run build`.
