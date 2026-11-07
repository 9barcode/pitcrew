# 중계 미술/카메라 개선 — 2026-11-07

## 참고한 공개 자료
- FORMULA 1 공식 2025 사우디아라비아 GP 하이라이트: https://www.youtube.com/watch?v=Li93iQDZQeg
- FORMULA 1 공식 2025 영국 GP 피아스트리/베르스타펜 추월: https://www.formula1.com/en/video/2025-british-grand-prix-piastri-overtakes-verstappen-on-lap-8-to-take-the-lead-of-the-race.1836908523592483920
- F1 방송 제작진 현장 인터뷰: https://motorsportbroadcasting.com/2023/08/03/inside-f1s-media-and-technology-centre-the-tools-for-storytelling/

브라우저의 영상 본편은 버퍼링이 계속되어 전체 시청/장면별 분석을 완료했다고 주장하지 않는다. 공식 공개 장면 이미지와 설명, 제작진 인터뷰를 참고하여 아래 게임 연출 방향을 정했다. 실제 영상·로고는 게임 리소스로 사용하지 않는다.

## 개선 판단
- 평행한 가로 줄무늬 배경과 같은 크기의 측면 차량 2대는 평면적인 인상을 만든다.
- 코너 바깥 사선 구도와 망원 추적 구도를 분리하고, 차량 크기·원근·접지 그림자·카메라 추적을 함께 적용한다.
- 차체를 크게 변형하는 3프레임 반복 대신 사선 차량 원화와 안정된 위치 이동을 사용한다. 기존 측면 시트는 근접 추적에 사용한다.
- 작은 중계칸과 중앙 정비장 구도는 그대로 유지한다.
- 배틀 상대 ID와 실제 상대 거리는 기존 단일 경기 상태를 계속 참조한다. 카메라 전환은 순위와 경기 진행에 영향을 주지 않는다.
- 우측 팀 패널은 팀명 → 차량 이미지 → 차량 번호 → 현재 순위 → 정비 기록/조작 순서로 복원한다.
