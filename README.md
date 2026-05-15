# OKPOS Auto Tool

OKPOS 관련 자동화/테스트 파일 모음입니다.

## Files

- `okpos_scraper.py`: OKPOS 매출 수집 스크립트
- `okpos_login_test.py`: 로그인 테스트 스크립트
- `site_driver.html`: 기사/드라이버 화면
- `site_franchise.html`: 가맹점 화면
- `site_hq.html`: 본사 화면
- `site_supplier.html`: 공급사 화면
- `master.html`: 대상정보통신 master 계정관리 화면
- `login.html`: mock 로그인/비밀번호 재설정 테스트 화면
- `auth.js`: mock 인증/계정관리 함수 모음

## Security

실제 로그인 ID, 비밀번호, API 키, Firebase 서비스 계정 JSON, `.env` 파일은 커밋하지 않습니다.

## Mock Account Management

Firebase 실제 연동 전까지 `auth.js`가 `localStorage` mock 데이터로 계정 생성, 수정, 활성화, 비활성화, 사용중지, 계약만료, 비밀번호 초기화를 처리합니다.
