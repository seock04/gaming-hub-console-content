# 2026-10-03 Architecture Discussion Note

## 목적

이 문서는 SA 인증 발표 및 Gaming Hub 콘솔 콘텐츠 아키텍처 설계를 위해 진행한 대화에서, 현재까지 합의된 핵심과 다음 논의 시작 지점을 보존하기 위한 세션 노트다.

중요한 작업 원칙은 다음과 같다.

- 답을 빨리 만드는 것이 목적이 아니다.
- 설계자가 스스로 설명할 수 있을 정도로 이해를 쌓는 것이 목적이다.
- 각 단계에서 "왜 필요한가 → 무엇을 하려는가 → 무엇이 어려운가 → 무엇을 결정해야 하는가"를 확인한다.
- ChatGPT가 이해했다고 바로 다음 단계로 넘어가지 않는다.
- 설계자가 본인 말로 설명 가능한 수준인지 확인하면서 진행한다.

---

# DP1 — Console Integration / Control

## 왜 이 DP가 필요한가

초기 발표에서는 Business Requirement와 필요한 기능들을 나열했을 때, 리뷰어 관점에서 "그 기능들을 그냥 구현하면 되는 것 아닌가?"라는 인상을 줄 수 있었다.

따라서 단순 기능 구현이 아니라, 왜 Software Architect 수준의 설계 판단이 필요한지를 먼저 보여줘야 한다.

## 무엇을 하려는가

일반적인 콘솔 사용은 사용자가 콘솔을 직접 켜고 콘솔 UI에서 Store, Friend, Game 등을 이용하는 방식이다.

Gaming Hub에서는 콘솔을 켜기 전에도 TV에서 파트너 콘솔 관련 콘텐츠를 보여주고, 사용자가 콘텐츠를 선택하면 다음과 같은 실제 콘솔 동작까지 이어지게 하려 한다.

- TV에서 파트너 콘텐츠 조회
- 사용자 선택
- 콘솔 Power On
- HDMI Source 전환
- Network command 전달
- Console deep link 수행

## 무엇이 어려운가

단순히 "여러 시스템이 연동된다"가 핵심이 아니다.

핵심은 사용자는 하나의 행동으로 인식하지만 실제로는 Cloud, TV, Network, HDMI, Console이 독립적으로 동작하기 때문에 부분 성공과 상태 불일치가 발생할 수 있다는 점이다.

예:

- Network command는 성공했지만 HDMI 전환은 실패
- Console power-on은 성공했지만 deep link는 실패
- TV가 선택한 콘텐츠와 실제 Console 상태가 다름

따라서 DP1의 핵심 난제는 다음과 같이 정리한다.

> 서로 독립적인 Cloud, TV, Network, HDMI, Console의 상태와 제어를 사용자의 하나의 의도에 맞게 실제 콘솔 동작까지 연결해야 한다.

## DP1 설계 관점

DP1에서는 주로 다음을 결정해야 한다.

- 정보가 어떤 경로로 이동하는가
- Console control을 어떤 경로로 수행하는가
- 서로 다른 시스템의 상태를 어떻게 확인하는가
- Partial failure를 어떻게 처리하는가
- 사용자 의도를 실제 Console 상태까지 어떻게 유지하는가

---

# DP2 — Profile / Purchase / Entitlement / Remote Installation / Execution

## 오늘 논의에서 수정된 중요한 전제

DP2를 "구매 → 설치 → 실행"의 하나의 긴 선형 사용자 흐름으로 설명하면 안 된다.

각 기능은 서로 연관될 수 있지만 독립적으로 끝나거나, 다른 시점에 다시 시작되거나, 반복 수행될 수 있다.

예:

- Member Profile에서 구매를 시도하면 TV에서 차단되고 종료될 수 있음
- 구매 가능한 Profile에서는 구매만 하고 설치하지 않을 수 있음
- 오늘 구매하고 내일 설치할 수 있음
- 구매한 여러 게임 중 일부만 나중에 설치할 수 있음
- 현재 TV가 아닌 다른 방 TV에 연결된 Console에 설치할 수 있음
- Console storage 부족으로 기존 게임을 삭제한 뒤 다른 게임을 설치할 수 있음
- 설치와 실행 역시 별도 시점에 수행될 수 있음

즉 DP2는 하나의 Transaction이나 Wizard Flow가 아니라, 서로 다른 라이프사이클을 갖는 기능들의 조합 문제다.

---

## Profile 구조에 대한 오늘의 보정

기존 문서에서 단순히 Adult Profile / Minor Profile로 설명한 부분은 실제 TV Profile 모델과 정확히 같지 않을 수 있다.

현재 대화에서 확인한 개념은 다음과 같다.

### Samsung Account 기반 주 Profile (대화 중 SP라고 표현)

- Samsung Account를 기반으로 한 주 Profile
- 결제 등 주요 기능을 수행할 수 있음
- 필요한 경우 PIN 등 추가 인증을 통해 결제 수행

