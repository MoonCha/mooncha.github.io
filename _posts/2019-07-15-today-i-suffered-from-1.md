---
title: Today I Suffered From (1) - Unity LPWStr(wchar_t*) marshalling causes memory violation
author: MoonCall
layout: post
categories: [UNITY, C++]
---

### Today I Suffered From

최근 Windows Store 출시를 위해 Unity WSA로 빌드를 하게 되었고, IL2CPP를 이용한 결과물이 프로젝트로 나온다. 그리고 이를 기반으로 C++ Plugin을 작성하여 결제를 지원하도록 수정중이다.

Unity에서는 C# 을 사용하는 반면, Plugin에서는 C++을 사용하므로 Plugin의 함수를 호출하거나 return value를 받을 때 C#에서 필연적으로 [Marshalling](https://en.wikipedia.org/wiki/Marshalling_(computer_science))을 하게 되는데, 주로 `string`(C#) <--> `wchar_t *`(C++) 사이의 Marshalling이 빈번하게 일어났다.

그러던 중, 3336길이를 가지는(= `wchar_t`가 2byte이고, null이 포함되므로 총 1667글자) 문자열을 C++ Plugin에서 반환하고, C# 코드에서 Marshalling된 string을 사용하려 했더니, Memory Access Violation 에러들이 났다. 그런데 매 번 동일한 패턴이 아니고 여러 군데에서 터지는 문제가 발생했다.

이상한 것이 기존에도 `wchar_t *` --> `string` 변환은 이미 작성한 다른 코드들에서 문제 없이 동작하고 있었는데, 이 곳에서 문제가 매 번 발생하는 것으로 보아 길이가 특정 길이 이상이면 메모리 관리가 이상해지는 것으로 추정했다.

일단은 이를 빠르게 수정할 방법은 찾을 수가 없어서, 다른 방법을 찾아보기로 했다. 다른 C++ Plugin에서 아주 긴 문자열도 보낸 기억이 있는데, Unity의 `SendMessage`를 이용해 Callback을 부를 때, parameter로 `wchar_t *`를 Marshalling하는 경우는 문제가 없는 것이 생각나서 일단 그런 식으로 우회해 두었다.

그래도 일단은 `wchar_t *`를 return value로 주는 경우가 문제를 일으키는지 확인해보기 위해 이를 테스트 하기 위한 Minimal Unity Project를 만들었다.

### Unity Project 테스트

먼저, 테스트를 위해 아래와 같이 빈 프로젝트를 만들고 Text UI하나를 놓았다.

![Sample Project Scene for Marshalling Test]({{ 'assets/images/unity-project-scene-for-marshalling-test.png' | relative_url }} "Sample Project Scene for Marshalling Test")

그 다음, C++ Plugin에서 받아온 `string`을 화면에 보여주도록 만들었다.

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
​
using System.Runtime.InteropServices;
​
public class MarshalledStringTester : MonoBehaviour
{
#if UNITY_WSA && !UNITY_EDITOR
    [DllImport("__Internal")]
    [return: MarshalAs(UnmanagedType.LPWStr)]
    private static extern string getMarshalledString();
​
#endif
    // Start is called before the first frame update
    void Start()
    {
    }
​
    // Update is called once per frame
    void Update()
    {
#if UNITY_WSA && !UNITY_EDITOR
        string marshalledString = getMarshalledString();
        GetComponent<UnityEngine.UI.Text>().text = marshalledString;
#endif
    }
}
```

C++ Plugin으로는 아래와 같이 길이를 늘려가면서 `wchar_t *`를 반환하게 만들었다.

```c++
#include <iostream>
#include <Windows.h>
​
const wchar_t* toUnityString(const wchar_t* srcData) {
	ULONG  ulSize = (wcsnlen_s(srcData, 100000) * sizeof(wchar_t)) + sizeof(wchar_t);
	wchar_t* pwszReturn = (wchar_t*)::CoTaskMemAlloc(ulSize);
	// Copy the contents.
	wcscpy_s(pwszReturn, ulSize, srcData);
	return pwszReturn;
}
​
std::wstring astr = L"";
​
extern "C" {
	const wchar_t* _stdcall getMarshalledString() {
		astr = astr + L"a";
		std::wcout << wcsnlen_s(astr.c_str(), 100000) << std::endl;
		return toUnityString(astr.c_str());
	}
}
```

### 실행 결과

![Memory Violation After Marshalled String Return 1]({{ 'assets/images/memory-violation-after-marshalled-string-return-1.png' | relative_url }} "Memory Violation After Marshalled String Return 1")
![Memory Violation After Marshalled String Return 2]({{ 'assets/images/memory-violation-after-marshalled-string-return-2.png' | relative_url }} "Memory Violation After Marshalled String Return 2")
![Memory Violation After Marshalled String Return 3]({{ 'assets/images/memory-violation-after-marshalled-string-return-3.png' | relative_url }} "Memory Violation After Marshalled String Return 3")
![Memory Violation After Marshalled String Return 4]({{ 'assets/images/memory-violation-after-marshalled-string-return-4.png' | relative_url }} "Memory Violation After Marshalled String Return 4")

뭔가 실행할 때 마다 다른 곳에서 다양하게 죽는 것을 확인할 수 있다.

정확한 원인은 모르겠지만 Marshaling된 string을 이용할 때 아무튼 메모리가 개판이 되는 것은 확실하다.

이미 Windows Store 관련 개발로 너무 많은 시간을 끌어 버려서 일단은 되는 방법으로 조치해두고, 시간을 더 투자해서 해결법이나 원인을 제대로 찾지는 못해서 Today I Suffered From(TISF)로 제목을 지었다.
