<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use the shared SiteHeader for public content pages so navigation stays consistent and collapses on small screens.
- Keep pyrolysis education in dedicated FAQ and safety routes; reuse Comparison for the interactive trade-off cards.
- Share the booking slot mapping in a tested browser-safe helper so every booking type reserves its selected slot.
- Keep the photo-derived plant viewer lazy-loaded behind ClientOnly, with its scene in components/plant; browser-only 3D must not enter SSR and descriptive labels must not imply unconfirmed process functions.
- Keep plant specs in a shared browser-safe module used by both the home Plant section and the SSR brochure route, so the two never disagree; the brochure diagram is plain SVG so it renders and prints without WebGL.
- GitHub Pages sets import.meta.env.GITHUB_PAGES and renders a fragment shell without html/body or Start scripts because its static document already mounts React inside #root; nesting document elements breaks React event ancestry and freezes inputs.
- GitHub Pages aliases service modules to a public HTTP client; hosted TanStack services retain price fetching, AI secrets and booking validation on the server because static hosting cannot execute them.
- Keep request validation schemas in browser-safe modules separate from aliased server-function modules so GitHub Pages and hosted handlers resolve the same validation rules.
- Public booking reads and RPC calls use a request-local publishable client; shared UAE pricing uses nullable quote-only amounts, normalized in hosted services and Pages so stale estimates cannot reappear.
- Keep published UAE diesel rate, validity dates and source in shared browser-safe data used by pricing and the daily snapshot job; mark expired rates as last published rather than claiming a new current rate.
- Keep third-party UAE web listings in shared browser-safe data separate from comparable bulk rates; pack sizes and incomplete cylinder terms must never become calculator prices.
- Keep .env (publishable backend values only) tracked in git and no index.html at the project root: published builds come from git, so an ignored .env leaves the browser without backend config, and a root index.html makes hosting serve a raw Vite document; the Pages build uses src/github-pages.tsx as its entry instead.
