const apiBaseUrl = "http://localhost:3000/api";
const syncedKeys = new Set([
  "tasks", "expenses", "exams", "attendance", "cgpa", "pomodoro", "settings",
]);

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("studentHub.token");
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || "Unable to connect to the server.");
  return body;
}

window.HubStore = {
  get(k, f = []) {
    try {
      return JSON.parse(localStorage.getItem(`studentHub.${k}`)) ?? f;
    } catch {
      return f;
    }
  },
  set(k, v) {
    localStorage.setItem(`studentHub.${k}`, JSON.stringify(v));
    if (syncedKeys.has(k) && localStorage.getItem("studentHub.token"))
      apiRequest(`/data/${k}`, {
        method: "PUT",
        body: JSON.stringify({ data: v }),
      }).catch(() => {});
  },
  remove(k) {
    localStorage.removeItem(`studentHub.${k}`);
    if (syncedKeys.has(k) && localStorage.getItem("studentHub.token"))
      apiRequest(`/data/${k}`, { method: "DELETE" }).catch(() => {});
  },
  api: apiRequest,
  async loadServerData() {
    const response = await apiRequest("/data");
    Object.entries(response.data).forEach(([key, value]) =>
      localStorage.setItem(`studentHub.${key}`, JSON.stringify(value)),
    );
  },
  clearCachedStudyData() {
    syncedKeys.forEach((key) => localStorage.removeItem(`studentHub.${key}`));
  },
};
