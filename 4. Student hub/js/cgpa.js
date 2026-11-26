let semesters = HubStore.get("cgpa");
const list = document.querySelector("#semester-list"),
  overall = document.querySelector("#overall-cgpa");
function render() {
  list.innerHTML = semesters.length
    ? semesters
        .map(
          (s, i) =>
            `<li><span class="grow"><b>${s.name}</b></span><b>${s.value.toFixed(2)}</b><button class="small-button delete" data-i="${i}">Delete</button></li>`,
        )
        .join("")
    : '<li class="empty empty-state-row"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg><span><b>No semesters saved</b><small>Add your first result to see your overall average.</small></span></li>';
  overall.textContent = semesters.length
    ? (semesters.reduce((a, s) => a + s.value, 0) / semesters.length).toFixed(2)
    : "—";
  HubStore.set("cgpa", semesters);
}
render();
document.querySelector("#cgpa-form").addEventListener("submit", (e) => {
  e.preventDefault();
  semesters.push({
    name: document.querySelector("#semester").value.trim(),
    value: +document.querySelector("#cgpa-value").value,
  });
  e.target.reset();
  render();
  toast("Semester saved.");
});
list.addEventListener("click", (e) => {
  if (e.target.dataset.i !== undefined) {
    semesters.splice(+e.target.dataset.i, 1);
    render();
    toast("Semester removed.");
  }
});
