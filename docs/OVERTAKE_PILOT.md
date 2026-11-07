# 추월 프레임 파일럿 — 앰버 폭스 / 블루 코멧

## 제작 범위
두 팀 각각 접근 3장, 병주 3장, 추월 후 이탈 3장: 총 18개 프레임. 기존 리버리 원화를 참조하여 이미지 생성으로 제작했다. 생성 시트는 각도별로 크기와 접지 영역을 공통으로 잘라 패킹했으며 `src/overtake-assets.js`가 실제 프레임 좌표를 소유한다.

생성 프롬프트 요약: exact 3×3 atlas, row1 front three-quarter approaching nose lower left, row2 side view nose left, row3 rear three-quarter departing nose upper left; each row 3 subtle wheel-steering/suspension frames, consistent livery, transparent background, no text or real logos.

## 연결
- 앞차와 간격 6m 초과: 접근 원화 3프레임.
- -6m~6m: 측면 병주 3프레임.
- 6m 이상 앞선 후: 후방 이탈 3프레임.
- 차량 몸체는 원본 프레임을 바꿔 재생. 화면 위치는 실제 누적 거리로 계산. 순위 역전 시점은 여전히 실제 거리차 0 통과다.
- 프레임은 시뮬레이션 시간 기준 9fps. 일시정지하면 멈추며 배속도 함께 적용.
- 상대 차량이 블루 코멧인 경우만 이 파일럿 시트 적용. 다른 팀을 블루 코멧으로 대체하지 않음.
- 상단 `추월 시연` 버튼은 별도 실제 경기 상태를 생성하고 1배속으로 시작한다. 앰버 폭스는 6위에서 출발, 블루 코멧을 실제 추월하면 5위가 된다. 나머지 차량은 앞에서 계속 달린다.

## 제한
첫 두 팀의 추월 장면 검증용이다. 생성 프레임 간 미세한 형태/접지 편차는 남아 있다. 나머지 팀, 코너/피트 진출입/결승선 전용 프레임은 아직 기존 원화 방식으로 표시한다.
