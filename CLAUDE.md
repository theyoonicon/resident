# Claude Code 작업 시 주의사항

## Node 프로세스 관리

**절대 `taskkill //F //IM node.exe` 사용 금지!**

- 이 명령어는 모든 Node 프로세스를 죽이므로 Claude Code도 같이 종료됨
- 대신 특정 포트의 프로세스만 종료할 것:

```bash
# 포트 3000에서 실행 중인 프로세스 찾기
netstat -ano | findstr :3000 | findstr LISTENING

# 특정 PID만 종료
taskkill //F //PID <PID번호>
```

## 환경 설정

- **NEXTAUTH_URL**: `http://localhost:3000` (dev 서버 포트와 일치해야 함)
- 개발 서버 포트: 3000
