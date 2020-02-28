---
title: 웹 커뮤니티 자동 출석기 개발 일지 (1)
author: MoonCha
layout: post
categories: [DEVELOPMENT, PROJECT]
---

최근 남는 시간에 프로그래밍 연습도 하는 겸, 평소에 어느 정도 필요했던 것을 만들어 보기로 했다.
연습을 위해 별로 필요도 없는걸 만드는건 흥미가 살지 않아서 오래 가지 않았기 때문에, 실제로 사용할 만한 것을 생각해보았다.

평소에 들어가는 사이트로 [코인판](https://coinpan.com)이 있는데, 최근에는 암호화폐 가격확인과 핫이슈 확인 정도를 위해 종종 방문하고 있다.

그리고 방문하면 매일 출석 도장을 찍을 수 있는데, 레벨업에 필요한 포인트를 준다.

레벨업을 하면 뭐가 좋으냐? 일단 겉으로 드러나는 혜택은 높아지면 VIP게시판에 접근할 수 있다고 한다. 혹은 `ㅉㅉ 렙도 낮은 코린이가`라는 말을 시전할 수 있을지도 모르겠다.

그런데 뭐 사실 결국 큰 의미는 없다.

그래도 이것보다 의미 있는 것은 더더욱 없는 듯하여 `코인판 자동 출석기`로 주제를 정했다.

그리고 [puppeteer](https://github.com/GoogleChrome/puppeteer)라는 쓰기 편한 headless chrome을 쓰기로 하고, 이에 따라 Typescript로 개발했다.

지금 생각해보니 최근 회사에서 Typescript만 써서 Python쓸 일이 잘 없는데, Python도 연습하는 겸 Python-Selenium으로 할 걸 그랬나 싶기도 하다.

뭐 어찌 되었든 코인판을 짜고 나니, 나는 인벤도 자주 접속한다는 사실을 발견했고, 인벤에서 매일 출석하고 이니 모아서 경품 응모하는게 훨씬 유용해 보였다.

그래서 프로젝트 이름을 `자동 출석기`로 변경하고 인벤 자동 로그인 + 출석 + 주간 게임 투표를 하는 기능도 추가했다.

이렇게 된 김에 다른 유용한 여러 사이트 자동 출석도 넣고, 코인 랜딩봇처럼 웹 페이지로 잘 돌아가고 있는지 로그 확인할 수 있게 만드는 것도 괜찮을 것 같다.

라고 생각하던 도중, Ubuntu에서 테스트 해 본 결과 여러가지 depencency가 상당히 많다는 점을 발견했고, 초기 환경 세팅이 복잡하므로 dockerize 해야겠다는 계획을 세웠다.

Ubuntu 테스트는 개인 AWS EC2 인스턴스에서 진행했는데, 이상하게 coinpan에서 nginx 403 forbidden 페이지가 나오는 것을 발견했다. (개발은 Windows에서 해서 몰랐었다.)

처음에는 Linux버전과 Windows버전의 Chromium구현 차이로 Coinpan에 있는 headless blocker가 작동한게 아닐까 싶었는데, Windows에서 Ubuntu EC2 인스턴스로 SSH 터널링을 하고 코인판에 접속해 본 결과 마찬가지로 403 Forbidden이 발생했다.

아마 AWS쪽 IP를 차단한 것으로 추측된다. Chrome Extension의 Proxy를 써서 접속해도 잘 접속되던 사이트가 왜 하필 AWS일까? 싶지만 뭐 어쩌겠는가.

개발은 Windows에서 했지만 컴퓨터를 항상 안정적으로 켜두기는 힘들어서 AWS EC2 인스턴스에서 돌릴 계획이었는데, 큰 문제가 발생했다.

이로서 IP 차단 우회 기능도 넣어야 하게 되버렸다. 외부 서버 depencency없이 만들고 싶은데, 외부 Proxy server만드는 것 정도를 제외하고는 방법이 잘 떠오르지 않는다.

(갑자기) 글을 쓰다보니 생각난 건데, gmarket같은 사이트 출석도 자동화 하면 포인트 한 10원 정도씩 쌓이니까 그것도 나쁘지 않을 듯하다.

하지만 당장은 아래처럼 TODO LIST를 만들고 순서대로 진행해볼 생각이다.
* Coinpan AWS ip block bypass
* Dockerize
* Web Log Viewer

아직 설명도 제대로 안되어 있는 것에 관심있는 사람이 있을지는 모르겠지만, [Git repo Link](https://github.com/MoonCha/auto-attendance-checker)에서 볼 수 있다.
