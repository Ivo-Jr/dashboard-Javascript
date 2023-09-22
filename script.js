const polarChart = document.getElementById('polarChart');
const barChart = document.getElementById('barChart');
const controlButtons = document.querySelectorAll('.controls button');
const switchToggle = document.querySelector('.switch-toggle');
const icons = switchToggle.querySelectorAll('.material-symbols-outlined');

let newBarChart;
let newPolarChart;

let barChartValue = [];
let polarChartValue = [];

let optionPolarChart = {
  scales: {
    r: {
      grid: {
        color: '#666666'
      }
    }
  },
  plugins: {
    legend: {
      labels: {
        color: '#dce1eb'
      }
    }
  }
}
let optionBarChart = {
  scales: {
    y: {
      grid: {
        color: '#666666'
      },
      ticks: {
        color: '#dce1eb'
      }
    },
    x: {
      grid: {
        color: '#666666'
      },
      ticks: {
        color: '#dce1eb'
      }
    }
  },
  plugins: {
    legend: {
      labels: {
        color: '#dce1eb'
      }
    }
  }
}

let configurePolarChart = {}
let configureBarChart = {}



//TERCEIRA PARTE - GRAFICO - OPTIONS
function configureChartOptions() {
  const darkThemeActive = document.body.classList.contains('dark-theme-variables');

  if (darkThemeActive) {
    configurePolarChart = optionPolarChart;
    configureBarChart = optionBarChart;
  } else {
    configurePolarChart = {};
    configureBarChart = {};
  }
}

// SEGUNDA PARTE - GRAFICO - POLAR;
function updatePolarChartOptions() {
  newPolarChart && newPolarChart.destroy();

  newPolarChart = new Chart(polarChart, {
    type: 'polarArea',
    data: {
      labels: labelsPolarChart,
      datasets: [{
        data: polarChartValue,
        backgroundColor: backgroundColorPolar
      }]
    },
    options: configurePolarChart
  });
}

// SEGUNDA PARTE - GRAFICO - BARRAS;
async function updateBarChartOptions() {
  newBarChart && newBarChart.destroy();

  newBarChart = new Chart(barChart, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Meses',
        data: barChartValue,
        backgroundColor: backgroundColorBarChart,
        borderColor: borderColorBarChart,
        borderWidth: 1
      }]
    },
    options: configureBarChart
  });

}

// FETCH:
async function handleFetch() {
  const response = await fetch('data.json');

  return await response.json();
}

// PRIMEIRA PARTE - GRAFICO:
async function hanldeChartValues() {
  const data = await handleFetch();

  // Unico array
  const combinedData = [...data.input, ...data.output];

  // Usar o reduce p/ fazer as somas por mes:
  const monthSums = combinedData.reduce((acc, item) => {
    const [yaer, month] = item.date.split('-');
    const monthKey = `${yaer}-${month}`;

    // Usar chaves do mes p/ somar valores
    acc[monthKey] = acc[monthKey] || { input: 0, output: 0 };


    // acumular valores input e output
    if (data.input.includes(item)) {
      acc[monthKey].input += item.amount
    } else {
      acc[monthKey].output += item.amount
    }

    return acc;
  }, {});

  // DiferenCa de valores;
  const result = Object.values(monthSums).map(({ input, output }) => input - output)

  barChartValue = result;
  updateBarChartOptions();

  const groups = [];
  const groupLength = 4;

  for (let i = 0; i < result.length; i += groupLength) {
    const group = result.slice(i, i + groupLength);
    const groupSum = group.reduce((acc, valor) => acc + valor, 0);

    groups.push(groupSum);
  }

  polarChartValue = groups;
  updatePolarChartOptions();
}

switchToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme-variables');

  icons.forEach(spn => {
    spn.classList.toggle('switch-actived')
  });

  configureChartOptions();
  updateBarChartOptions();
  updatePolarChartOptions();
});

function handleShowEmoji() {
  const index = Math.floor(Math.random() * emojis.length);
  const emojiSort = emojis[index];

  document.querySelector('.emoji').innerHTML = emojiSort;
};

// TABELA - SELECAO:
controlButtons.forEach(button => {
  button.addEventListener('click', () => {
    controlButtons.forEach(btn => btn.classList.remove('selectedControlers'));

    handleShowTable(button.role)
    button.classList.add('selectedControlers');
  })
});

async function handleShowTable(role) {
  const data = await handleFetch();
  const lista = role === '0' || role === undefined ? [...data.input, ...data.output] : role === '1' ? data.input : data.output;
  const tbody = document.getElementById('table-body');

  tbody.innerHTML = "";

  const result = lista.filter(item => {
    const [year, month] = item.date.split('-')
    const monthKey = `${year}-${month}`;

    if (monthKey === '2023-01') {
      return item
    }
  });

  result.forEach(item => {
    item.dateObj = new Date(item.date)
  });

  result.sort((a, b) => a.dateObj - b.dateObj);

  // escrever nosso HTML
  result.forEach(item => {
    const row = document.createElement('tr');

    const iconCell = document.createElement('td');
    iconCell.classList.add('icon-table');
    iconCell.innerHTML =
      item.type === 'input'
        ? '<span class="material-symbols-outlined positive"> trending_up </span>'
        : '<span class="material-symbols-outlined negative"> trending_down </span>'
    row.appendChild(iconCell);

    const descriptionCell = document.createElement('td');
    descriptionCell.classList.add('description');
    descriptionCell.textContent = item.description;
    row.appendChild(descriptionCell);

    const amountCell = document.createElement('td');
    amountCell.classList.add('amount');
    amountCell.textContent = `${item.type === 'output' ? `- R$ ${item.amount.toFixed(2)}` : `R$ ${item.amount.toFixed(2)}`}`;
    row.appendChild(amountCell);

    const date = document.createElement('td');
    date.classList.add('date');
    date.textContent = formatDate(item.date);
    row.appendChild(date);

    tbody.appendChild(row);
  })
}


handleShowTable();
handleShowEmoji();
hanldeChartValues();
