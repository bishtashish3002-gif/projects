(() => {
  const isLogin = location.pathname.toLowerCase().endsWith("login.html"),
    user = HubStore.get("user", null),
    token = localStorage.getItem("studentHub.token");
  if ((!user || !token) && !isLogin) {
    location.href = location.pathname.includes("/pages/")
      ? "../login.html"
      : "login.html";
    return;
  }
  const s = HubStore.get("settings", {}),
    dark =
      s.theme === "dark" ||
      (s.theme === "system" &&
        matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) document.body.classList.add("dark");
  const toggle = document.querySelector(".theme-toggle");
  toggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const x = HubStore.get("settings", {});
    x.theme = document.body.classList.contains("dark") ? "dark" : "light";
    HubStore.set("settings", x);
  });
  const sidebar = document.querySelector("#tool-sidebar"),
    sidebarToggle = document.querySelector("[data-sidebar-toggle]"),
    sidebarScrim = document.querySelector("[data-sidebar-scrim]");
  if (sidebar) sidebar.inert = true;
  function setSidebarOpen(open) {
    document.body.classList.toggle("sidebar-open", open);
    sidebar?.setAttribute("aria-hidden", String(!open));
    if (sidebar) sidebar.inert = !open;
    sidebarToggle?.setAttribute("aria-expanded", String(open));
    if (open) document.querySelector("[data-sidebar-close]")?.focus();
    else sidebarToggle?.focus();
  }
  sidebarToggle?.addEventListener("click", () => setSidebarOpen(!document.body.classList.contains("sidebar-open")));
  sidebarScrim?.addEventListener("click", () => setSidebarOpen(false));
  document.querySelector("[data-sidebar-close]")?.addEventListener("click", () => setSidebarOpen(false));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") setSidebarOpen(false); });
  document
    .querySelectorAll("[data-user-name]")
    .forEach((el) => (el.textContent = user?.name || "Student"));
  window.updateHubHeader = (profile = {}) => {
    const name = profile.name || user?.name || "Student";
    document.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = name));
    const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "S";
    document.querySelectorAll("[data-profile-initials]").forEach((el) => (el.textContent = initials));
    const photoData = profile.photoData || HubStore.get("profile", {})?.photoData || "";
    document.querySelectorAll("[data-profile-photo]").forEach((img) => {
      if (photoData) { img.src = photoData; img.hidden = false; }
      else { img.removeAttribute("src"); img.hidden = true; }
    });
    document.querySelectorAll("[data-profile-initials]").forEach((el) => (el.hidden = Boolean(photoData)));
  };
  window.updateHubHeader(HubStore.get("profile", {}));
  HubStore.api("/profile")
    .then(({ profile }) => {
      HubStore.set("profile", profile);
      window.updateHubHeader(profile);
    })
    .catch(() => {});
  document.querySelectorAll("[data-logout]").forEach((btn) =>
    btn.addEventListener("click", () => {
      HubStore.remove("user");
      localStorage.removeItem("studentHub.token");
      location.href = location.pathname.includes("/pages/")
        ? "../login.html"
        : "login.html";
    }),
  );
  window.toast = (m) => {
    const t = document.querySelector("#toast");
    if (!t) return;
    t.textContent = m;
    t.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
  };
  const h = new Date().getHours(),
    g = document.querySelector("#greeting");
  if (g)
    g.textContent = `Good ${h < 12 ? "morning" : h < 18 ? "afternoon" : "evening"}, ${user?.name || "student"}`;
  const tasks = HubStore.get("tasks"),
    sessions = HubStore.get("pomodoro", 0),
    exams = HubStore.get("exams"),
    expenses = HubStore.get("expenses");
  document.querySelector("#session-count") &&
    (document.querySelector("#session-count").textContent = sessions);
  const completedTasks = tasks.filter((t) => t.done).length,
    taskPercent = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  document.querySelector("#task-count") &&
    (document.querySelector("#task-count").textContent =
      `${completedTasks} / ${tasks.length}`);
  const taskProgressLabel = document.querySelector("#task-progress-label"),
    taskProgressBar = document.querySelector("#task-progress-bar");
  if (taskProgressLabel) taskProgressLabel.textContent = `${completedTasks} of ${tasks.length}`;
  if (taskProgressBar) {
    taskProgressBar.setAttribute("aria-valuenow", taskPercent);
    taskProgressBar.querySelector("span").style.width = `${taskPercent}%`;
  }
  const sessionTotal = Math.max(0, Number(sessions) || 0),
    sessionPercent = Math.min(sessionTotal, 5) * 20,
    sessionProgressLabel = document.querySelector("#session-progress-label"),
    sessionProgressBar = document.querySelector("#session-progress-bar");
  if (sessionProgressLabel)
    sessionProgressLabel.textContent = `${Math.min(sessionTotal, 5)} of 5${sessionTotal >= 5 ? " complete" : ""}`;
  if (sessionProgressBar) {
    sessionProgressBar.setAttribute("aria-valuenow", sessionPercent);
    sessionProgressBar.querySelector("span").style.width = `${sessionPercent}%`;
  }
  const ul = document.querySelector("#dashboard-tasks");
  if (ul && tasks.length)
    ul.innerHTML = tasks
      .slice(0, 4)
      .map(
        (t) =>
          `<li class="${t.done ? "done" : ""}"><span class="task-check" aria-hidden="true"></span>${t.name}</li>`,
      )
      .join("");
  const agenda = document.querySelector("#week-agenda");
  if (agenda) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const dueTasks = tasks
        .filter((task) => !task.done && task.date)
        .map((task) => ({
          name: task.name,
          date: new Date(`${task.date}T00:00:00`),
          type: "Task",
        }))
        .filter((item) => item.date >= today && item.date < weekEnd),
      comingExams = exams
        .map((exam) => ({ name: exam.name, date: new Date(exam.date), type: "Exam" }))
        .filter((item) => item.date >= today && item.date < weekEnd),
      weekItems = [...dueTasks, ...comingExams]
        .sort((a, b) => a.date - b.date)
        .slice(0, 5),
      taskCount = document.querySelector("#week-task-count"),
      examCount = document.querySelector("#week-exam-count"),
      weekRange = document.querySelector("#week-range");
    if (taskCount) taskCount.textContent = dueTasks.length;
    if (examCount) examCount.textContent = comingExams.length;
    if (weekRange) {
      const endLabel = new Date(weekEnd);
      endLabel.setDate(endLabel.getDate() - 1);
      weekRange.textContent = `${today.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${endLabel.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    }
    agenda.replaceChildren();
    if (!weekItems.length) {
      const empty = document.createElement("li");
      empty.className = "empty agenda-empty";
      empty.textContent = "Your week is clear. Add a task due date or an exam to plan ahead.";
      agenda.append(empty);
    } else {
      weekItems.forEach((item) => {
        const row = document.createElement("li"),
          dateLabel = document.createElement("span"),
          details = document.createElement("span"),
          name = document.createElement("strong"),
          type = document.createElement("small");
        row.className = `agenda-item agenda-${item.type.toLowerCase()}`;
        dateLabel.className = "agenda-date";
        dateLabel.textContent = item.date.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        details.className = "agenda-details";
        name.textContent = item.name;
        type.textContent = item.type;
        details.append(name, type);
        row.append(dateLabel, details);
        agenda.append(row);
      });
    }
  }
  const upcoming = exams
    .filter((e) => new Date(e.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  if (upcoming) {
    const days = Math.ceil((new Date(upcoming.date) - new Date()) / 864e5);
    document.querySelector("#next-exam").textContent = `${days} days`;
    document.querySelector("#exam-label").textContent = upcoming.name;
  }
  const month = new Date().toISOString().slice(0, 7),
    spent = expenses
      .filter((e) => e.type === "expense" && e.date?.startsWith(month))
      .reduce((a, e) => a + Number(e.amount), 0);
  document.querySelector("#month-spend") &&
    (document.querySelector("#month-spend").textContent =
      `₹${spent.toLocaleString("en-IN")}`);
})();
