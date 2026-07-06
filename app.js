const storageKey = "daily-dashboard-v1";
const todayKey = new Date().toISOString().slice(0, 10);

const todayLabel = document.querySelector("#today-label");
const completionRate = document.querySelector("#completion-rate");
const taskCount = document.querySelector("#task-count");
const habitCount = document.querySelector("#habit-count");
const waterCount = document.querySelector("#water-count");
const balanceCount = document.querySelector("#balance-count");
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const clearDone = document.querySelector("#clear-done");
const habitList = document.querySelector("#habit-list");
const addHabit = document.querySelector("#add-habit");
const resetWater = document.querySelector("#reset-water");
const waterRing = document.querySelector("#water-ring");
const waterNumber = document.querySelector("#water-number");
const waterMinus = document.querySelector("#water-minus");
const waterPlus = document.querySelector("#water-plus");
const financeForm = document.querySelector("#finance-form");
const financeType = document.querySelector("#finance-type");
const financeName = document.querySelector("#finance-name");
const financeAmount = document.querySelector("#finance-amount");
const financeTotal = document.querySelector("#finance-total");
const financeList = document.querySelector("#finance-list");
const dailyNote = document.querySelector("#daily-note");
const saveStatus = document.querySelector("#save-status");
const copyNote = document.querySelector("#copy-note");

const defaultHabits = ["运动", "阅读", "早睡", "整理房间"];

let state = loadState();

function createDay() {
  return {
    tasks: [],
    habits: defaultHabits.map((name) => ({ id: crypto.randomUUID(), name, done: false })),
    water: 0,
    finances: [],
    note: "",
  };
}

function loadState() {
  const fallback = { currentDate: todayKey, days: { [todayKey]: createDay() } };

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved || typeof saved !== "object") return fallback;
    if (!saved.days) saved.days = {};
    if (!saved.days[todayKey]) saved.days[todayKey] = createDay();
    saved.currentDate = todayKey;
    return saved;
  } catch {
    return fallback;
  }
}

function day() {
  return state.days[todayKey];
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify(state));
  saveStatus.textContent = "已自动保存";
}

function formatMoney(value) {
  const sign = value < 0 ? "-" : "";
  return `${sign}¥${Math.abs(value).toFixed(2)}`;
}

function parseAmount(value) {
  return Number(value.replace(",", ".").trim());
}

function setEmpty(list, text) {
  const item = document.createElement("li");
  item.className = "empty";
  item.textContent = text;
  list.appendChild(item);
}

function renderTasks() {
  const tasks = day().tasks;
  taskList.innerHTML = "";

  if (!tasks.length) {
    setEmpty(taskList, "今天还没有待办");
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `item ${task.done ? "done" : ""}`;

    const check = document.createElement("button");
    check.className = "check";
    check.type = "button";
    check.title = "切换完成";
    check.addEventListener("click", () => toggleTask(task.id));

    const title = document.createElement("span");
    title.className = "item-title";
    title.textContent = task.title;

    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.title = "删除";
    remove.textContent = "x";
    remove.addEventListener("click", () => removeTask(task.id));

    item.append(check, title, remove);
    taskList.appendChild(item);
  });
}

function renderHabits() {
  habitList.innerHTML = "";

  day().habits.forEach((habit) => {
    const card = document.createElement("div");
    card.className = `habit ${habit.done ? "is-done" : ""}`;

    const name = document.createElement("strong");
    name.textContent = habit.name;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = habit.done ? "已完成" : "打卡";
    button.addEventListener("click", () => toggleHabit(habit.id));

    card.append(name, button);
    habitList.appendChild(card);
  });
}

function renderWater() {
  const cups = day().water;
  const degrees = Math.min(cups, 8) / 8 * 360;
  waterNumber.textContent = cups;
  waterCount.textContent = `${cups} 杯`;
  waterRing.style.background = `conic-gradient(var(--blue) ${degrees}deg, #e5ecf0 ${degrees}deg)`;
}

function renderFinances() {
  const items = day().finances;
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  financeList.innerHTML = "";
  financeTotal.textContent = formatMoney(total);
  balanceCount.textContent = formatMoney(total);

  if (!items.length) {
    setEmpty(financeList, "今天还没有收支记录");
    return;
  }

  items.forEach((record) => {
    const item = document.createElement("li");
    item.className = "item";

    const marker = document.createElement("span");
    marker.className = `money ${record.amount >= 0 ? "income" : "expense"}`;
    marker.textContent = record.amount >= 0 ? "+" : "-";

    const title = document.createElement("span");
    title.className = "item-title";
    title.textContent = record.name;

    const amount = document.createElement("span");
    amount.className = `money ${record.amount >= 0 ? "income" : "expense"}`;
    amount.textContent = formatMoney(record.amount);

    item.append(marker, title, amount);
    financeList.appendChild(item);
  });
}

function renderSummary() {
  const tasks = day().tasks;
  const habits = day().habits;
  const doneTasks = tasks.filter((task) => task.done).length;
  const doneHabits = habits.filter((habit) => habit.done).length;
  const totalItems = tasks.length + habits.length;
  const doneItems = doneTasks + doneHabits;
  const rate = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

  taskCount.textContent = `${doneTasks}/${tasks.length}`;
  habitCount.textContent = `${doneHabits}/${habits.length}`;
  completionRate.textContent = `${rate}%`;
}

function render() {
  todayLabel.textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  dailyNote.value = day().note;
  renderTasks();
  renderHabits();
  renderWater();
  renderFinances();
  renderSummary();
}

function addTask(title) {
  day().tasks.unshift({ id: crypto.randomUUID(), title, done: false });
  save();
  render();
}

function toggleTask(id) {
  const task = day().tasks.find((item) => item.id === id);
  if (task) task.done = !task.done;
  save();
  render();
}

function removeTask(id) {
  day().tasks = day().tasks.filter((task) => task.id !== id);
  save();
  render();
}

function toggleHabit(id) {
  const habit = day().habits.find((item) => item.id === id);
  if (habit) habit.done = !habit.done;
  save();
  render();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  addTask(title);
  taskInput.value = "";
});

clearDone.addEventListener("click", () => {
  day().tasks = day().tasks.filter((task) => !task.done);
  save();
  render();
});

addHabit.addEventListener("click", () => {
  const name = prompt("添加一个习惯");
  if (!name || !name.trim()) return;
  day().habits.push({ id: crypto.randomUUID(), name: name.trim(), done: false });
  save();
  render();
});

waterPlus.addEventListener("click", () => {
  day().water += 1;
  save();
  render();
});

waterMinus.addEventListener("click", () => {
  day().water = Math.max(0, day().water - 1);
  save();
  render();
});

resetWater.addEventListener("click", () => {
  day().water = 0;
  save();
  render();
});

financeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const amount = parseAmount(financeAmount.value);
  const name = financeName.value.trim() || (financeType.value === "income" ? "收入" : "支出");

  if (!Number.isFinite(amount) || amount <= 0) return;

  day().finances.unshift({
    id: crypto.randomUUID(),
    name,
    amount: financeType.value === "income" ? amount : -amount,
  });

  financeName.value = "";
  financeAmount.value = "";
  save();
  render();
});

dailyNote.addEventListener("input", () => {
  day().note = dailyNote.value;
  saveStatus.textContent = "保存中";
  save();
});

copyNote.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(dailyNote.value);
    saveStatus.textContent = "便签已复制";
  } catch {
    saveStatus.textContent = "复制失败";
  }
});

render();