### Member Profile

- 상위 Samsung Account/Profile 아래 생성되는 하위 사용자 Profile
- 사용자/가족 구성원별로 별도 Profile로 사용할 수 있음
- Member Profile의 정책 수준에 따라 사용할 수 있는 기능이 다를 수 있음
- 구매 권한이 없는 Member Profile이 Active Profile이면 Gaming Hub에서 결제 시스템으로 넘기기 전에 TV 단에서 구매 진입 자체를 막아야 함

주의:

- 대화 중 언급한 "Enhanced Policy Management" 등의 실제 기능/단계 명칭은 TV Profile 공식 명세에서 재확인 필요
- DP2에서 중요한 것은 단순한 성인/미성년 구분이 아니라, 현재 Active Profile의 종류와 정책/권한 상태에 따라 구매 가능 여부를 제어하는 것

---

# DP2의 현재 핵심 문제 정의

프로필 기반 구매 제어, 구매, 보유 권한(Entitlement), 원격 설치, 실행은 서로 관련되어 있지만 하나의 순차적 Transaction은 아니다.

각 기능은 서로 다른 시점, 대상, 조건에서 독립적으로 수행되거나 반복될 수 있다.

따라서 다음의 상태를 하나의 Flow 상태로 묶어버리면 안 된다.

- Profile / purchase eligibility
- Purchase result
- Entitlement / ownership
- Installation state
- Target console/device state
- Execution state

현재까지의 핵심 설계 질문은 다음과 같다.

> 구매, 보유 권한, 설치, 실행을 어떤 단위로 분리해 관리하고, 각 기능을 어떤 조건과 시점에 서로 연결할 것인가?

---

# "보유 권한(Entitlement)" 의미

여기서 보유 권한은 단순히 "결제를 할 수 있는가"가 아니다.

의미는 다음과 같다.

> 특정 Account/Profile이 이미 구매한 콘텐츠를 소유하고 있으며, 그 콘텐츠를 설치하거나 사용할 수 있는 권리가 있는가.

따라서 다음은 구분해야 한다.

- Purchase Eligibility: 지금 이 Profile이 구매 가능한가
- Purchase Result: 구매가 실제 완료되었는가
- Entitlement: 해당 Account/Profile이 그 콘텐츠를 보유하고 사용할 권리가 있는가
- Installation State: 어떤 Console에 설치되어 있거나 설치 중인가

---

# DP1과 DP2를 억지로 비교할 필요는 없음

두 DP는 발표에서 서로 비교하여 우열을 설명하는 대상이 아니다.

둘 다 중요한 Architecture Decision Point이며 각각 독립적으로 설명한다.

현재 관점에서 보면:

- DP1: Console integration / control / partial failure / state coordination 문제
- DP2: 서로 다른 lifecycle을 갖는 Profile, Purchase, Entitlement, Installation, Execution을 어떻게 분리하고 필요한 시점에 연결할지에 대한 문제

이 차이는 참고용이며 발표에서 반드시 비교표로 만들 필요는 없다.

---

# 다음 세션 시작 지점

다음 대화에서는 곧바로 Component Diagram이나 Sequence Diagram을 그리지 않는다.

먼저 DP2의 문제 정의를 설계자가 자기 말로 설명할 수 있는지부터 확인한다.

다음 질문부터 시작한다.

> "왜 구매, 설치, 실행을 하나의 Flow로 묶으면 안 되는가? 실제 사용 예를 들어서 설명해보자."

설계자가 이 부분을 자기 말로 설명할 수 있게 된 다음에 아래 질문으로 넘어간다.

1. 어떤 상태들을 서로 분리해야 하는가?
2. 각 상태는 누구의 lifecycle을 따르는가?
3. 상태 간 연결이 필요한 시점은 언제인가?
4. 어느 시스템이 각 상태의 기준(Source of Truth)이 되어야 하는가?
5. UI가 종료되거나 사용자가 다른 일을 하는 동안에도 지속되어야 하는 상태는 무엇인가?

그 후에야 실제 Architecture Design으로 들어간다.

---

# 다음 설계 단계에서 검토할 후보

아직 확정된 설계가 아니며, 다음 세션에서 검증할 후보들이다.

- Foreground UI와 장기 실행되는 Remote Installation lifecycle의 분리 필요 여부
- Background Service / Orchestration 역할 필요 여부
- Profile policy 적용 시점
- Purchase와 Entitlement의 관계
- Target Console 선택 및 Device state 관리
- Installation progress / success / failure tracking
- 설치 완료 후 즉시 Console 제어를 수행할지, 사용자에게 Nudge/Notification을 제공할지
- 현재 TV 사용 상태와 Console 상태에 따른 실행 전략

이 항목들은 아직 Architecture Decision으로 확정하지 않는다. 다음 세션에서 하나씩 이유를 확인하면서 결정한다.
