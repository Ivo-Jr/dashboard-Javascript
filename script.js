const polarChart = document.getElementById('polarChart');
const barChart = document.getElementById('barChart');
const switchToggle = document.querySelector('.switch-toggle');
const icons = switchToggle.querySelectorAll('.material-symbols-outlined');

let newBarChart;
let newPolarChart;

let barChartValue = [];
let polarChartValue = [];

// SEGUNDA PARTE - GRAFICO - POLAR;
function handlePolarChartOptions() {
  newPolarChart = new Chart(polarChart, {
    type: 'polarArea',
    data: {
      labels: labelsPolarChart,
      datasets: [{
        data: polarChartValue,
        backgroundColor: backgroundColorPolar
      }]
    }
  });
}

// SEGUNDA PARTE - GRAFICO - BARRAS;
async function handleBarchartOptions() {
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
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

}

// FETCH :
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
  handleBarchartOptions();

  const groups = [];
  const groupLength = 4;

  for (let i = 0; i < result.length; i += groupLength) {
    const group = result.slice(i, i + groupLength);
    const groupSum = group.reduce((acc, valor) => acc + valor, 0);

    groups.push(groupSum);
  }

  polarChartValue = groups;
  handlePolarChartOptions();
}

switchToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme-variables');

  icons.forEach(spn => {
    spn.classList.toggle('switch-actived')
  })
});

function handleShowEmoji() {
  const index = Math.floor(Math.random() * emojis.length);
  const emojiSort = emojis[index];

  document.querySelector('.emoji').innerHTML = emojiSort;
};

handleShowEmoji();
handleFetch();
hanldeChartValues();
