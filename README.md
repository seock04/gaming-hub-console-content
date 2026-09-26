# Gaming Hub Console Content Ingestion

콘솔 파트너(Xbox, PlayStation, Nintendo)의 게임 콘텐츠를 공통 모델로 정규화해 Gaming Hub에 전달하기 위한 프로젝트입니다.

## 시작하기

```bash
npm install
npm run dev
```

서버는 `http://localhost:3000`에서 실행됩니다.

## API

- `GET /health` — 서비스 상태
- `GET /api/v1/content` — 정규화된 콘텐츠 조회
- `POST /api/v1/content` — 콘텐츠 등록

현재는 인메모리 저장소와 샘플 데이터로 구성된 초기 세팅입니다. 실제 파트너 API와 영속 저장소는 다음 단계에서 연결할 수 있습니다.

## 설계 방향

파트너별 어댑터가 외부 응답을 `ConsoleContent` 공통 모델로 변환하도록 분리합니다. 따라서 Xbox, PlayStation, Nintendo 연동을 추가해도 허브 API 계약은 유지됩니다.
