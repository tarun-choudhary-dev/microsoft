# Microsoft Student Resources

An independent, student-created directory of useful Microsoft learning, cloud, developer, AI, data, startup, low-code, and community resources.

The site is maintained by Tarun Choudhary and is not an official Microsoft website or an endorsement by Microsoft.

## Community Influencer links

The resource list follows the eligible URL categories supplied for the Microsoft Student Ambassadors Community Influencer path:

- Developer Interests and Skills
- Startups Interests and Skills
- Copilot Interests and Skills
- Data Science Interests and Skills
- Low Code Interests and Skills
- General Skilling and Professional Interests

Microsoft Learn Plans are intentionally excluded. Preferred Visitors are a program engagement measure, not a raw click count; the hub is intended to help people discover genuinely useful resources and does not encourage spam or artificial activity.

## Update the Contributor ID

The Contributor ID is stored once as `config.contributorId` in [`links.json`](links.json). Change that single value when needed. `main.js` builds each referral URL at runtime, preserves legitimate query parameters, and replaces any existing `wt.mc_id` value instead of duplicating it.

## Run locally

Because the resource data is loaded with `fetch`, serve the directory through a local HTTP server instead of opening `index.html` directly. For example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Project structure

- `index.html` — page structure and accessible content
- `style.css` — responsive dark Microsoft-inspired styling
- `main.js` — resource rendering, search, validation, and referral URL handling
- `links.json` — Contributor ID, categories, and resource destinations
- `favicon.png` — site icon

The project is static HTML, CSS, and JavaScript with no framework, analytics, database, or backend.
