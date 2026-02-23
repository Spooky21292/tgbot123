const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.ready();
}

const hello = document.getElementById('hello');
const user = tg?.initDataUnsafe?.user;
hello.textContent = user ? `Привет, ${user.first_name}!` : 'Привет!';

const form = document.getElementById('task-form');
const list = document.getElementById('list');
const KEY = 'studyping-mini-local-tasks';

function load() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function render() {
  const items = load();
  list.innerHTML = '';
  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${item.subject}: ${item.text}`;
    list.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const subject = document.getElementById('subject').value.trim();
  const text = document.getElementById('text').value.trim();
  if (!subject || !text) return;

  const items = load();
  items.push({ subject, text });
  save(items);
  form.reset();
  render();

  if (tg) {
    tg.HapticFeedback?.notificationOccurred('success');
  }
});

render();
