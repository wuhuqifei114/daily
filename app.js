const storageKey = "daily-dashboard-v1";
// ===== Toast 通知系统 =====
function showToast(message, type) {
  var container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  var toast = document.createElement("div");
  toast.className = "toast toast-" + type;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(function () { toast.classList.add("show"); });
  setTimeout(function () {
    toast.classList.remove("show");
    setTimeout(function () { toast.remove(); }, 300);
  }, 3000);
}

// ===== 鼓励语逻辑 =====
var shownEncourage = {
  task50: false, task80: false, task100: false,
  habitsAll: false, water8: false, perfect: false,
};

function checkEncouragement() {
  var d = day();
  var td = d.tasks.filter(function (t) { return t.done; }).length;
  var tt = d.tasks.length;
  var hd = d.habits.filter(function (h) { return h.done; }).length;
  var ht = d.habits.length;
  if (tt > 0) {
    var r = td / tt;
    if (r === 1 && !shownEncourage.task100) {
      showToast("\U0001f389 太棒了！所有任务全部完成！", "celebration");
      shownEncourage.task100 = true;
    } else if (r >= 0.8 && !shownEncourage.task80 && td > 0) {
      showToast("\U0001f44f 任务完成 80%，继续冲刺！", "success");
      shownEncourage.task80 = true;
    } else if (r >= 0.5 && !shownEncourage.task50 && td > 0) {
      showToast("\U0001f4aa 完成一半了，继续保持！", "success");
      shownEncourage.task50 = true;
    }
  }
  if (ht > 0 && hd === ht && !shownEncourage.habitsAll) {
    showToast("\U0001f31f 今日习惯全部打卡成功！", "celebration");
    shownEncourage.habitsAll = true;
  }
  if (d.water >= 8 && !shownEncourage.water8) {
    showToast("\U0001f4a7 饮水量达标！每天 8 杯水，健康好身体 \U0001f4aa", "success");
    shownEncourage.water8 = true;
  }
  if (td === tt && hd === ht && d.water >= 8 && tt > 0 && ht > 0 && !shownEncourage.perfect) {
    showToast("\U0001f3c6 完美的一天！任务、习惯、饮水全部达标！", "celebration");
    shownEncourage.perfect = true;
  }
}

// ===== 板块保存交互 =====
function saveSection(btn) {
  btn.classList.add("saving");
  save();
  var pn = (btn.closest(".panel").querySelector("h2") || {}).textContent || "\U6570\U636e";
  showToast(pn + " \U5df2\U4fdd\U5b58 \U2714", "info");
  setTimeout(function () { btn.classList.remove("saving"); }, 800);
}

// ===== 鼓励语持久化 =====
function loadShownEncourage() {
  try {
    var saved = JSON.parse(localStorage.getItem("daily-encourage-" + todayKey));
    if (saved) Object.assign(shownEncourage, saved);
  } catch (e) {}
}
function saveShownEncourage() {
  localStorage.setItem("daily-encourage-" + todayKey, JSON.stringify(shownEncourage));
}
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
const exportData = document.querySelector("#export-data");
const importData = document.querySelector("#import-data");
const importFile = document.querySelector("#import-file");
const resetToday = document.querySelector("#reset-today");
const historyDate = document.querySelector("#history-date");
const historySummary = document.querySelector("#history-summary");
const historyTasks = document.querySelector("#history-tasks");
const historyHabits = document.querySelector("#history-habits");
const historyFinances = document.querySelector("#history-finances");
const historyNote = document.querySelector("#history-note");

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
  saveShownEncourage();
  const time = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
  saveStatus.textContent = `已自动保存到本机浏览器 ${time}`;
  showToast("数据已自动保存 ✅", "info");
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

function getSortedDates() {
  return Object.keys(state.days).sort((a, b) => b.localeCompare(a));
}

function formatDateLabel(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  const label = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
  return dateKey === todayKey ? `${label}（今天）` : label;
}

function appendMiniItem(list, text, done = false) {
  const item = document.createElement("li");
  item.textContent = text;
  item.classList.toggle("is-done", done);
  list.appendChild(item);
}

function setText(element, text) {
  if (element) element.textContent = text;
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
  setText(waterCount, `${cups} 杯`);
  waterRing.style.background = `conic-gradient(var(--blue) ${degrees}deg, #e5ecf0 ${degrees}deg)`;
}

