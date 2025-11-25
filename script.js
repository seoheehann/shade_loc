let map;
let markers = [];
let fullData = [];
let roadview;
let roadviewClient = new kakao.maps.RoadviewClient();

// 지도 초기화
function initMap() {
  map = L.map("map").setView([37.5665, 126.9780], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  roadview = new kakao.maps.Roadview(document.getElementById("roadview"));
}

// 마커 제거
function clearMarkers() {
  markers.forEach((m) => map.removeLayer(m.marker));
  markers = [];
}

// 마커 및 이벤트 렌더링
function renderMarkers(rows) {
  clearMarkers();

  rows.forEach((row, index) => {
    const x = row.X좌표;
    const y = row.Y좌표;

    if (!isNaN(x) && !isNaN(y)) {
      const marker = L.marker([y, x]).addTo(map);
      marker.bindPopup(`${row.정류소명}`);

      marker.on("click", () => {
        let position = new kakao.maps.LatLng(y, x);
        roadviewClient.getNearestPanoId(position, 50, function (panoId) {
          roadview.setPanoId(panoId, position);
        });
      });

      markers.push({ node: row.NODE_ID, marker });
    }
  });
}

// 테이블 렌더링 + hover 이벤트
function renderTable(rows) {
  const tbody = document.querySelector("#dataTable tbody");
  const thead = document.querySelector("#dataTable thead");

  thead.innerHTML = `
    <tr>
      <th>NODE_ID</th>
      <th>ARS_ID</th>
      <th>정류소명</th>
      <th>우선순위</th>
    </tr>
  `;

  tbody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-nodeid", row.NODE_ID);

    tr.innerHTML = `
      <td>${row.NODE_ID}</td>
      <td>${row.ARS_ID}</td>
      <td>${row.정류소명}</td>
      <td>${row.우선순위}</td>
    `;

    tr.addEventListener("mouseenter", () => {
      let m = markers.find((m) => m.node === row.NODE_ID);
      if (m) m.marker._icon.style.filter = "brightness(200%)";
    });

    tr.addEventListener("mouseleave", () => {
      let m = markers.find((m) => m.node === row.NODE_ID);
      if (m) m.marker._icon.style.filter = "brightness(100%)";
    });

    tbody.appendChild(tr);
  });
}

// 필터 기능
function filterTop(n) {
  const sliced = fullData.slice(0, n);
  renderTable(sliced);
  renderMarkers(sliced);
}

// 전체 표시
function showAll() {
  renderTable(fullData);
  renderMarkers(fullData);
}

// CSV 로드
window.onload = function () {
  initMap();

  Papa.parse("모두 들은 파일.csv", {
    download: true,
    header: true,
    complete: function (results) {
      fullData = results.data
        .map((r) => ({
          NODE_ID: r["NODE_ID"],
          ARS_ID: r["ARS_ID"],
          정류소명: r["정류소명"],
          X좌표: parseFloat(r["X좌표"]),
          Y좌표: parseFloat(r["Y좌표"]),
          우선순위: parseFloat(r["우선순위"]),
        }))
        .filter(
          (r) =>
            !isNaN(r.X좌표) &&
            !isNaN(r.Y좌표) &&
            !isNaN(r.우선순위)
        );

      showAll();
    },
  });
};
