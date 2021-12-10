# 极简解释器

```javascript
function test(i) {
  if(i==0){
  	return 0
  }
  if(i==1) {
    return 1
  }
  return test(i - 2) + test(i - 1)
}

let res = test(7)

console.log(res)
```

## 运行上面这段代码,运行结果如图

![](./img/result.png)

