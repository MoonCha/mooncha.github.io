---
title: 프로그래밍 토막 지식 (1)
author: MoonCha
layout: post
categories: [MISC]
---

실무에서 겪은 작은 시행착오들을 짧게 기록해 둡니다.

---

## 1. 배포 중 FE/BE 하위호환성

BE 배포에서만 하위 호환성을 보통 고려하고 있었으나, FE에서도 동일한 문제가 생길 수 있습니다.
SPA처럼 하나의 번들만 로드하면 괜찮겠으나, 외부 라이브러리를 script로 따로 불러오는 경우 배포 중 구버전과 신버전이 섞여 로드될 수 있습니다.

-> **SPA FE도 배포 시 하위호환성 고려가 필요하다.**

---

## 2. MySQL Auto Increment 채번 규칙

MySQL은 DB 재시작 시 다음 ID를 `MAX(id) + 1`로 정합니다.
문제는 가장 큰 ID가 삭제된 상태라면 재시작 후 그 값이 다시 ID로 채번될 수 있습니다.
비즈니스 로직에 따라서 삭제된 것이 다시 부활하거나 정합성을 헤치는 포인트가 됩니다.

(*) 지금 일하는 팀에서는 Oracle DB를 쓰고, sequence 기반 채번을 하기 때문에 해당사항이 없었습니다.

-> **MySQL Auto Increment ID는 재사용될 수 있다.**

---

## 3. JPA OneToOne과 Lazy Loading

`@OneToOne(fetch = FetchType.LAZY)`라 해도 항상 지연 로딩이 되지 않습니다.
Proxy는 null을 값으로 가질 수 없으므로, 외래키를 알 수 없는 상황(연관관계 주인이 아니면서 `optional = true`)에서는 Eager로 동작합니다.

(*) Lazy Load 메커니즘으로 Bytecode Enhancement를 쓰면 해결되는 것으로 알고 있습니다.

-> **@OneToOne(fetch = FetchType.LAZY)도 조건에 따라 Eager로 바뀔 수 있다.**