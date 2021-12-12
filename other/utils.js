// 计算源码各行范围

const fs = require("fs")
const path = require("path")

exports.getlins = function getlins() {
    let file = fs.readFileSync(path.resolve(__dirname, "./test.js"))

    file = file.toString("utf-8");
    let lins = []
    let map = []
    let index = 0;
    let count = 0;
    let temp = ""
    for (let i of file) {
        temp += i;
        if (i === "\r") {
            lins.push(temp)
            count += temp.length
            map.push({
                key: count,
                value: index,
            })
            index++;
            temp = ""
        }
    }

    return map
}