let records = HubStore.get("expenses");
const rl = document.querySelector("#expense-list"),
  money = (n) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
  balanceEl = document.querySelector("#balance"),
  incomeEl = document.querySelector("#income"),
  spentEl = document.querySelector("#spent"),
  typeInput = document.querySelector("#record-type"),
  amountInput = document.querySelector("#record-amount"),
  categoryInput = document.querySelector("#record-category"),
  dateInput = document.querySelector("#record-date"),
  descriptionInput = document.querySelector("#record-description");
dateInput.value = new Date().toISOString().slice(0, 10);
function render() {
  const income = records
      .filter((r) => r.type === "income")
      .reduce((a, r) => a + +r.amount, 0),
    spent = records
      .filter((r) => r.type === "expense")
      .reduce((a, r) => a + +r.amount, 0);
  balanceEl.textContent = money(income - spent);
  incomeEl.textContent = money(income);
  spentEl.textContent = money(spent);
  rl.innerHTML = records.length
    ? records
        .slice()
        .reverse()
        .map((r, ri) => {
          const i = records.length - 1 - ri;
          return `<li><span class="grow"><b>${r.category}</b><span class="meta">${r.date}${r.description ? " · " + r.description : ""}</span></span><b class="${r.type === "expense" ? "danger" : ""}">${r.type === "expense" ? "-" : "+"}${money(+r.amount)}</b><button class="small-button delete" data-i="${i}">Delete</button></li>`;
        })
        .join("")
    : '<li class="empty empty-state-row"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18m-7 5h3"/></svg><span><b>Your ledger is empty</b><small>Add an income or expense to see your balance here.</small></span></li>';
  HubStore.set("expenses", records);
}
render();
document.querySelector("#expense-form").addEventListener("submit", (e) => {
  e.preventDefault();
  records.push({
    type: typeInput.value,
    amount: +amountInput.value,
    category: categoryInput.value.trim(),
    date: dateInput.value,
    description: descriptionInput.value.trim(),
  });
  e.target.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  render();
  toast("Record added.");
});
rl.addEventListener("click", (e) => {
  if (e.target.dataset.i !== undefined) {
    records.splice(+e.target.dataset.i, 1);
    render();
    toast("Record deleted.");
  }
});
