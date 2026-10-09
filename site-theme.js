const themeColorVariables = [
  ["primary", "--forest"],
  ["secondary", "--topline-bg"],
  ["accent", "--coral"],
  ["highlight", "--lime"],
  ["body", "--paper"],
  ["body_text", "--ink"],
  ["muted", "--muted"],
  ["border", "--line"],
];
const themeStorageKey = "strada-site-theme";

window.applySiteTheme = function (theme) {
  if (!theme || typeof theme !== "object" || Array.isArray(theme)) return;

  const savedTheme = {};
  themeColorVariables.forEach(([key, variable]) => {
    const value = theme[key];
    if (typeof value === "string" && /^#[\da-f]{6}$/i.test(value.trim())) {
      savedTheme[key] = value.trim();
      document.documentElement.style.setProperty(variable, savedTheme[key]);
    } else {
      document.documentElement.style.removeProperty(variable);
    }
  });

  try {
    localStorage.setItem(themeStorageKey, JSON.stringify(savedTheme));
  } catch {}
};

try {
  const cachedTheme = localStorage.getItem(themeStorageKey);
  if (cachedTheme) window.applySiteTheme(JSON.parse(cachedTheme));
} catch {}