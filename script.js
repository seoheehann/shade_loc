let map;
let markers = [];
let fullData = [];

// ✅ 로드뷰 DOM 요소
let roadviewContainer = null;

// ✅ 1) 지도 초기화
function initMap() {
  map = L.map("map").setView([37.5665, 126.9780], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  roadviewContainer = document.getElementById("roadview");
}

// ✅ 2) 기존 마커 지우기
function clearMarkers() {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];
}

// ✅ 3) 지도에 마커 표시 + 로드뷰 기능
function renderMarkers(rows) {
  clearMarkers();

  rows.forEach((row, index) => {
    const x = parseFloat(row.X좌표);
    const y = parseFloat(row.Y좌표);

    if (!isNaN(x) && !isNaN(y)) {
      const marker = L.marker([y, x]).addTo(map);
      marker.bindPopup(`${row.정류소명}`);

      // ✅ 클릭 시 로드뷰 표시 (카카오 로드뷰가 있을 때만)
      marker.on("click", () => {
        if (typeof kakao !== "undefined") {
          const roadview = new kakao.maps.Roadview(roadviewContainer);
          const client = new kakao.maps.RoadviewClient();
          const position = new kakao.maps.LatLng(y, x);

          client.getNearestPanoId(position, 50, (panoId) => {
            if (panoId) {
              roadview.setPanoId(panoId, position);
            }
          });
        }
      });

    markers.push({ marker, rowIndex: index });
    }
  });
}

// ✅ 4) 테이블 렌더링
function renderTable(rows) {
  const tbody = document.querySelector("#dataTable tbody");
  const thead = document.querySelector("#dataTable thead");

  thead.innerHTML = `
    <tr>
      <th>우선순위</th>
      <th>NODE_ID</th>
      <th>ARS_ID</th>
      <th>정류소명</th>
      <th>우선순위 점수</th>
    </tr>
  `;

  tbody.innerHTML = "";

  rows.forEach((row,index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index+1}</td>
      <td>${row.NODE_ID}</td>
      <td>${row.ARS_ID}</td>
      <td>${row.정류소명}</td>
      <td>${row.우선순위}</td>
    `;

tr.addEventListener("click", () => {
  const markerObj = markers[index];
  if (markerObj) {
    markerObj.marker.fire("click");
    highlightTableRow(index);
  }
});

    tbody.appendChild(tr);
  });
}

function highlightTableRow(index) {
  const rows = document.querySelectorAll("#dataTable tbody tr");
  rows.forEach((r) => r.classList.remove("hovered"));
  if (rows[index]) rows[index].classList.add("hovered");
}

// ✅ 5) Top N 필터
function filterTop(n) {
  const sliced = fullData.slice(0, n);
  renderTable(sliced);
  renderMarkers(sliced);
}

// ✅ 6) 전체 표시
function showAll() {
  renderTable(fullData);
  renderMarkers(fullData);
}

// ✅ 7) CSV 로딩
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
        .filter((r) => !isNaN(r.X좌표) && !isNaN(r.Y좌표));

      showAll();
    },
  });
};
