const STORAGE_KEY = "themeColors";

function applyCssThemeColors(primary, secondary) {
    const root = document.documentElement;
    if (primary) root.style.setProperty("--primary-color", primary);
    if (secondary) root.style.setProperty("--secondary-color", secondary);
}

export function applyCachedThemeColors() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        applyCssThemeColors(parsed?.primary, parsed?.secondary);
    } catch {
        // ignore cache errors
    }
}

export async function applyThemeColors() {
    const backend = import.meta.env.VITE_BACKEND_URL;
    if (!backend) return;

    try {
        const response = await fetch(`${backend}/System/GetGeneralSetting_landingpage`, {
            method: "GET",
            headers: { "Content-Type": "application/json", "x-user": "admin" },
        });
        const data = await response.json();
        const primary = data?.themeSetting?.primarycolor || data?.themeSetting?.primary_color;
        const secondary = data?.themeSetting?.secondarycolor || data?.themeSetting?.secondary_color;
        if (response.ok) {
            applyCssThemeColors(primary, secondary);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ primary, secondary }));
            } catch {
                // ignore storage errors
            }
        }
    } catch {
        // leave existing CSS variable defaults intact
    }
}
