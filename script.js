let map;
let markers = [];
let markerMap = {}; // NODE_ID별 마커 저장
let fullData = [];

let roadview = null;
let roadviewClient = new kakao.maps.RoadviewClient();

/* -------------------------------
   1) 지도 초기화
--------------------------------*/
function initMap() {
  map = L.map("map").setView([37.5665, 126.9780], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);
}

/* -------------------------------
   2) 기존 마커 삭제
--------------------------------*/
function clearMarkers() {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];
  markerMap = {};
}

/* -------------------------------
   3) 마커 렌더링 + 로드뷰 + hover highlight
--------------------------------*/
function renderMarkers(rows) {
  clearMarkers();

  rows.forEach((row) => {
    const x = row.X좌표;
    const y = row.Y좌표;

    if (!isNaN(x) && !isNaN(y)) {
      const marker = L.marker([y, x]).addTo(map);

      marker.bindPopup('${row.정류소명}');
      markers.push(marker);

      // 마커 매핑 저장
      markerMap[row.NODE_ID] = marker;

      // ✅ 마커 클릭 → 로드뷰 표시
      marker.on("click", function () {
        showRoadView(y, x);
      });
    }
  });
}

/* -------------------------------
   4) 테이블 표시 + hover 시 해당 마커 강조
--------------------------------*/
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
    tr.innerHTML = `
      <td>${row.NODE_ID}</td>
      <td>${row.ARS_ID}</td>
      <td>${row.정류소명}</td>
      <td>${row.우선순위}</td>
    `;

    // ✅ 표 hover 시 마커 강조
    tr.addEventListener("mouseenter", () => {
      const marker = markerMap[row.NODE_ID];
      if (marker) {
        marker.setIcon(
          L.icon({
            iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            iconSize: [32, 32],
          })
        );
        marker.openPopup();
      }
    });

    tr.addEventListener("mouseleave", () => {
      const marker = markerMap[row.NODE_ID];
      if (marker) {
        marker.setIcon(
          L.icon({
            iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            iconSize: [32, 32],
          })
        );
        marker.closePopup();
      }
    });

    tbody.appendChild(tr);
  });
}

/* -------------------------------
   5) Top N 필터
--------------------------------*/
function filterTop(n) {
  const sliced = fullData.slice(0, n);
  renderTable(sliced);
  renderMarkers(sliced);
}

/* -------------------------------
   6) 전체 데이터 표시
--------------------------------*/
function showAll() {
  renderTable(fullData);
  renderMarkers(fullData);
}

/* -------------------------------
   7) CSV 로딩
--------------------------------*/
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
        .filter((r) => !isNaN(r.X좌표) && !isNaN(r.Y좌표) && !isNaN(r.우선순위));

      showAll();
    },
  });
};

/* -------------------------------
   8) 카카오 로드뷰 표시
--------------------------------*/
function showRoadView(lat, lng) {
  const roadviewContainer = document.getElementById("roadview");
  const position = new kakao.maps.LatLng(lat, lng);

  roadviewClient.getNearestPanoId(position, 50, function (panoId) {
    if (panoId !== null) {
      if (!roadview) {
        roadview = new kakao.maps.Roadview(roadviewContainer);
      }
      roadview.setPanoId(panoId, position);
      roadviewContainer.style.display = "block";
    } else {
      roadviewContainer.innerHTML =
        "<p style='padding:20px'>로드뷰가 제공되지 않는 위치입니다.</p>";
    }
  });
}
