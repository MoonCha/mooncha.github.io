---
title: Memo] JS Promise resolve 결과로 Promise를 주는 경우 동작
author: MoonCha
layout: post
categories: [JAVASCRIPT]
---

**요약:** Promise의 resolve parameter로 새로운 Promise를 주면 기존 Promise가 resolve의 parameter로 전달된 Promise로 갈아 치워진다.

```javascript
> var a = new Promise((resolve) => resolve(new Promise((resolve) => resolve(new Promise(resolve => resolve("hi"))))));
undefined
> a.then(hi => console.log(`hi, ${typeof hi}`));
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
```

이 다음 콘솔에 찍히는 것은

```
> hi, string
```

이다. 이와 관련하여 타입 스크립트에서 type notation을 적었을 때

```typescript
const a: Promise<Promise<Promise<string>>> = new Promise((resolve) => resolve(new Promise((resolve) => resolve(new Promise(resolve => resolve("hi"))))));
```

와

```typescript
const a: Promise<string> = new Promise((resolve) => resolve(new Promise((resolve) => resolve(new Promise(resolve => resolve("hi"))))));
```

중 올바른 것은 두 번째 것이다.

이런 패턴으로 Promise를 안쓰다보니 몰랐는데, 오늘 코드 리뷰 하면서 동작이 기대한 것과 다른 부분이 있어서 테스트해 본 결과 알게 되었다.

[then/promise github의 README.md](https://github.com/then/promise#user-content-new-promiseresolver)에 따르면 resolve의 결과로 Promise가 오면 기존 Promise가 파라미터로 전달 된 Promise로 갈아치워 지는 듯 하다.

> ### new Promise(resolver)
>
> This creates and returns a new promise. `resolver` must be a function. The `resolver` function is passed two arguments:
>
> `resolve` should be called with a single argument. If it is called with a non-promise value then the promise is fulfilled with that value. If it is called with a promise (A) then the returned promise takes on the state of that new promise (A).
>
> `reject` should be called with a single argument. The returned promise will be rejected with that argument.
