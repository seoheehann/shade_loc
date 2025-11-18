let map;
let markers = []; // 지도 마커 저장
let fullData = []; // CSV 전체 데이터 저장

// 1) 지도 초기화
function initMap() {
  map = L.map("map").setView([37.5665, 126.9780], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);
}

// 2) 모든 마커 삭제
function clearMarkers() {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];
}

// 3) 특정 데이터 배열로 지도 렌더링
function renderMarkers(rows) {
  clearMarkers();

  rows.forEach((row) => {
    let x = parseFloat(row["X좌표"]);
    let y = parseFloat(row["Y좌표"]);
    if (!x || !y) return;

    let marker = L.marker([y, x]).addTo(map);
    marker.bindPopup(`${row["정류소명"]}<br>${x}, ${y}`);
    markers.push(marker);
  });
}

// 4) 테이블 렌더링
function renderTable(rows) {
  const tbody = document.querySelector("#dataTable tbody");
  const thead = document.querySelector("#dataTable thead");

  tbody.innerHTML = "";
  thead.innerHTML = `
    <tr>
      <th>NODE_ID</th>
      <th>ARS_ID</th>
      <th>정류소명</th>
      <th>우선순위</th>
    </tr>
  `;

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["NODE_ID"]}</td>
      <td>${row["ARS_ID"]}</td>
      <td>${row["정류소명"]}</td>
      <td>${row["우선순위"]}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 5) 필터링 함수 (Top 5 / Top 10)
function filterTop(n) {
  const sliced = fullData.slice(0, n);
  renderTable(sliced);
  renderMarkers(sliced);
}

// 6) 전체 데이터 표시
function showAll() {
  renderTable(fullData);
  renderMarkers(fullData);
}

// 7) CSV 로딩
window.onload = function () {
  initMap();

  Papa.parse("data.csv", {
    download: true,
    header: true,
    complete: function (results) {
      fullData = results.data.filter(
        (r) => r["X좌표"] && r["Y좌표"] && r["우선순위"]
      );

      // 우선순위 기준 정렬 (내림차순)
      fullData.sort((a, b) => b["우선순위"] - a["우선순위"]);

      showAll();
    },
  });
};
