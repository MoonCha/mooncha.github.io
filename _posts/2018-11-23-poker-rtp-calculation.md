---
title: Video Poker RTP 계산기 구현에 대한 기록
author: MoonCall
layout: post
categories: [NOTE_MISC, NOTE_MATH]
---

회사에서 주어진 일 중 하나로 비디오 포커에 대한 Return To Player(이하 RTP)계산을 맡은적이 있다.

RTP는 유저가 한 게임에 1의 금액을 투입했을 때 얻을 수 있는 평균 기대 보상량이라고 보면 된다.

일반적인 슬롯 머신의 경우 유저가 할 수 있는 동작은 그저 배팅 금액을 정하고 스핀을 돌리는 것 뿐이기에 고정된 RTP값을 가진다.

하지만 비디오 포커의 경우 유저의 선택에 따라서 달라지기 때문에, 유저가 RTP를 최대화시키는 플레이를 한다고 가정하고 계산하기로 결정했다.

처음에는 기본적인 포커 룰도 알지 못해서 일의 시작은 포커 룰을 알아가는 것부터 시작되었다.

물론 포커룰을 익히는 것은 그리 오래 걸리지 않았지만, 이 일의 가장 큰 문제는 유저가 RTP를 최대화시키는 플레이를 어떻게 아냐는 것이었다.

처음에는 아무 생각없이 brute force를 통해 이상적인 카드 교환을 구현했지만, 너무 느려서 곧장 폐기 되었다.

여러 문서를 봐가면서 최종적으로는 [Wizard of Odds - My Methodology for Video Poker Analysis](https://wizardofodds.com/games/video-poker/methodology/)의 글에서 소개하는 구현 알고리즘을 그대로 구현했다.

구현 조건 중에는 `임의의 족보(ex: 4 Spade Aces)를 포함하여 계산 가능해야 함`도 있었기 때문에, [문양의 구분이 없는 족보만 존재하는 경우 컴퓨팅 타임을 약 95% 줄이는 방법](https://arxiv.org/pdf/1602.04171.pdf)은 적용하지 않았다. [Wizard of Odds - My Methodology for Video Poker Analysis](https://wizardofodds.com/games/video-poker/methodology/)에서도 `To cut down the running time to a few days you can avoid analyzing similar hands on the deal.  ... the number of different kinds of starting hands can be cut from 2,598,960 to 134,459.` 라고 소개하고 있다.

결과물을 보고 싶은 사람이 있을지는 잘모르겠지만, 위 과정을 거쳐서 만든 Video Poker RTP Calculator는 [GitHub Repository](https://github.com/MoonCall/video-poker-calculator)에 올려두었다. 코드가 뒤죽박죽 섞여 어지러운 상태지만, 시간이 나면 정리해두려고 한다.

---

참고한 페이지의 설명이 생각보다 자세하게는 안되어 있어서(카드 패를 버린 후 나올 수 있는 경우를 계산하는 부분, Step 5 ~ Step 9) 고민하다가 생각을 수식으로 표현하면 나오는 부분을 노트해 두었는데, 아마 맞을 것 같긴 하지만 다음에 할 일이 없으면 증명해 봐야 할 것 같다.

$$ \binom{m}{n} = \sum_{k=0}^{n} (-1)^k \binom{n}{k} \binom{m+n-k}{n-k} $$

> for this case, m = 47, n = discarded card amount, which means hand result should have case_count of combination(47, discardedCardAmount)

[위 식을 Wolfram Alpha에 넣어본 결과](https://www.wolframalpha.com/input/?i=summation+of+(((-1)%5Ek)+*+(n+choose+k)+*+((m%2Bn-k)+choose+m))+from+k+%3D+0+to+n)

식이 나온 논리의 흐름은 다음과 같다.

52장의 덱에서 5장을 뽑은 후 이 중 $$n$$장의 특정 카드를 다시 뽑은 카드와 교환하는 경우의 수는 $$\binom{47}{n}$$이다. 그리고 이는 교환하지 않는 $$5-n$$장을 제외하고 남은 $$52-(5-n) = 47+n$$장에서 $$n$$장을 다시 뽑을 때 나올 수 있는 경우에서 $$n$$장의 특정 카드가 한 장이라도 포함된 경우를 제외한 것과 동일하므로, 그 경우의 수도 동일하다. 이 경우 $$47+n$$장에서 $$n$$장을 다시 뽑는 경우 나올 수 있는 결과를 집합 $$S$$로 표현하고, 교환되는 카드($$x_{1}, x_{2}, ..., x_{n}$$)가 포함된 경우를 집합 $$X_{1}, X_{2}, ..., X_{n}$$으로 나타내면, $$S - (X_{1} \cup X_{2} \cup ... \cup X_{n})$$이 된다. 그리고 $$S \supset (X_{1} \cup X_{2} \cup ... \cup X_{n})$$ 이므로 $$\mid S - (X_{1} \cup X_{2} \cup ... \cup X_{n})\mid = \mid S \mid -\mid X_{1} \cup X_{2} \cup ... \cup X_{n}\mid$$ 그리고 [합집합의 cardinality를 교집합들의 cardinality를 이용하여 표현하고](https://math.stackexchange.com/questions/2038147/equation-for-cardinality-of-the-union-of-n-sets), 47을 m으로 바꾸면 대충 위와 같은 식이 나온다.

이것이 적용된 것은 아래 코드에 해당하는 부분이다.

```typescript
  getPossibleOutcomeOfHoldingCards(origCardList: TCard[], holdingCardList: TCard[]): IExpectedOutcome {
    /* \binom{m}{n} = \sum_{k=0}^{n} (-1)^k \binom{n}{k} \binom{m+n-k}{n-k} */
    // for this case, m = 47, n = discarded card amount, which means hand result should have case_count of combination(47, discardedCardAmount)
    // WARNING: formula above & this logic is not proved yet!
    const expectedOutcome = this.getExpectedOutcomeFromDiscardValueArray(holdingCardList);
    const expectedOutcomeWithDiscard: IExpectedOutcome = { case_count: expectedOutcome.case_count, result: Object.assign({}, expectedOutcome.result) };
    const discardedCardList = origCardList.filter(function (card) {
      return holdingCardList.indexOf(card) === -1;
    });
    for (const discardedCardListSubset of subsetsWithoutEmpty(discardedCardList)) {
      const impossibleHand = holdingCardList.concat(discardedCardListSubset);
      const impossibleHandResult = this.getExpectedOutcomeFromDiscardValueArray(impossibleHand);
      if (discardedCardListSubset.length % 2) {
        mergeBySubtract(expectedOutcomeWithDiscard, impossibleHandResult);
      } else {
        mergeByAdd(expectedOutcomeWithDiscard, impossibleHandResult);
      }
    }
    return expectedOutcomeWithDiscard;
  }
```