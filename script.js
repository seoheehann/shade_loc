// CSV 파일 읽기 및 시각화
let map;

document.addEventListener("DOMContentLoaded", () => {
  map = L.map("map").setView([37.55, 126.98], 11);

  // 기본 타일 (지도 배경)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  // CSV 파일 로드
  fetch("모두 들은 파일.csv")
    .then((response) => response.text())
    .then((data) => {
      const rows = Papa.parse(data, { header: true }).data;

      // 지도에 점 찍기
      rows.forEach((row) => {
        const x = parseFloat(row["X좌표"]); // 경도
        const y = parseFloat(row["Y좌표"]); // 위도
        const name = row["정류소명"];

        // 좌표가 유효할 때만 마커 추가
        if (!isNaN(x) && !isNaN(y)) {
          const marker = L.marker([y, x]).addTo(map);
          marker.bindPopup(`<b>${name}</b><br>${x}, ${y}`);
        }
      });

      // 표 생성
      makeTable(rows);
    });
});

// 테이블 표시
function makeTable(data) {
  const tableHead = document.querySelector("#dataTable thead");
  const tableBody = document.querySelector("#dataTable tbody");

  tableHead.innerHTML = `
    <tr>
      <th>NODE_ID</th>
      <th>ARS_ID</th>
      <th>정류소명</th>
      <th>우선순위</th>
    </tr>
  `;

  tableBody.innerHTML = "";

  data.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["NODE_ID"]}</td>
      <td>${row["ARS_ID"]}</td>
      <td>${row["정류소명"]}</td>
      <td>${row["우선순위"]}</td>
    `;
    tableBody.appendChild(tr);
  });
}
