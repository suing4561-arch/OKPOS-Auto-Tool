"""
OKPos 로그인 URL 테스트 스크립트
로그인 응답 내용을 출력해서 정확한 URL 확인
"""

import requests

CONFIG = {
    "id":       "여기에_OKPos_아이디",
    "pw":       "여기에_OKPos_비밀번호",
    "base_url": "https://nice.okpos.co.kr",
}

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "ko-KR,ko;q=0.9",
})

print("=" * 60)
print("STEP 1. 로그인 페이지 접속")
print("=" * 60)

r = session.get(f"{CONFIG['base_url']}/login/login_form.jsp", timeout=15)
print(f"상태코드: {r.status_code}")
print(f"최종 URL: {r.url}")

# form 태그 찾기
import re
forms = re.findall(r'<form[^>]*action=["\']([^"\']+)["\'][^>]*>', r.text, re.IGNORECASE)
print(f"\nform action 목록: {forms}")

# input 태그 name 찾기  
inputs = re.findall(r'<input[^>]*name=["\']([^"\']+)["\'][^>]*>', r.text, re.IGNORECASE)
print(f"input name 목록: {inputs}")

# hidden 값 찾기
hiddens = re.findall(r'<input[^>]*type=["\']hidden["\'][^>]*name=["\']([^"\']+)["\'][^>]*value=["\']([^"\']*)["\']', r.text, re.IGNORECASE)
hiddens2 = re.findall(r'<input[^>]*name=["\']([^"\']+)["\'][^>]*type=["\']hidden["\'][^>]*value=["\']([^"\']*)["\']', r.text, re.IGNORECASE)
print(f"hidden 필드: {hiddens + hiddens2}")

print(f"\n응답 본문 (처음 1000자):")
print(r.text[:1000])

print("\n" + "=" * 60)
print("STEP 2. 로그인 시도 — vlogin_pre.jsp")
print("=" * 60)

# hidden 값을 포함한 로그인 데이터
login_data = {
    "userId":   CONFIG["id"],
    "userPw":   CONFIG["pw"],
    "save_id":  "N",
    "auto_lgn": "N",
}

# hidden 필드 추가
for name, val in (hiddens + hiddens2):
    login_data[name] = val

print(f"전송 데이터: { {k:v[:10]+'...' if k in ('userPw',) else v for k,v in login_data.items()} }")

resp = session.post(
    f"{CONFIG['base_url']}/login/vlogin_pre.jsp",
    data=login_data,
    headers={"Referer": f"{CONFIG['base_url']}/login/login_form.jsp",
             "Origin": CONFIG['base_url'],
             "Content-Type": "application/x-www-form-urlencoded"},
    timeout=15,
    allow_redirects=True
)

print(f"상태코드: {resp.status_code}")
print(f"최종 URL: {resp.url}")
print(f"쿠키: {list(session.cookies.keys())}")
print(f"\n응답 본문 (처음 800자):")
print(resp.text[:800])

print("\n" + "=" * 60)
print("STEP 3. 로그인 후 메인 접근 테스트")
print("=" * 60)

main_r = session.get(f"{CONFIG['base_url']}/login/top_frame.jsp", timeout=10)
print(f"메인 상태코드: {main_r.status_code}")
if "logout" in main_r.text.lower() or "로그아웃" in main_r.text:
    print("✅ 로그인 성공! 메인 접근 가능")
else:
    print("❌ 메인 접근 실패 — 로그인이 안 된 상태")
    print(f"메인 응답 (처음 300자): {main_r.text[:300]}")

input("\n아무 키나 누르면 닫힙니다...")
