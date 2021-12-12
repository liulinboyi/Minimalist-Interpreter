var net = require('net');
const {
    run_debug
} = require("./run")
const ast = require('../source.json')
let template = {
    "type": "Program",
    "start": 0,
    "end": 176,
    "body": [

    ],
    "sourceType": "module"
}

// var {
//     getlins
// } = require("./utils")
//模块引入
var listenPort = 3000; //监听端口
var server = net.createServer(function (socket) {
    // 创建socket服务端
    console.log('connect: ' +
        socket.remoteAddress + ':' + socket.remotePort);
    socket.setEncoding('binary');
    //接收到数据
    socket.on('data', function (data) {
        console.log('client send:' + data);
        // let res = getlins()
        // console.log(res)
        let sign = "next"
        switch (data) {
            case "next": {
                sign = "next"
                let partast = get_next_ast(sign)
                if (partast) {
                    run_debug(partast, sign)
                } else {
                    console.log("结束\r\n")
                    socket.write("end")
                    break;
                    // server.close()
                }
                socket.write("ok\r\n");
                break;
            }
            case "step": {
                sign = "step_in"
                let partast = get_next_ast(sign)
                if (partast) {
                    run_debug(partast, sign)
                } else {
                    console.log("结束\r\n")
                }
                socket.write("ok\r\n");
            }
        }


    });
    socket.write('Hello client!\r\n');
    // socket.pipe(socket);
    //数据错误事件
    socket.on('error', function (exception) {
        console.log('socket error:' + exception);
        socket.end();
    });
    //客户端关闭事件
    socket.on('close', function (data) {
        console.log('client closed!');
        // socket.remoteAddress + ' ' + socket.remotePort);
    });
}).listen(listenPort);
//服务器监听事件
server.on('listening', function () {
    console.log("server listening:" + server.address().port);
});
//服务器错误事件
server.on("error", function (exception) {
    console.log("server error:" + exception);
});

let index = 0;

function get_next_ast() {
    let partast = JSON.parse(JSON.stringify(template))
    if (ast.type === "Program") {
        let past = ast.body[index]
        if (!past) return null
        if (past.type === "FunctionDeclaration") {
            partast.body = [past]
        } else if (past.type === "VariableDeclaration") {
            partast.body = [past]
        } else if (past.type === "ExpressionStatement") {
            partast.body = [past]
        }
        if (index > ast.body.length - 1) {
            index++;
            return null
        } else {
            index++;
            return partast
        }
    }
}