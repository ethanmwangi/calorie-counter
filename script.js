/* ========= DOM ========= */
const form         = document.getElementById('food-form');
const foodInput    = document.getElementById('food-input');
const calInput     = document.getElementById('cal-input');
const mealSelect   = document.getElementById('meal-select');
const tableBody    = document.getElementById('food-table-body');
const totalCell    = document.getElementById('total-cell');
const filterSelect = document.getElementById('filter-select');
const resetBtn     = document.getElementById('reset-btn');
const themeToggle  = document.getElementById('theme-toggle');
const chartCanvas  = document.getElementById('cal-chart');

let chart;

/* ========= State ========= */
let foods = JSON.parse(localStorage.getItem('foods')) || [];
renderAll();

/* ========= Events ========= */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name  = foodInput.value.trim();
  const meal  = mealSelect.value;
  let calories = parseInt(calInput.value);

  if (!calories) calories = await fetchCalories(name);

  foods.push({ id: Date.now(), name, calories, meal });
  saveAndRender();
  form.reset();
});

tableBody.addEventListener('click', (e) => {
  if (e.target.dataset.id) {
    foods = foods.filter(f => f.id !== Number(e.target.dataset.id));
    saveAndRender();
  }
});

filterSelect.addEventListener('change', renderAll);

resetBtn.addEventListener('click', () => {
  if (confirm('Start a new day?')) {
    foods = [];
    saveAndRender();
  }
});

themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', themeToggle.checked ? 'dark' : 'light');
});

/* ========= Theme init ========= */
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeToggle.checked = true;
}

/* ========= Functions ========= */
function saveAndRender() {
  localStorage.setItem('foods', JSON.stringify(foods));
  renderAll();
}

function renderAll() {
  const filter = filterSelect.value;
  const visible = filter === 'All' ? foods : foods.filter(f => f.meal === filter);

  // --- Table ---
  tableBody.innerHTML = '';
  let total = 0;

  visible.forEach(({ id, name, meal, calories }) => {
    total += calories;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${name}</td>
      <td>${meal}</td>
      <td>${calories}</td>
      <td><button class="delete-btn" data-id="${id}">✖</button></td>
    `;
    tableBody.appendChild(row);
  });
  totalCell.textContent = total;

  // --- Chart ---
  renderChart();
}

function renderChart() {
  const mealTotals = foods.reduce((acc, { meal, calories }) => {
    acc[meal] = (acc[meal] || 0) + calories;
    return acc;
  }, {});

  const labels = Object.keys(mealTotals);
  const data   = Object.values(mealTotals);

  if (chart) chart.destroy();
  chart = new Chart(chartCanvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data }] },
    options: { plugins: { legend: { position: 'bottom' } } }
  });
}

// Fake API: random 50‑300 kcal
async function fetchCalories(food) {
  await new Promise(r => setTimeout(r, 300));
  return Math.floor(Math.random() * 250) + 50;
}
