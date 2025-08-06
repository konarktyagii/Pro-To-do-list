const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const dueDateInput = document.getElementById('dueDateInput');
const themeToggle = document.getElementById('themeToggle');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  document.getElementById('totalTasks').textContent = `Total: ${total}`;
  document.getElementById('completedTasks').textContent = `✅ Completed: ${completed}`;
  document.getElementById('pendingTasks').textContent = `⌛ Pending: ${pending}`;
}

function renderTasks(filter = "") {
  taskList.innerHTML = "";
  tasks
    .filter(t => t.text.toLowerCase().includes(filter.toLowerCase()))
    .forEach((task, index) => {
      const li = document.createElement('li');
      li.className = task.completed ? 'completed' : '';

      const span = document.createElement('span');
      span.textContent = task.text;
      span.onclick = () => toggleTask(index);

      const meta = document.createElement('div');
      meta.className = 'meta';

      const badge = document.createElement('span');
      badge.className = `badge ${task.category}`;
      badge.textContent = task.category;

      const due = document.createElement('span');
      due.textContent = ` | Due: ${task.dueDate || 'N/A'}`;

      meta.appendChild(badge);
      meta.appendChild(due);

      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.className = 'delete';
      del.onclick = () => deleteTask(index);

      li.appendChild(span);
      li.appendChild(meta);
      li.appendChild(del);
      taskList.appendChild(li);
    });

  updateStats();
}

function addTask() {
  const text = taskInput.value.trim();
  const category = categorySelect.value;
  const dueDate = dueDateInput.value;

  if (!text) return;

  tasks.push({
    text,
    completed: false,
    category,
    dueDate,
    notified: false
  });

  taskInput.value = '';
  dueDateInput.value = '';
  saveTasks();
  renderTasks(searchInput.value);
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks(searchInput.value);

  if (tasks[index].completed) {
    triggerConfetti();
  }
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks(searchInput.value);
}

function triggerConfetti() {
  confetti({
    particleCount: 120,
    spread: 60,
    origin: { y: 0.6 }
  });
}

addBtn.addEventListener('click', addTask);
searchInput.addEventListener('input', e => renderTasks(e.target.value));
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

function notifyTasks() {
  if (Notification.permission !== "granted") return;

  const now = new Date();
  tasks.forEach((task, i) => {
    if (task.dueDate && !task.notified && !task.completed) {
      const due = new Date(task.dueDate);
      const diff = (due - now) / 1000; // in seconds
      if (diff <= 3600 && diff > 0) {
        new Notification("⚠️ Task due soon!", {
          body: `‘${task.text}’ is due in less than 1 hour.`,
        });
        tasks[i].notified = true;
        saveTasks();
      }
    }
  });
}

// Ask for notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Check every 1 minute
setInterval(notifyTasks, 60000);

renderTasks();
