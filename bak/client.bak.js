var net = require('net');
var port = 3000;
var host = '127.0.0.1';
var client = new net.Socket();
const {
    createInterface
} = require('readline');
const readline = require('readline');

let has_receive = false; // 是否接受到数据

let input = [];

let cli = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});


cli.on('line', line => {
    let command = input.join('');

    if (line !== '') {
        input.push(line);
        cli.setPrompt('');
        cli.prompt();
        return;
    }

    // Move cursor one line up
    process.stdout.write('\x1b[1A');

    switch (command) {
        case 'quit':
        case 'q':
            cli.close();
            break;
        case "":
            break;
        case "next":
            client.write("next");
            break;
        default:
            // run(command);
            console.log(command, has_receive);
            if (has_receive) {
                cli.setPrompt('\r\n');
                cli.prompt();
                has_receive = false;
                input = [];
            }
    }
}).on('close', () => {
    process.stdout.write('Exiting REPL...\n');
    process.exit(0);
});

//创建socket客户端
client.setEncoding('binary');
//连接到服务端
client.connect(port, host, function () {
    // client.write('hello server');
    console.log("connected");
    has_receive = true;
    //向端口写入数据到达服务端
});

client.on('data', function (data) {
    console.log('from server:' + data + "\r\n");
    has_receive = true;
    //得到服务端返回来的数据
});

client.on('error', function (error) {
    //错误出现之后关闭连接
    console.log('error:' + error);
    client.destory();
});
client.on('close', function () {
    //正常关闭连接
    console.log('Connection closed');
});