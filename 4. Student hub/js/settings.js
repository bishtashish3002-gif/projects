const sf = document.querySelector("#settings-form"),
  prefs = HubStore.get("settings", {});
const theme = document.querySelector("#setting-theme"),
  focus = document.querySelector("#setting-focus"),
  brk = document.querySelector("#setting-break"),
  currency = document.querySelector("#setting-currency");
theme.value = prefs.theme || "light";
focus.value = prefs.focus || 25;
brk.value = prefs.break || 5;
currency.value = prefs.currency || "₹";
sf.addEventListener("submit", (e) => {
  e.preventDefault();
  HubStore.set("settings", {
    theme: theme.value,
    focus: +focus.value,
    break: +brk.value,
    currency: currency.value || "₹",
  });
  document.body.classList.toggle(
    "dark",
    theme.value === "dark" ||
      (theme.value === "system" &&
        matchMedia("(prefers-color-scheme: dark)").matches),
  );
  toast("Settings saved.");
});
document.querySelector("#clear-data").addEventListener("click", () => {
  if (confirm("Clear every saved task, record, exam, and setting?")) {
    [
      "tasks",
      "expenses",
      "exams",
      "attendance",
      "cgpa",
      "pomodoro",
      "settings",
    ].forEach(HubStore.remove);
    toast("Saved data cleared.");
  }
});
