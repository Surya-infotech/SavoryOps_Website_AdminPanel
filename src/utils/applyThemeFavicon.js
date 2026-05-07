function removeFaviconLinks() {
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((el) => el.remove());
}

function setFaviconLink(href) {
    if (!href) {
        removeFaviconLinks();
        return;
    }
    removeFaviconLinks();
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = href;
    const lower = href.split("?")[0].toLowerCase();
    if (lower.endsWith(".ico")) link.type = "image/x-icon";
    else if (lower.endsWith(".svg")) link.type = "image/svg+xml";
    else link.type = "image/png";
    document.head.appendChild(link);
}

/**
 * Sets the tab icon from the theme API. Falls back to the default favicon
 * (defined in index.html) when no URL is returned.
 */
export async function applyThemeFavicon() {
    const backend = import.meta.env.VITE_BACKEND_URL;

    if (!backend) {
        return;
    }

    try {
        const response = await fetch(`${backend}/System/GetGeneralSetting_landingpage`, {
            method: "GET",
            headers: { "Content-Type": "application/json", "x-user": "admin" },
        });
        const data = await response.json();
        const faviconUrl = data?.themeSetting?.faviconurl;
        if (response.ok && faviconUrl) {
            setFaviconLink(faviconUrl);
        }
    } catch {
        // keep existing favicon
    }
}
