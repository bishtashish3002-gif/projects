let exams = HubStore.get("exams");
const el = document.querySelector("#exam-list");
function render() {
  exams.sort((a, b) => new Date(a.date) - new Date(b.date));
  el.innerHTML = exams.length
    ? exams
        .map((x, i) => {
          const diff = new Date(x.date) - new Date(),
            label =
              diff < 0 ? "Completed" : `${Math.ceil(diff / 864e5)} days left`;
          return `<li><span class="grow"><b>${x.name}</b><span class="meta">${new Date(x.date).toLocaleString()}</span></span><span class="status">${label}</span><button class="small-button delete" data-i="${i}">Delete</button></li>`;
        })
        .join("")
    : '<li class="empty empty-state-row"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg><span><b>No exams on the calendar</b><small>Save an exam date to start your countdown.</small></span></li>';
  HubStore.set("exams", exams);
}
render();
document.querySelector("#exam-form").addEventListener("submit", (e) => {
  e.preventDefault();
  exams.push({
    name: document.querySelector("#exam-name").value.trim(),
    date: document.querySelector("#exam-date").value,
  });
  e.target.reset();
  render();
  toast("Exam saved.");
});
el.addEventListener("click", (e) => {
  if (e.target.dataset.i !== undefined) {
    exams.splice(+e.target.dataset.i, 1);
    render();
    toast("Exam deleted.");
  }
});
