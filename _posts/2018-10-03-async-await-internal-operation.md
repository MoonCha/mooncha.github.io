---
title: 어느 날 일하면서 알게된 Promise 내부 동작의 일부
author: MoonCall
layout: post
categories: [NOTE_IT]
---

나는 보통 새 프로그래밍 언어를 입문할 때 튜토리얼 페이지를 보면서 기초부터 쌓아올리는 방식을 쓰지 않는다. 이미 작성된 코드나 예시 코드만 보고 대충 추측하고, 언어 syntax나 기능 사용에 문제가 부딪치면 그 때서야 찾아보는 편이다.
그리고 이 방식은 새로운 library를 사용할 때도 적용되는데 이번에 이러한 방식 때문에 잠깐 혼란에 빠졌다.

knex라는 Javscript query builder를 사용할 때였다.
기존에 작성되어 있던 코드는 대충 이런 구조로 되어 있었다.
```javascript
const knex = require('knex');

const client = knex({
  client: 'mysql2',
  /* ... omitted ... */
});

const TABLE_NAME = 'my_table';

function getRowListById(id) {
  return client
    .select()
    .from(TABLE_NAME)
    .where({
      id: id,
    });
}

function getAllRowList() {
  return client.select().from(TABLE_NAME);
}
```

그리고 이 함수들을 db라는 변수로 import했다고 가정하면, 이렇게 사용하고 있다.

```javascript
const rowList = await db.getDebugSpinListByGameId(gameId);

const allRowList = await db.getAllRowList();
```

내 머리속의 await은 `await (something: Promise<any> | string | number | boolean ...)`과 같은 모호한 형태로 그 사용법이 정해져 있었다.
현재 await을 통해서 값을 받아오고 있고, knex가 db로 쿼리를 날리고 row를 받아오는 과정은 async하게 일어날 것이므로 getRowListById와 getAllRowList는 모두 Promise를 반환하리라 생각했다.
그런데 이 함수들이 Promise를 반환한다고 가정하면, knex의 구현에 의문이 생긴다.

knex는 `client.select().from(TABLE_NAME)`의 호출 만으로 Promise 반환과 함께 query & fetch를 수행하는데, 동일한 구문에 `.where({id: id})`가 하나 더 붙은 것은 어느 타이밍에 query를 시도하냐는 것이다.
orm처럼 `.execQuery()`가 마지막에 호출되면 모를까, 쿼리 빌드를 수행하고 쿼리를 DB에 날리는 시점이 불분명하다.

그래서 처음에 생각한 가설은 아래 정도였다.

1. `WHERE`을 쿼리에 넣지 않고, `client.select().from(TABLE_NAME)`의 결과에서 JS 로직으로 `id` filter를 한다.
2. call chain 사이에는 그리 크지 않은 시간차가 있을 것이므로, 각 call이 들어올 때마다 다음 쿼리 빌드 호출을 일정시간 기다린다.

`1.`의 방법은 query builder라고 칭할 수 없는 멍청한 동작이고, `2.`는 불안정하고 퍼포먼스도 구린, 차마 입에 담을수 없는 동작이다.
그래서 이 의문은 잠시 미궁에 빠졌다. 하지만 곧 이들 함수는 Promise를 반환하는 것이 아니라는 것을 알게됐다.

![Return type of getRowListById](/assets/images/getRowListByIdReturnType.png){:width="500px"}

Knex.QueryBuilder라는 유사 Promise를 반환한다. 그러면 마지막으로 추정할 수 있는 것은 `await (something: Knex.QueryBuilder)`가 어떤 동작을 하냐는 것이다.
await이 Knex.QueryBuilder의 `then` property를 호출한다고 하면 `then`이 `.execQuery()`와 같은 역할을 수행할 수 있다고 생각한다.

아래는 knex documentation중 then에 대한 항목이다.

![Knex Then Document](/assets/images/knexThenDocument.png){:width="500px"}

빙고. `then`이 호출되면 그 때 쿼리 빌드를 끝내고 내부적으로 Promise와 동일하게 동작을 수행하는 듯 하다.

즉, await이 하는 일은 operand의 then proeprty가 함수인 경우 이를 호출하고, then에 넘겨준 함수가 호출 되기를 기다리는 것이 되겠다.

따라서 다음 코드는 HI를 콘솔에 호출하고, a는 1이 된다.

```javascript
const a = await { then: function(f) { console.log("HI"); f(1); } };
```

`onrejected`의 경우는 어떤 동작을 할지 생각을 안해봤는데, async/await + Promise 구현이 어떻게 되어있는지 보는 것이 정확할 것 같다.

---

JS에는 마법같은 동작이 많다.

```javascript
const a = [1, 2, 3];
a.length = 0;
/* a becomes empty list */
```
같은 것이나 `Object.defineProperties`로 getter나 valueOf property에 side effect 있는 함수를 넣는 것도 한 예라고 할 수 있겠다.

다만 `[]+[]`나 `[]+{}`같은 형태의 해괴한 동작을 하는 코드는 한 눈에 보기에도 이상하고, 사용하지 않을 코드이고, 타입 스크립트에서는 사용하지도 못할 코드라서 괜찮다.

물론 알아 두면 개발자끼리 장난칠 때는 좋다.

이러한 동작을 배울 만한 사이트로 [return true to win](https://alf.nu/ReturnTrue)이라는 JS 퀴즈 문제 사이트가 있다.

앞의 몇 문제만 풀고, 그 이후에는 안했었는데 시간 날 때 풀어보면 JS 마법 세계를 이해하는데 도움이 될 듯하다.
