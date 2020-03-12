---
title: TU Graz에서 수강한 과목에 대한 리뷰
author: MoonCha
layout: post
categories: [MISC]
---

![TU Graz Alte Campus](/assets/images/tu-graz-alte-campus.jpg){:height="500px"}

## TU Graz 과목들의 특징
Graz University of Technology (TU Graz)의 보안랩은 [Meltdown](https://meltdownattack.com/) 취약점 발견 당시 해당 취약점을 리포트한 팀 중 하나였다. 그 이후로도 [ZombieLoad](https://zombieloadattack.com/)와 같은 Side Channel 취약점들을 보고해온 것으로 보인다. 이런 이유때문인지 TU Graz에서는 컴퓨터 보안과 관련된 과목이 세분화되어 다양하게 열렸고, 전체적으로 Side Channel 취약점을 집중적으로 연구하는 편이었던 것 같다.

학부생을 위해서는 Information Security 과목을 통해 컴퓨터 보안과 관련된 전반적인 지식을 배우고, 대학원 과목으로 Embedded Security (주로 Side Channel 취약점을 다루는 듯), Applied Cryptography, Security Aspects in Software Development등의 보안의 세부적인 영역을 다루는 과목이 열렸다. 우리 학교에서는 커리큘럼상 학부생을 위한 보안 과목은 없고, 대학원에서 조차 컴퓨터 보안에 대해 다루는 과목은 거의 없었던 것 같은데 상당히 대조적인 모습이었다. 최근 우리 학교 컴퓨터공학과 과목에서 AI와 관련된 과목이 많아졌는데, 이처럼 과목 구성을 통해서도 최근 학교에서 집중적으로 연구하는 토픽이 무엇인지 알 수 있는 듯하다.

TU Graz에서는 Lecture 과목과 Practice 과목이 분리되어 있어서 원한다면 한 쪽만을 수강할 수도 있었다. Lecture 과목에서는 이론적인 정보 전달만을 목적으로 하기 때문에 보통 과제가 나오지 않았고, Practice 과목에서는 실제 구현 및 적용을 목표로 하기 때문에 과제와 실습으로 구성되어 있다.

## 수강한 과목들

TU Graz에 있는 동안 나는 아래 세 과목을 수강했다.

- Information Security (Lecture)
- Security Aspects in Software Development (Lecture + Practice)
- Applied Cryptography (Lecture + Practice)

## 각 과목에 대한 리뷰

### Information Security

학부생이 듣는 과목으로, Cryptography(암호학)-System Security(BOF, UAF 등)-Network Security(주로 웹) 세 파트로 나누어서 각 파트가 서로 다른 강사에 의해 진행된다. 실습 과목은 듣지 않아서 잘 모르겠지만, Cryptography와 System Security의 경우 CTF 식으로 문제를 풀고 Network Security의 경우 웹 프록시 구현이 과제로 나온 것같다. 들으면 컴퓨터 보안에 대해 어느정도 지식을 얻을 수 있다.

### Security Aspects in Software Development

석사 대학원생이 듣는 과목으로, System Security에 대해서 집중적으로 다룬다. 학교에서 Side Channel 취약점에 대해 집중적으로 연구하기 때문인지, Meltdown이나 Spectre같은 취약점에 대해서도 어느정도 언급된다. Applied Cryptography에 비해 강의 과목과 연습 과목 간에 싱크가 잘 되지 않는 과목이다. 연습 과목에서 풀어야 하는 문제는 후반부 강의에 나오는 지식을 요구하는데, 과제의 데드라인이 해당 강의 이전 이라거나 하는 부분들이 있었다. 그리고 보안 분야의 특성인지는 모르겠으나 가르쳐 주는 것에 비해서 스스로 공부해야 하는 부분이 훨씬 많다. 과제는 총 2개이며, 첫 번째 과제에서는 CTF 형식으로 21가지 문제를 푸는 것이었고 두 번째 과제는 ELF 파일을 읽어서 Section / Segment를 수정하는 라이브러리를 작성하는 것이었다. 첫 번째 과제의 경우 보안 동아리 PLUS 활동을 성실하게 했다면 어렵지 않은 과제가 될 것이지만, 오랜만에 하는지라 어느 정도 애를 먹었다. 보안 관련 지식이 전무한 상태라면 상당히 어려움이 예상된다.

**Note**: 수강생 중 Top 3 안에 들게 되면 트로피 느낌의 작은 기념품을 받는다.

![SASD Awards Slides](/assets/images/tu-graz-sasd-awards.jpg){:height="350px"}
![Iron Ducky](/assets/images/tu-graz-iron-ducky.jpg){:height="350px"}

### Applied Cryptography

컴퓨터 보안의 석사 과정 과목으로, Cryptography 파트를 조금 더 자세하게 배운다. 과목 이름에 맞게 전반적인 Cryptography 지식을 늘릴 수 있고 개인적으로 수업에서 배운 내용을 연습 과목에서 문제를 풀어보면서 이해도를 높이는 구성이 잘 되어 있어 추천하는 과목이다. 수강하게 되면 어느 정도 암호학의 기본 지식을 쌓을 수 있다.
