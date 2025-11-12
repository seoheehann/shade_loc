let data = [];
let map;
let markers = [];

// 데이터 로드
async function loadData() {
  const res = await fetch("모두 들은 파일.csv");
  const text = await res.text();
  const rows = text.trim().split("\n").map((r) => r.split(","));
  const headers = rows.shift().map((h) => h.replace(/\r/g, "").trim());

  data = rows.map((row) =>
    Object.fromEntries(
      headers.map((h, i) => [h, (row[i] || "").replace(/\r/g, "").trim()])
    )
  );

  initMap();
  renderTable(data);
  updateMap(data);
}

// 지도 초기화
function initMap() {
  map = L.map("map").setView([37.56, 126.97], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
}

// 지도에 마커 표시
function updateMap(dataset) {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  dataset.forEach((row) => {
    const lat = parseFloat(row["위도"]);
    const lon = parseFloat(row["경도"]);
    if (!isNaN(lat) && !isNaN(lon)) {
      const marker = L.circleMarker([lat, lon], {
        radius: 6,
        color: "#007bff",
        fillColor: "#007bff",
        fillOpacity: 0.7,
      })
        .addTo(map)
        .bindPopup(
          `<b>${row["정류소명"]}</b><br>우선순위: ${row["우선순위"]}<br>ARS: ${row["ARS_ID"]}`
        );

      markers.push(marker);
    }
  });
}

// 표 렌더링
function renderTable(dataset) {
  const table = document.getElementById("dataTable");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  const cols = ["NODE_ID", "ARS_ID", "정류소명", "우선순위"];

  thead.innerHTML =
    "<tr>" + cols.map((c) => `<th>${c}</th>`).join("") + "</tr>";

  tbody.innerHTML = dataset
    .map(
      (row) =>
        "<tr onclick='focusMarker(" +
        `${JSON.stringify(row["위도"])},${JSON.stringify(row["경도"])}` +
        ")'>" +
        cols.map((c) => `<td>${row[c] || ""}</td>`).join("") +
        "</tr>"
    )
    .join("");
}

// 특정 좌표로 지도 이동
function focusMarker(lat, lon) {
  if (lat && lon) map.setView([parseFloat(lat), parseFloat(lon)], 16);
}

// 상위 N개 필터링
function filterTop(n) {
  const col = "우선순위";
  const sorted = [...data].sort(
    (a, b) => parseFloat(b[col]) - parseFloat(a[col])
  );
  const sliced = sorted.slice(0, n);
  renderTable(sliced);
  updateMap(sliced);
}

// 전체보기
function showAll() {
  renderTable(data);
  updateMap(data);
}

loadData();
