let focus = true,
  running = false,
  interval;
const timer = document.querySelector("#timer"),
  mode = document.querySelector("#timer-mode"),
  start = document.querySelector("#timer-start"),
  focusInput = document.querySelector("#focus-minutes"),
  breakInput = document.querySelector("#break-minutes"),
  count = document.querySelector("#completed-sessions");
let settings = HubStore.get("settings", {});
focusInput.value = settings.focus || 25;
breakInput.value = settings.break || 5;
let remaining = +focusInput.value * 60;
count.textContent = HubStore.get("pomodoro", 0);
function draw() {
  timer.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
}
function save() {
  settings = HubStore.get("settings", {});
  settings.focus = +focusInput.value;
  settings.break = +breakInput.value;
  HubStore.set("settings", settings);
}
function reset() {
  clearInterval(interval);
  running = false;
  start.textContent = "Start";
  focus = true;
  remaining = +focusInput.value * 60;
  mode.textContent = "Focus session";
  draw();
}
draw();
start.addEventListener("click", () => {
  if (running) {
    clearInterval(interval);
    running = false;
    start.textContent = "Resume";
    return;
  }
  running = true;
  start.textContent = "Pause";
  interval = setInterval(() => {
    if (--remaining >= 0) return draw();
    if (focus) {
      const n = HubStore.get("pomodoro", 0) + 1;
      HubStore.set("pomodoro", n);
      count.textContent = n;
      toast("Focus session complete! Time for a break.");
    }
    focus = !focus;
    remaining = +(focus ? focusInput : breakInput).value * 60;
    mode.textContent = focus ? "Focus session" : "Break time";
    draw();
  }, 1000);
});
document.querySelector("#timer-reset").addEventListener("click", reset);
[focusInput, breakInput].forEach((x) =>
  x.addEventListener("change", () => {
    save();
    if (!running) reset();
  }),
);