function renderFinances() {
  const items = day().finances;
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  financeList.innerHTML = "";
  financeTotal.textContent = formatMoney(total);
  setText(balanceCount, formatMoney(total));

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

  setText(taskCount, `${doneTasks}/${tasks.length}`);
  setText(habitCount, `${doneHabits}/${habits.length}`);
  setText(completionRate, `${rate}%`);
}

function renderHistorySelector() {
  const selected = historyDate.value || todayKey;
  const dates = getSortedDates();
  historyDate.innerHTML = "";

  dates.forEach((dateKey) => {
    const option = document.createElement("option");
    option.value = dateKey;
    option.textContent = formatDateLabel(dateKey);
    historyDate.appendChild(option);
  });

  historyDate.value = dates.includes(selected) ? selected : dates[0];
}

function renderHistory() {
  renderHistorySelector();

  const selectedDay = state.days[historyDate.value] || createDay();
  const doneTasks = selectedDay.tasks.filter((task) => task.done).length;
  const doneHabits = selectedDay.habits.filter((habit) => habit.done).length;
  const balance = selectedDay.finances.reduce((sum, item) => sum + item.amount, 0);

  historySummary.innerHTML = "";
  [
    ["待办", `${doneTasks}/${selectedDay.tasks.length}`],
    ["习惯", `${doneHabits}/${selectedDay.habits.length}`],
    ["喝水", `${selectedDay.water} 杯`],
    ["结余", formatMoney(balance)],
  ].forEach(([label, value]) => {
    const card = document.createElement("div");
    card.className = "history-stat";
    card.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    historySummary.appendChild(card);
  });

  historyTasks.innerHTML = "";
  historyHabits.innerHTML = "";
  historyFinances.innerHTML = "";

  if (selectedDay.tasks.length) {
    selectedDay.tasks.forEach((task) => appendMiniItem(historyTasks, task.title, task.done));
  } else {
    appendMiniItem(historyTasks, "没有待办");
  }

  if (selectedDay.habits.length) {
    selectedDay.habits.forEach((habit) => appendMiniItem(historyHabits, habit.name, habit.done));
  } else {
    appendMiniItem(historyHabits, "没有习惯");
  }

  if (selectedDay.finances.length) {
    selectedDay.finances.forEach((record) => {
      appendMiniItem(historyFinances, `${record.name}：${formatMoney(record.amount)}`);
    });
  } else {
    appendMiniItem(historyFinances, "没有收支");
  }

  historyNote.textContent = selectedDay.note.trim() || "没有便签";
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
  renderHistory();
  checkEncouragement();
}

function downloadBackup() {
  const payload = {
    app: "daily-dashboard",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `daily-dashboard-backup-${todayKey}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  saveStatus.textContent = "备份文件已导出";
}

function restoreBackup(file) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(reader.result);
      const nextState = parsed.data || parsed;
      if (!nextState.days || typeof nextState.days !== "object") {
        throw new Error("Invalid backup");
      }

      state = nextState;
      if (!state.days[todayKey]) state.days[todayKey] = createDay();
  // Reset encouragement flags
  Object.keys(shownEncourage).forEach(function (k) { shownEncourage[k] = false; });
      state.currentDate = todayKey;
      save();
      render();
      saveStatus.textContent = "备份已导入并保存";
    } catch {
      saveStatus.textContent = "导入失败：备份文件格式不正确";
    }
  });
  reader.readAsText(file);
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

exportData.addEventListener("click", downloadBackup);

importData.addEventListener("click", () => {
  importFile.click();
});

importFile.addEventListener("change", () => {
  const [file] = importFile.files;
  if (!file) return;
  restoreBackup(file);
  importFile.value = "";
});


// ===== 保存按钮事件绑定 =====
document.querySelectorAll(".save-btn").forEach(function (btn) {
  btn.addEventListener("click", function () { saveSection(btn); });
});

// ===== 初始化加载鼓励语状态 =====
loadShownEncourage();

resetToday.addEventListener("click", () => {
  const confirmed = confirm("确定清空今天的待办、习惯、喝水、收支和便签吗？");
  if (!confirmed) return;
  state.days[todayKey] = createDay();
  // Reset encouragement flags
  Object.keys(shownEncourage).forEach(function (k) { shownEncourage[k] = false; });
  save();
  render();
  saveStatus.textContent = "今日数据已清空";
});

historyDate.addEventListener("change", renderHistory);

render();
