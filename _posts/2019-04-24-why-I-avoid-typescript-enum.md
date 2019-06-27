---
title: 내가 Typescript의 Enum을 쓰지 않는 이유
author: MoonCall
layout: post
categories: [NOTE_IT]
---

회사에서 기존 자바스크립트던 코드를 타입스크립트로 포팅한 이후로, 꾸준히 타입을 써가면서 타입 시스템의 혜택을 보기 위해 바꾸어 나가고 있다.

기존 코드에는 아래와 같이 오브젝트의 Key-Value로 enum을 시뮬레이션 해서 사용하고 있었다.

```javascript
const ITEM_TYPE = {
    COIN: 1,
    GEM: 2,
    SWORD: 3,
};
```

그리고 이를 이제 Typescript 형태로 바꾸자면, 이를 다음과 같이 enum으로 바꿀 수 있겠지만 나는 이를 두 가지 이유로 선호하지 않는다.

```typescript
enum ITEM_TYPE {
    COIN = 1,
    GEM = 2,
    SWORD = 3,
}
```

첫 번째, Typescript의 enum은 `number`과 서로 assignable한 관계에 있다. 즉,

```typescript
enum Fire {
    FIFI = 1,
    FOFO = 2,
}
const aa: number = Fire.FIFI; // OK
const bb: Fire.FIFI = 3; // OK
const cc: Fire = 4; // OK
```

위 코드는 컴파일 에러를 일으키지 않는다. 따라서 임의의 숫자를 넣는 등 valid한 enum값이 아니어도 타입 에러로 처리되지 않는다. 이러한 동작이 굉장히 의아할 수 있는데, 그래서 그 만큼 [Typescript Github Issue](https://github.com/microsoft/TypeScript/issues/26362)에서도 여러 중복 이슈가 올라올 만큼 꽤나 핫한 주제였던 것 같다. 결론만 말하자면 Flag Enum(bit operator를 이용해서 여러 enum을 동시에 표현. 예를 들면 3은 위 `Fire` enum에서 `Fire.FIFO | Fire.FOFO`가 된다.)을 지원하기 위해 어쩔수 없이 허용된 동작인듯 하다. 개인적으로는 굉장히 마음에 들지 않는다.

다만 그렇다고 해서 enum이 number와 차이점을 가지지 않는 것은 아니다. enum과 number 사이에는 assignable한 관계가 있지만, 서로 다른 종류의 enum 사이에서는 assignable하지 않다. 예를 들면 아래와 같은 코드는 타입 에러를 일으킨다.

```typescript
enum Fire {
  FIFI = 1,
  FOFO = 2,
}
enum Water {
  WIWI = 1,
  WOWO = 2,
}
const aa: Fire = Water.WIWI; // error!
const bb: Fire.FIFI = Water.WIWI; // error!
```

둘 째, number enum은 reverse map을 가진다.

reverse map이 있으면 더 좋은 것 아니냐고 할 수 있지만, 원래 코드에서 아래와 같은 패턴이 자주 사용되고 있었기 때문에 기존 enum 시뮬레이션들을 Typescript enum으로 바꾸는데 장애가 있었다.

```javascript
const Fire = {
    FIFI: 1,
    FOFO: 2,
};
for (const key in ITEM_TYPE) {
    console.log(key);
}
```

위의 경우

```plain
FIFI
FOFO
```

라는 결과가 나오게 될 것이다.

하지만 위의 Fire를 앞선 enum으로 바꾸는 경우, 아래 와 같은 결과가 나타난다.

```plain
1
2
FIFI
FOFO
```

그래서 오브젝트에 `for ... in` 구문을 써서 key iteration 하는 패턴으로 코드를 작성해온 팀에서 enum을 사용한다면 의도치 않게 버그를 발생 시킬 위험이 농후해 보였고, 그래서 기존의 enum 시뮬레이션을 Typescript의 enum으로 전환하지 않았다.

하지만 기존의 enum 시뮬레이션을 그대로 사용하는 경우, 서로 다른 enum간에 assignable하지 않은 특성을 가지지 못한다. 그래서 우리는 `const enum` 사용을 고려해 보았다. `const enum`으로 생성된 enum은 오브젝트가 아니기 때문에 `for .. in` 구문에 활용할 수 없고, 기존 enum과 동일하게 서로 다른 enum type에 대해 assignable하지 않은 특징을 지닌다. 따라서 key iteration이 필요 없는 경우에는 `const enum`을 이용해 작성하고, key iteration이 필요한 경우는 기존의 enum 시뮬레이션의 형태로 코드를 작성하기로 했다.

---

혹자는 discriminated union에 이용하기위해 enum이 필요하지 않냐고 주장할 수 있지만, 기존의 javascript식 enum에서도 적절히 타입을 써주면 discriminated union을 위한 enum처럼 활용할 수 있다.

```typescript
const ITEM_TYPE: {
    COIN: 1,
    GEM: 2,
    SWORD: 3,
} = {
    COIN: 1,
    GEM: 2,
    SWORD: 3,
};
```

위와 같이 기존 값을 복사하여 그대로 type notation으로 활용하면 `ITEM_TYPE.COIN`, `ITEM_TYPE.GEM`, `ITEM_TYPE.SWORD` 각각이 `number`가 아니라 `1`, `2`, `3` 타입으로 취급되면서 discriminated union에 사용할 수 있다.

하지만 위의 notation이 굉장히 이상하게 보일 수 있다. 그리고 이러한 형식으로 타입을 표기하는 경우가 꽤나 있었는지 Typescript 3.4부터 [`const assertion`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)이라는 기능이 생겼다. 그래서 이제 아래와 같이 훨씬 간결하게 위와 동일하게 타입을 작성할 수 있다.

```typescript
const ITEM_TYPE = {
    COIN: 1,
    GEM: 2,
    SWORD: 3,
} as const;
```

그리고 `TValues<T>` 같은 타입을 선언해서 사용하면 적어도 enum 시뮬레이션의 범위를 벗어나는 숫자는 대입할 수 없게 방지할 수 있다.

```typescript
type TValues<T> = T[keyof T];
const ITEM_TYPE = {
    COIN: 1,
    GEM: 2,
    SWORD: 3,
} as const;
let itemType: TValues<typeof ITEM_TYPE>;
itemType = 4; // error!
```

물론 가능하면 `const enum`을 쓰는게 훨씬 나아 보인다.
