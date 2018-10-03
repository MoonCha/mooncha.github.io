---
title: 어느 날 일하면서 알게된 Promise 내부 동작의 일부
author: MoonCall
layout: post
categories: [NOTE_IT]
---

```javascript
await { then: function(f) { console.log("HI"); f(1); } };
```
