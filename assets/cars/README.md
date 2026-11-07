# チーム別車両 / 팀별 차량 프레임

이미지 생성으로 제작한 6개 팀 전용 측면 주행 시트. 각 WebP 768×512, 세로 3행. 런타임에서 각 행을 프레임으로 사용하며 주행 시 9fps, 정차 시 첫 프레임 사용. 팀 ID 배열 순서는 `src/highlights.js`에 고정.

| ID | 파일 | 리버리 |
|---|---|---|
| 0 | amber-fox.webp | 금색·차콜 |
| 1 | blue-comet.webp | 청색·은색 |
| 2 | crimson-volt.webp | 적색·차콜 |
| 3 | silver-heron.webp | 백색·청록 |
| 4 | nova-pulse.webp | 보라·차콜 |
| 5 | iron-clover.webp | 녹색·크림 |

제작 프롬프트 기준: 2D painted anime motorsport broadcast, identical fictional open-wheel car in three vertically stacked frames, side profile nose right, wheel-spoke/suspension cycle, transparent background, no real brands or text. 팀별 색상은 위 표 적용. 생성 원화의 크기 편차가 있어 제품용으로는 추가 정합성 검수가 필요하다.

## 중계 개선용 사선 원화
`*-angle.webp` 6개: 각 팀 전용 전방 3/4 원화. 코너 사선 카메라와 우측 팀 차량 패널에서 사용한다. 실제 이미지 비율을 유지하며 여백 안에 전체 차량을 맞춘다. 프롬프트: front three-quarter, nose lower left, low trackside broadcast camera, detailed fictional open-wheel car, premium painted anime sports game, transparent background, no text/real logos. 팀별 리버리는 위 표와 동일.

현재 중계는 차체 변형이 생기는 3프레임 반복을 중지하고 고정 원화 + 실제 상대 거리 기반 이동 + 카메라 추적/접지 그림자로 표현한다. 측면 시트의 첫 프레임은 근접 추적 샷에 사용한다.
