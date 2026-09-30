# Coin Ledger

A static coin and coin-set tracker built with React, TypeScript, and Vite. It is designed for GitHub Pages: the catalog is a JSON file in the repository, and found counts are saved in the current browser.

## Run locally

```sh
npm install
npm run dev
```

Run `npm run lint` and `npm run build` to check the project and create the production site in `dist/`.

Prettier is configured as the workspace formatter and runs on save when the recommended VS Code extension is installed. Run `npm run format` to format supported files or `npm run format:check` to check formatting without changing files.

## Edit the catalog

Edit `public/coin-catalog.json`. Each collection has an `id`, `title`, optional `description`, and `items` array. Every item needs a unique, stable `id`, `date`, `mintMark` (`P`, `D`, `S`, or `N/A`), `needed` count, and starting `found` count.

```json
{
  "sets": [
    {
      "id": "wheat-pennies",
      "title": "Wheat Pennies",
      "items": [{ "id": "wheat-1909-p", "date": "1909", "mintMark": "P", "needed": 1, "found": 0 }]
    }
  ]
}
```

Keep item IDs unchanged when editing dates or counts so saved browser progress remains associated with the same coins. The sample catalog is a starting point, not a complete checklist.

## Progress and privacy

The site saves found counts in local storage in the current browser. They do not sync to another browser or device. Use **Export progress** to download a JSON backup. The catalog's `found` values are initial values; interactive updates are stored separately and take precedence in that browser.

GitHub Pages is static hosting and cannot write changes back to the repository. The catalog and built site are public, so do not put private collection information in this repository. A private, shared, or cross-device collection would need a backend or a private app rather than GitHub Pages alone.

## Publish with GitHub Pages

1. In the repository, open **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**. This one-time setup is required because the deployment workflow cannot enable Pages through its Actions token.
3. Push a commit to `main` to deploy automatically, or run **Deploy to GitHub Pages** from the **Actions** tab using **Run workflow**.
4. After the deployment succeeds, open `https://bsteinbock.github.io/CoinMgr/`.

The workflow in `.github/workflows/deploy.yml` builds and publishes the site. The Vite configuration reads the repository name from GitHub Actions so project-site assets work under the repository path. Change the workflow branch if your default branch is not `main`.
