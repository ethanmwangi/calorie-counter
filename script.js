// script.js
const form         = document.getElementById('food-form');
const foodInput    = document.getElementById('food-input');
const calInput     = document.getElementById('cal-input');
const list         = document.getElementById('food-list');
const totalDisplay = document.getElementById('total-display');
const resetBtn     = document.getElementById('reset-btn');

// Load from localStorage or start empty
let foods = JSON.parse(localStorage.getItem('foods')) || [];
renderAll();

/* ----------  Events ---------- */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = foodInput.value.trim();
  let calories = parseInt(calInput.value);

  // If calories left blank, fetch a random value (simulated API)
  if (!calories) {
    calories = await fetchCalories(name);
  }

  const item = { id: Date.now(), name, calories };
  foods.push(item);
  saveAndRender();
  form.reset();
});

list.addEventListener('click', (e) => {
  if (e.target.dataset.id) {
    const id = Number(e.target.dataset.id);
    foods = foods.filter(f => f.id !== id);
    saveAndRender();
  }
});

resetBtn.addEventListener('click', () => {
  if (confirm('Start a new day?')) {
    foods = [];
    saveAndRender();
  }
});

/* ----------  Helpers ---------- */
function saveAndRender() {
  localStorage.setItem('foods', JSON.stringify(foods));
  renderAll();
}

function renderAll() {
  list.innerHTML = '';
  let total = 0;

  foods.forEach(({ id, name, calories }) => {
    total += calories;

    const li = document.createElement('li');
    li.className =
      'flex justify-between items-center bg-white p-3 rounded shadow';

    li.innerHTML = `
      <span>${name}
        <span class="text-sm text-gray-500">(${calories} kcal)</span>
      </span>
      <button data-id="${id}" class="text-red-500 hover:text-red-700">✖</button>
    `;

    list.appendChild(li);
  });

  totalDisplay.textContent = `Total: ${total} kcal`;
}

// Fake Fetch API – returns random 50‑300 kcal after 300 ms
async function fetchCalories(food) {
  await new Promise(r => setTimeout(r, 300));
  return Math.floor(Math.random() * 250) + 50;
}
