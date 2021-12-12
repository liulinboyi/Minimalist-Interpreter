function test(i) {
    if (i == 0) {
        return 0
    }
    if (i == 1) {
        return 1
    }
    return test(i - 2) + test(i - 1)
}

let res = test(3)

console.log(res)