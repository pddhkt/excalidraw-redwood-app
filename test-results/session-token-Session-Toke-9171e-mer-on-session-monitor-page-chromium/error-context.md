# Page snapshot

```yaml
- generic [ref=e6]:
  - heading "Session Monitor" [level=1] [ref=e7]
  - paragraph [ref=e8]: Real-time session monitoring with countdown timer
  - generic [ref=e12]: No Session
  - generic [ref=e13]:
    - button "🔓 Fake Login" [active] [ref=e14] [cursor=pointer]
    - button "🗑️ Clear Session" [ref=e15] [cursor=pointer]
    - button "🔄 Refresh" [ref=e16] [cursor=pointer]
  - generic [ref=e17]:
    - paragraph [ref=e18]: "Error:"
    - paragraph [ref=e19]: No session found
  - generic [ref=e20]:
    - heading "How to Test:" [level=3] [ref=e21]
    - list [ref=e22]:
      - listitem [ref=e23]: Click "Fake Login" to create a session (30 second duration)
      - listitem [ref=e24]: Watch the countdown timer update every second
      - listitem [ref=e25]: "Console logs show countdown: \"⏱️ Session expires in: Xs\""
      - listitem [ref=e26]: At 0s, session expires and page should redirect to /login
      - listitem [ref=e27]: Session extends automatically after 15s (halfway point) on activity
  - generic [ref=e28]:
    - heading "Test Scenarios:" [level=3] [ref=e29]
    - list [ref=e30]:
      - listitem [ref=e31]:
        - strong [ref=e32]: "5 seconds:"
        - text: Session should be active (green)
      - listitem [ref=e33]:
        - strong [ref=e34]: "10 seconds:"
        - text: Session should be active (green)
      - listitem [ref=e35]:
        - strong [ref=e36]: "15 seconds:"
        - text: Session reaches halfway point (yellow warning)
      - listitem [ref=e37]:
        - strong [ref=e38]: "31 seconds:"
        - text: Session expires, redirect to /login
```