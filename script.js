// === DOM References ===
const form = document.getElementById('food-form');
const foodInput = document.getElementById('food-name');
const calInput = document.getElementById('food-calories');
const mealSelect = document.getElementById('meal-type');
const tableBody = document.getElementById('food-table-body');
const totalCell = document.getElementById('total-calories');
const resetBtn = document.getElementById('reset-btn');
const filterSelect = document.getElementById('filter-meal');
const themeToggle = document.getElementById('theme-toggle');
const chartCanvas = document.getElementById('calorie-chart');

let foods = JSON.parse(localStorage.getItem('foods')) || [];
let chart = null;

// === Initial Render ===
renderAll();

// === Event Listeners ===
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = foodInput.value.trim();
  const meal = mealSelect.value;
  let calories = parseInt(calInput.value);

  if (!name) return alert("Please enter a food name.");

  calories = await fetchCalories(name,meal); // API fetch here
  saveAndRender();
  form.reset();
});

tableBody.addEventListener('click', (e) => {
  if (e.target.dataset.id) {
    const id = Number(e.target.dataset.id);
    foods = foods.filter(f => f.id !== id);
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

// === Theme on Load ===
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeToggle.checked = true;
}

// === Core Functions ===
function saveAndRender() {
  localStorage.setItem('foods', JSON.stringify(foods));
  renderAll();
}

function renderAll() {
  const filter = filterSelect.value;
  const visible = filter === 'All' ? foods : foods.filter(f => f.meal === filter);

  tableBody.innerHTML = '';
  let total = 0;

  visible.forEach(({ id, name, meal, calories }) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${name}</td>
      <td>${meal}</td>
      <td>${calories}</td>
      <td><button data-id="${id}" class="delete-btn">❌</button></td>
    `;
    tableBody.appendChild(row);
    total += calories;
  });

  totalCell.textContent = total;
  renderChart();
}

function renderChart() {
  const mealTotals = foods.reduce((acc, { meal, calories }) => {
    acc[meal] = (acc[meal] || 0) + calories;
    return acc;
  }, {});

  const labels = Object.keys(mealTotals);
  const data = Object.values(mealTotals);

  if (chart) chart.destroy();

  chart = new Chart(chartCanvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'Calories per Meal',
        data,
        backgroundColor: ['#f87171', '#facc15', '#34d399', '#60a5fa']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// === API Fetch ===
async function fetchCalories(food, meal) {
  const API_KEY = 'gHdGib1o0DAQtjDvnpHw6A==T8I5n5u0HW5FpSZO';
  const url = `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(food)}`;

  console.log("⏳ Fetching:", url);

  try {
    const res = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Response Status:", res.status);

    if (!res.ok) throw new Error('Network error');

    const data = await res.json();

    console.log("📦 Data from API:", data.items);
    let result = await loopDataArray(data.items);
    console.log("Result:", result);
    await loopResultsToGetObjects(result, meal);

    if (!data.items.length) throw new Error('Food not found');

    // return Math.round(data[0].calories);
  } catch (err) {
    alert(`Could not fetch calories for "${food}" (${err.message}). Using default 100 kcal.`);
    // return 100;
  }
}

function loopDataArray(data) {
  return data.map(item => {
    let { name, calories,}  = item;
    return { name, calories };  
  });
}

function loopResultsToGetObjects(data, meal) {
  data.map(obj => {
    console.log("Object:", obj);
    const name = obj.name;
    const calories = obj.calories; 
    foods.push({ id: Date.now(), name, calories, meal });
    console.log("Inside loop results")
  })

  
}
