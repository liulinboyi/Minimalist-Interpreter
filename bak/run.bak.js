const ast = require('../source.json')

console.log(ast)

let all = {
    store: [],
    env: []
}

function createEnvironment() {
    let store = {};
    all.store.push(store);

    return {
        get(key) {
            return store[key];
        },
        set(key, object) {
            store[key] = object;
        }
    };
}

function createEnclosedEnvironment(outer) {
    let env = createEnvironment();

    all.env.push(env)
    return {
        get(key) {
            let value = env.get(key);
            return value !== undefined /*易错*/ ? value : outer.get(key);
        },
        set(key, object) {
            env.set(key, object);
        }
    };
}


function run(ast, env) {
    switch (ast.type) {
        case "Program":
            return run_statement(ast.body, env)
        case "ReturnStatement":
            // console.log(ast, env)
            console.log("-------------------------------------")
            return evaluateReturnStatement(ast, env)
        default:
            let res = evaluateExpression(ast, env);
            return res;
    }
}

function evaluateReturnStatement(expression, env) {
    return {
        kind: "Return",
        value: evaluateExpression(expression.argument, env)
    }
}

function evaluateExpression(expression, env) {
    switch (expression.type) {
        case "IfStatement": {
            return evaluateIfElseExpression(expression, env)
        }
        case "BinaryExpression": {
            return evaluateBinaryExpression(expression, env)
        }
        case "Identifier": {
            return evaluateIdentifier(expression, env); // 简化处理
        }
        case "Literal": {
            return expression.value // 简化处理
        }
        case "CallExpression": {
            let call = env.get(expression.callee.name);
            if (call) {
                let args = get_args(expression.arguments, env)
                return evaluateCallExpression(call, args, env);
            } else {
                throw new Error("not found function!")
            }
        }
    }
}

function evaluateIdentifier(expression, env) {
    if (!expression.name) return null;
    let identifierValue = env.get(expression.name);
    if (identifierValue !== undefined /*易错*/ ) return identifierValue;
}

function evaluateBinaryExpression(expression, env) {
    if (!expression.left || !expression.operator || !expression.right) {
        return null;
    }
    let left = evaluateExpression(expression.left, env);
    // 可能为{kind: "Return", value: xx}
    if (typeof left === "object") {
        left = left.value
    }
    let right = evaluateExpression(expression.right, env);
    if (typeof right === "object") {
        right = right.value
    }
    let ops = `${left} ${expression.operator} ${right}`;
    let res = eval(ops)
    console.log(ops, res)
    return res;
}

function evaluateIfElseExpression(expression, env) {
    if (!expression.test || !expression.consequent) return null;

    let test = evaluateExpression(expression.test, env);
    // if (test.kind === ObjectKind.Error) return test;

    if (test && expression.consequent.body) {
        return evaluateStatements(expression.consequent.body, env);
    } else if (expression.alternative /*else 可能函数内部调用函数*/ ) {
        return evaluateStatements(expression.alternative.statements, env);
    }

    return null;
}

function evaluateCallExpression(call, args, env) {
    call.env = env;
    return applyFunction(call, args);
}

function run_statement(statements, env) {
    for (let i of statements) {
        switch (i.type) {
            case "FunctionDeclaration": {
                env.set(i.id.name, i);
                break;
            }
            case "VariableDeclaration": {
                for (let dec of i.declarations) {
                    if (dec.init.type === "CallExpression") { // 执行函数
                        let call = env.get(dec.init.callee.name);
                        if (call) {
                            let args = get_args(dec.init.arguments, env)
                            let res = evaluateCallExpression(call, args, env);
                            if (typeof res === "object") { // 可能为{kind: "Return", value: xx}
                                res = res.value
                            }
                            env.set(dec.id.name, res);
                        } else {
                            throw new Error("not found function!")
                        }
                    } else {
                        env[dec.id.name] = dec.init;
                    }
                }
                break;
            }
            case "ExpressionStatement": { // console.log
                if (i.expression) {
                    let args = [];
                    for (let item of i.expression.arguments) {
                        args.push(env.get(item.name))
                    }
                    let opt = `${i.expression.callee.object.name}.${i.expression.callee.property.name}(${args.join(",")})`
                    console.log(opt)
                    eval(opt)
                }
                break;
            }
            default: {
                console.log(i)
            }
        }
    }
}

function applyFunction(fn, args) {
    let {
        body,
        params
    } = fn;
    let env = fn.env;
    if (env && params && args) env = encloseEnvironment(params, args, env);
    if (env && body) return evaluateStatements(body.body, env);

    return null;
}

function encloseEnvironment(params, args, outer) {
    let env = createEnclosedEnvironment(outer);

    for (let i = 0; i < params.length; i++) {
        env.set(params[i].name, args[i]);
    }

    return env;
}

function evaluateStatements(statements, env) {
    let object = null;

    for (let statement of statements) {
        object = run(statement, env);
        if (object && object.kind === "Return") return object;
    }

    return object.value;
}

function get_args(arguments, env) {
    let output = []
    for (let arg of arguments) {
        output.push(evaluateExpression(arg, env))
    }
    return output;
}


const env = createEnvironment();

run(ast, env)