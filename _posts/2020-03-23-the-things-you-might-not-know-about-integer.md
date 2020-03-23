---
title: 당신이 C integer에 대해 몰랐을 만한 것들
author: MoonCha
layout: post
categories: [DEVELOPMENT]
---

당신이 C언어의 Integer에 관해 몰랐을 만한 내용들을 소개합니다.

알고 있었다면 어쩔수 없구요.

## **1. Integer overflow standard behavior**

### - `signed int`의 overflow 동작은 undefined behavior이다.

> If during the evaluation of an expression, the result is not mathematically defined or not in the range of representable values for its type, the behavior is undefined. - [5/4](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2013/n3690.pdf)

위 처럼 C++ Standard에 따르면 계산 결과가 데이터 표현 범위를 벗어나는 경우의 동작은 정의되어 있지 않다.

### - `unsigned int`의 overflow 동작은 standard로 명시되어 있다.

> Unsigned integers shall obey the laws of arithmetic modulo 2
n where n is the number of bits in the value
representation of that particular size of integer. - [3.9.1/4](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2013/n3690.pdf)

> This implies that unsigned arithmetic does not overflow because a result that cannot be represented by the resulting
unsigned integer type is reduced modulo the number that is one greater than the largest value that can be represented by the
resulting unsigned integer type. - [3.9.1/4 - annotation](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2013/n3690.pdf)

그러나 `unsigned int`의 경우 계산 후 $$\mod 2^{n}$$를 취하는 것이 standard로 정의되어 있어 일반적으로 기대하는 동작을 한다.

### 일반적인 가정

많은 경우 C 프로그램들은 int가 overflow하면 2의 보수하의 연산 후 $$\mod 2^{n}$$를 취하는 동작을 한다고 가정하고 작성되어 있다. [ref](https://www.gnu.org/software/autoconf/manual/autoconf-2.64/html_node/Integer-Overflow-Basics.html)

## **2. Integer overflow by negation**

### - `-`(negation)에 의해서도 integer overflow가 발생한다.

`-INT_MIN`은 `int` 표현 범위를 벗어난다. (일반적으로 `-INT_MIN == INT_MIN`이 된다.)

### - `/`(division)에 의해서도 integer overflow가 발생한다.

`/ -1`은 negation과 동일하다. 따라서 `INT_MIN / -1`은 `int` 표현 범위를 벗어난다.

## **3. How to effectively check overflow**

### - DIY overflow check

```c
int secure_calculate(long int n1, long int n2, char* op, long int* result) {
  ...

  if (!strcmp(op, "*")) {
    if (n1 > 0 && n2 > 0) {
      /* Check for overflow */
      /* n1 * n2 > LONG_MAX */
      if (n1 > LONG_MAX / n2) {
        return -1;
      }
    } else if (n1 < 0 && n2 < 0) {
      /* Check for overflow */
      /* n1 * n2 > LONG_MAX */
      /* Bringing a negative n2 to the rhs inverts the inequation */
      if (n1 < LONG_MAX / n2) {
        return -1;
      }
    } else if (n1 < 0 && n2 > 0) {
      /* Check for underflow */
      /* n1 * n2 < LONG_MIN */
      if (n1 < LONG_MIN / n2) {
        return -1;
      }
    } else if (n2 < 0 && n1 > 0) {
      /* Check for underflow */
      /* n1 * n2 < LONG_MIN */
      if (n2 < LONG_MIN / n1) {
        return -1;
      }
    }
    *result = n1 * n2;
  }

  ...

  return 0;
}
```

고려할 것도 많고 실수할 것도 많다. 하지 말자.

### - Compiler built-in overflow check functions

컴파일러에서는 계산시 Overflow가 발생했는지 알려주는 built-in functions가 존재한다.

이를 활용해보자.

**GCC**: https://gcc.gnu.org/onlinedocs/gcc/Integer-Overflow-Builtins.html

```c
int secure_calculate(long int n1, long int n2, char* op, long int* result) {
  ...

  if (!strcmp(op, "*")) {
    if (__builtin_smull_overflow(n1, n2, result)) {
      return -1;
    }
  }

  ...

  return 0;
}
```

## **4. implicit conversion between signed and unsigned integers**

### - signed <> unsgined 계산시 항상 signed가 unsigned로 conversion 되지는 않는다.

C를 배울 때 unsigned와 signed 타입 int간의 연산이 발생하면 signed integer가 unsigned로 전환된다고 배우는 것 같다. 많은 경우 그렇게 계산 되기 때문에 그렇게 생각할 수도 있지만, 이것은 사실이 아니다.

### - signed로 전환되는 경우

> ... Otherwise (the signedness is different, and the unsigned type has conversion rank less than the signed type): If the signed type can represent all values of the unsigned type, then the operand with the unsigned type is implicitly **converted to the `signed` type**.
Otherwise: Both operands undergo implicit conversion to the unsigned type counterpart of the signed operand's type. - [cppreference](https://en.cppreference.com/w/c/language/conversion)

위 글에서 글에서 알 수 있듯, signed <> unsigned implicit conversion은 표현 범위에 의해 결정되며, signed 타입이 unsigned 타입의 표현 범위를 모두 포함하는 경우 `signed`로 implicit conversion이 발생한다.

```c++
#include <iostream>
signed int s1 = -3;
unsigned int u1 = 1;
signed long int s2 = -3;
unsigned int u2 = 1;
signed long long int s3 = -3;
unsigned long int u3 = 1;
int main(int argc, char** argv) {
    std::cout << (s1 + u1) << "\n";
    std::cout << (s2 + u2) << "\n";
    std::cout << (s3 + u3) << "\n";
}
```

실행 결과는 아래와 같다.

```
4294967294
-2
18446744073709551614
```

