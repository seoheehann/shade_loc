let data = [];

async function loadData() {
  const response = await fetch('모두 들은 파일.csv');
  const text = await response.text();

  const rows = text.trim().split('\n').map(r => r.split(','));
  const headers = rows.shift();
  data = rows.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));

  renderTable(data);
}

function renderTable(dataset) {
  const table = document.getElementById('dataTable');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  // 헤더 출력
  thead.innerHTML = '<tr>' + Object.keys(dataset[0])
    .map(h => `<th>${h}</th>`).join('') + '</tr>';

  // 데이터 행 출력
  tbody.innerHTML = dataset.map(row => '<tr>' +
    Object.values(row).map(v => `<td>${v}</td>`).join('') +
  '</tr>').join('');
}

function filterTop(n) {
  const sorted = [...data].sort((a, b) => parseFloat(b['우선순위']) - parseFloat(a['우선순위']));
  renderTable(sorted.slice(0, n));
}

function showAll() {
  renderTable(data);
}

loadData();
