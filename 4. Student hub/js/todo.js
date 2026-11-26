let tasks = HubStore.get("tasks");
const tl = document.querySelector("#task-list");
function render() {
  tasks.sort((a, b) => a.done - b.done);
  tl.innerHTML = tasks.length
    ? tasks
        .map(
          (t, i) =>
            `<li><input type="checkbox" data-toggle="${i}" ${t.done ? "checked" : ""}><span class="grow ${t.done ? "done" : ""}"><b>${t.name}</b><span class="meta">${t.category || "General"} · ${t.date || "No due date"} · ${t.priority}</span></span><button class="small-button" data-edit="${i}">Edit</button><button class="small-button delete" data-delete="${i}">Delete</button></li>`,
        )
        .join("")
    : '<li class="empty empty-state-row"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 4h14v17H5zM9 2v4m6-4v4M8 11h8m-8 4h5"/></svg><span><b>Your task list is clear</b><small>Add a task to give your day a starting point.</small></span><a href="#task-name">Add a task</a></li>';
  HubStore.set("tasks", tasks);
}
render();
document.querySelector("#task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  tasks.push({
    name: taskName.value.trim(),
    date: taskDate.value,
    priority: taskPriority.value,
    category: taskCategory.value.trim(),
    done: false,
  });
  e.target.reset();
  render();
  toast("Task added.");
});
const taskName = document.querySelector("#task-name"),
  taskDate = document.querySelector("#task-date"),
  taskPriority = document.querySelector("#task-priority"),
  taskCategory = document.querySelector("#task-category");
tl.addEventListener("click", (e) => {
  const i = e.target.dataset.delete ?? e.target.dataset.edit;
  if (e.target.dataset.delete !== undefined) {
    tasks.splice(+i, 1);
    render();
    toast("Task deleted.");
  }
  if (e.target.dataset.edit !== undefined) {
    const t = tasks[+i],
      n = prompt("Edit task", t.name);
    if (n?.trim()) {
      t.name = n.trim();
      render();
      toast("Task updated.");
    }
  }
});
tl.addEventListener("change", (e) => {
  if (e.target.dataset.toggle !== undefined) {
    tasks[+e.target.dataset.toggle].done = e.target.checked;
    render();
  }
});
