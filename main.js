const ICON_LABELS = Object.freeze({
    article: "NEWS",
    automation: "↻",
    blocks: "▦",
    calendar: "31",
    chart: "▥",
    cloud: "☁",
    code: "</>",
    community: "●●",
    data: "DB",
    learn: "▶",
    rocket: "↗",
    spark: "AI",
    student: "EDU",
    trophy: "★",
    web: "WWW"
});

const state = {
    categories: [],
    resources: [],
    contributorId: ""
};

function buildContributorUrl(resourceUrl, contributorId) {
    if (!/^studentamb_\d+$/.test(contributorId)) {
        throw new Error("Contributor ID must use the studentamb_###### format.");
    }

    const url = new URL(resourceUrl);

    if (url.protocol !== "https:") {
        throw new Error(`Resource URL must use HTTPS: ${resourceUrl}`);
    }

    for (const key of [...url.searchParams.keys()]) {
        if (key.toLowerCase() === "wt.mc_id") {
            url.searchParams.delete(key);
        }
    }

    url.searchParams.append("wt.mc_id", contributorId);
    return url.toString();
}

function validateHubData(data) {
    if (!data?.config?.contributorId || !Array.isArray(data.categories)) {
        throw new Error("links.json is missing its configuration or categories.");
    }

    const categoryIds = new Set();
    const resourceIds = new Set();

    for (const category of data.categories) {
        if (!category.id || !category.name || !Array.isArray(category.resources)) {
            throw new Error("A category in links.json is incomplete.");
        }

        if (categoryIds.has(category.id)) {
            throw new Error(`Duplicate category ID: ${category.id}`);
        }
        categoryIds.add(category.id);

        for (const resource of category.resources) {
            if (!resource.id || !resource.name || !resource.description || !resource.url) {
                throw new Error(`An item in ${category.name} is incomplete.`);
            }

            if (resourceIds.has(resource.id)) {
                throw new Error(`Duplicate resource ID: ${resource.id}`);
            }
            resourceIds.add(resource.id);

            buildContributorUrl(resource.url, data.config.contributorId);
        }
    }
}

function createResourceCard(resource, category) {
    const card = document.createElement("article");
    card.className = "resource-card";
    card.dataset.resourceId = resource.id;

    const icon = document.createElement("span");
    icon.className = "card-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = ICON_LABELS[resource.icon] || "MS";

    const heading = document.createElement("h4");
    heading.textContent = resource.name;

    const description = document.createElement("p");
    description.textContent = resource.description;

    const link = document.createElement("a");
    link.className = "btn-ms";
    link.href = buildContributorUrl(resource.url, state.contributorId);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open Resource";
    link.setAttribute("aria-label", `Open ${resource.name} in a new tab`);

    card.append(icon, heading, description, link);

    state.resources.push({
        categoryId: category.id,
        element: card,
        searchText: `${resource.name} ${resource.description} ${category.name} ${category.description}`.toLocaleLowerCase()
    });

    return card;
}

function createCategorySection(category) {
    const section = document.createElement("section");
    section.className = "resource-category";
    section.id = `category-${category.id}`;
    section.setAttribute("aria-labelledby", `category-${category.id}-title`);

    const header = document.createElement("div");
    header.className = "category-header";

    const heading = document.createElement("h3");
    heading.id = `category-${category.id}-title`;
    heading.textContent = category.name;

    const description = document.createElement("p");
    description.textContent = category.description;

    const grid = document.createElement("div");
    grid.className = "services-grid";

    category.resources.forEach(resource => {
        grid.append(createResourceCard(resource, category));
    });

    header.append(heading, description);
    section.append(header, grid);
    return section;
}

function updateSearchResults(query) {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const matchesByCategory = new Map();
    let visibleCount = 0;

    state.resources.forEach(resource => {
        const isMatch = !normalizedQuery || resource.searchText.includes(normalizedQuery);
        resource.element.hidden = !isMatch;

        if (isMatch) {
            visibleCount += 1;
            matchesByCategory.set(
                resource.categoryId,
                (matchesByCategory.get(resource.categoryId) || 0) + 1
            );
        }
    });

    state.categories.forEach(category => {
        const hasMatches = matchesByCategory.has(category.id);
        category.element.hidden = !hasMatches;

    });

    const total = state.resources.length;
    const summary = document.getElementById("result-summary");
    summary.textContent = normalizedQuery
        ? `Showing ${visibleCount} of ${total} resources`
        : `${total} resources in ${state.categories.length} categories`;

    document.getElementById("empty-state").hidden = visibleCount !== 0;
}

function renderLoadError(error) {
    console.error("Failed to load resources:", error);

    const categories = document.getElementById("categories");
    const message = document.createElement("div");
    message.className = "load-error";

    const heading = document.createElement("h2");
    heading.textContent = "Resources could not be loaded";

    const guidance = document.createElement("p");
    guidance.textContent = "Please refresh the page and try again.";

    message.append(heading, guidance);
    categories.replaceChildren(message);
    categories.setAttribute("aria-busy", "false");
    document.getElementById("result-summary").textContent = "Resources unavailable";
}

async function loadHub() {
    try {
        const response = await fetch("links.json");
        if (!response.ok) {
            throw new Error(`links.json returned ${response.status}`);
        }

        const data = await response.json();
        validateHubData(data);

        state.contributorId = data.config.contributorId;
        const container = document.getElementById("categories");
        const fragment = document.createDocumentFragment();

        data.categories.forEach(category => {
            const element = createCategorySection(category);
            state.categories.push({ id: category.id, element });
            fragment.append(element);
        });

        container.replaceChildren(fragment);
        container.setAttribute("aria-busy", "false");
        updateSearchResults("");

        document.getElementById("search").addEventListener("input", event => {
            updateSearchResults(event.target.value);
        });
    } catch (error) {
        renderLoadError(error);
    }
}

document.addEventListener("DOMContentLoaded", loadHub);
