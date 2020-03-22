---
title: 단기 유학동안 수강한 보안 과목의 CTF 과제 문제 리뷰
author: MoonCha
layout: post
categories: [HACKING]
---

## 2019 Winter: SASD

2019년 2학기, TU Graz로 단기유학을 가서 Security Aspects in Software Development(이하 SASD)라는 과목을 들었다.

SASD는 보안의 여러 분야 중 시스템 해킹을 중점적으로 다루는 석사 과정 과목이다.

보안 과목 답게, 과제 중 하나는 CTF 형식으로 나왔으며 총 21문제가 출제되었다.

전체적으로 PLUS 101이라는 느낌을 많이 받는다. 소스 코드가 주어지기 때문에 PLUS에서 입부 후 한 두번의 방학 스터디를 거치면 큰 어려움 없이 모두 풀어낼 수 있으리라 생각한다. 창피한 일이지만, 당시 CTF를 안한지 너무 오래되어 다 푸는데 꽤나 오래 걸렸다.

문제는
- String (Null Terminator 처리 등)
- Environment (Library Hook, PATH, TOCTOU 등)
- Buffer (ROP 등)
- Heap (UAF와 variable overwite 외 다른 힙 기법은 다루지 않는다)
- Format String Bug
- Bonus (= Reversing)

항목으로 나누어져 있다.

모두 쉬운 문제여서 소개하기 민망하지만 풀었던 21개의 문제 중 그래도 어느 정도 평소 잊고 살았을 수 있거나 환기해보면 괜찮을 문제들을 소개하려고 한다.

## 문제 소개

### [Environment/fast_math](https://github.com/MoonCha/sasd2019g11/tree/master/01_environment/fast_math)

이 문제는 한 프로그램에서 계산을 위해 작성된 별도의 프로그램을 실행시키고, 그 프로그램의 실행 결과값을 받아온 후 보여주는 프로그램이다. 이 처럼 한 프로그램이 다른 프로그램을 실행시킬 때 `setuid`같은 것이 걸려 있다면 특히 주의할 필요가 있는데, 실행되는 별도의 프로그램 또한 같은 권한으로 실행되기 때문이다.

이 문제는 권한 체크를 통해 익스플로잇을 막으려 했지만, [**TOCTOU**](https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use)취약점이 있는 문제이다.

아래는 fast_math 문제의 일부분으로, `setgid`가 걸려 있는 바이너리에서 아래와 같이 특정 바이너리를 실행하려고 할때, 자신의 파일인지 권한 체크 후 실행한다.

[Full Source Code](https://github.com/MoonCha/sasd2019g11/blob/master/01_environment/fast_math/fast_math.c)
```c
  // check file ownership is equal
  if (stat(argv[1], &info_arg) < 0 ||
      stat("main.elf", &info_main) ||
      info_arg.st_uid != info_main.st_uid)
  {
    printf("executable owner is wrong\n");
    exit(-1);
  }

  // Do Something
  ...

  execv(argv[1], argv);
```

이 경우, 처음에는 Symbolic Link로 파일 오너 체크를 통과한 후, *// Do Something* 부분이 실행되는 동안 `argv[1]`으로 전달된 파일을 자신의 파일로 바꿔치는 공격을 할 수 있다.

[+] 보자마자 눈치챈 사람도 있겠지만, 굳이 TOCTOU를 이용하지 않아도 원하는 파일을 실행할 수 있다. 하지만 과제기 때문에 당신은 Intended Solution으로 풀어야 했을 것이다.

### [integer/card_game](https://github.com/MoonCha/sasd2019g11/tree/master/03_integer/card_game)

다음 코드에서, `a == -a`가 참인 경우는 몇 가지일까?

별 고민 없이 생각한다면 아마 1개라고 대답할지 모르겠다.

```c
int32_t a = ???;
if (a == -a) {
    // OK!
}
```

하지만, 위 조건을 만족하는 숫자는 **2**개이며 나머지 하나는 $$-(2)^(31)$$, `INT32_MIN`이다.

이처럼 사칙연산 외에도 `-`(negate)에서도 Overflow가 발생할 수 있다는 점을 명심하며, 숫자의 표현 범위가 정해져 있는 언어의 경우 항상 Overflow를 고려해서 로직을 짜야한다.

그러면 이 사실을 명심하며, 직소와의 카드 게임에서 이겨보면 된다.

![Jigsaw](/assets/images/jigsaw-head.png){:height="300px"}

```
Let's play a game:
There are 3 piles of cards.
In each turn you may pick any positive number of cards from one pile only.
If you take the last card you win.
Round 1
piles[0] = 7
piles[1] = 11
piles[2] = 12
Pick a pile: 
```

### [bonus/turing_completeness](https://github.com/MoonCha/sasd2019g11/tree/master/06_bonus/turing_completeness)

전형적인 리버싱 문제이다. 바이너리에서 요구하는 알맞은 인풋을 찾아서 입력하면 Flag가 나오게 되어있다.

일차적으로 바이너리가 굉장히 커서 겁을 먹게 되고, 열면 일반적인 바이너리와 달리 첫 부분에서 `sigaction`과 함께 특이하게도 `mov`들로 도배되어 있는 것을 확인할 수 있다.

이 문제는 프로그램이 어떤 난독화 툴로 난독화 되었는지 알아내는 것에서 부터 시작한다. 난독화된 상태로 그대로 리버싱을 진행하는 방법도 있지만, 프로그램의 flow가 어떻게 이루어지는지 파악하기가 굉장히 어렵기 때문에 쉽지 않다. 기본적으로 난독화된 상태에서는 Flow Graph가 그려지지 않는다. 그와 동시에 동적 디버깅을 실행해보면 flow가 어떻게 이어지는지 매우 혼란스럽다. 물론 짱해커들은 어떻게든 잘 해내겠지만.

![Obfuscated turing_completeness](/assets/images/obfuscated-turing_completeness.png){:height="500px"}


아무튼, 이러한 난독화에 대응할 방법을 찾기 위해 구글리을 하다보면 `mov` instruction이 turing complete하다는 점을 이용하여 만들어진 [`movfuscator`](https://github.com/xoreaxeaxeax/movfuscator)로 난독화 되어 있음을 알게된다.

그리고 머지 않아 [`demovfuscator`](https://github.com/kirschju/demovfuscator)라는 툴이 있다는 것을 알게될 것이다.

다만, 패키지 관리자를 통해 편리하게 내려받을 수 없는 dependency들이 존재하기 때문에 설치 자체에 상당한 귀찮음이 있을 것이다.

`demovfuscator`를 이용하고 나면 아래와 같이 Flow Graph를 볼 수 있게 되며, 평소에 하던대로 로직 분석을 통해 알맞은 인풋을 찾아내면 된다.

![Demovfuscated turing_completeness](/assets/images/demovfuscated-turing_completeness.png){:height="500px"}










