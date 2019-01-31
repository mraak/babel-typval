### VariableDeclaration

https://astexplorer.net/#/gist/4d7403de8f888dd53cf889d63c49e75a/df73189929109a0589392f557cd7e04ba599127b

How AST sees variables.

#### NumericLiteral

`let i = 0`

body[0].type = "VariableDeclaration"
body[0].declarations[0].type = "VariableDeclarator"
body[0].declarations[0].init.type = "NumericLiteral"
body[0].declarations[0].id.type = "Identifier"
body[0].declarations[0].id.name = "i"

#### StringLiteral

`let i = "a"`

body[0].type = "VariableDeclaration"
body[0].declarations[0].type = "VariableDeclarator"
body[0].declarations[0].init.type = "StringLiteral"
body[0].declarations[0].id.type = "Identifier"
body[0].declarations[0].id.name = "i"

#### BooleanLiteral

`const i = true`

body[0].type = "VariableDeclaration"
body[0].declarations[0].type = "VariableDeclarator"
body[0].declarations[0].init.type = "BooleanLiteral"
body[0].declarations[0].id.type = "Identifier"
body[0].declarations[0].id.name = "i"

#### NullLiteral

`const i = null`

body[0].type = "VariableDeclaration"
body[0].declarations[0].type = "VariableDeclarator"
body[0].declarations[0].init.type = "NullLiteral"
body[0].declarations[0].id.type = "Identifier"
body[0].declarations[0].id.name = "i"

#### undefined

`const i = undefined`

body[0].type = "VariableDeclaration"
body[0].declarations[0].type = "VariableDeclarator"
body[0].declarations[0].init.type = "Identifier"
body[0].declarations[0].init.name = "undefined"
body[0].declarations[0].id.type = "Identifier"
body[0].declarations[0].id.name = "

#### ArrayExpression

`var i = ['a',0]`

body[0].type = "VariableDeclaration"
body[0].declarations[0].type = "VariableDeclarator"
body[0].declarations[0].init.type = "ArrayExpression"
body[0].declarations[0].init.elements = [{type: "StringLiteral"}, {type:"NumericLiteral"}]
body[0].declarations[0].id.type = "Identifier"
body[0].declarations[0].id.name = "i"

#### ObjectExpression

`const i = {a:1, b:"foo"}`

body[0].type = "VariableDeclaration"
body[0].declarations[0].type = "VariableDeclarator"
body[0].declarations[0].init.type = "ObjectExpression"
body[0].declarations[0].init.properties = [{type: "ObjectProperty", value:{type:"NumericLiteral"}}, {type:"ObjectProperty", value:{type:"NumericLiteral"}}]
body[0].declarations[0].id.type = "Identifier"
body[0].declarations[0].id.name = "i"

#### CallExpression

```
function foo(){return "a"}
const i = foo()
```

body[0].type = "VariableDeclaration"
body[0].declarations[0].type = "VariableDeclarator"
body[0].declarations[0].init.type = "CallExpression"
body[0].declarations[0].init.callee.type = "Identifier"
body[0].declarations[0].init.callee.id = "foo"
body[0].declarations[0].id.type = "Identifier"
body[0].declarations[0].id.name = "i"

#### TaggedTemplateExpression

```
function int(){}
const i = int`1`
```

body[0].type = "VariableDeclaration"
body[0].declarations[0].type = "VariableDeclarator"
body[0].declarations[0].init.type = "TaggedTemplateExpression"
body[0].declarations[0].init.tag.type = "Identifier"
body[0].declarations[0].init.tag.id = "int"
body[0].declarations[0].id.type = "Identifier"
body[0].declarations[0].id.name = "i"

### FunctionDeclaration

How AST sees functions.

#### Simple return

```
function foo(){
  return "a"
}
```

argument
body[0].type = "FunctionDeclaration"
body[0].id.type = "Identifier"
body[0].id.name = "foo"
body[0].body.type = "BlockStatement"
body[0].body.body[0].type = "ReturnStatement"
body[0].body.body[0].argument.type = "StringLiteral"

#### Output of one function as argument to another

https://astexplorer.net/#/gist/e27d218a35f4ca7a13fce4ef52eab739/b921c62ca032e0650cbc1cf5f0f49da0b9bc4931

```
function foo(){return "a"}
function bar(name){return "name: " + name}
const name = foo()
const nameLabel = bar(name)

```

##### Nested functions

https://astexplorer.net/#/gist/e27d218a35f4ca7a13fce4ef52eab739/9569c94e971c636e51330ca0e06bbf0a56c01796

### Cases

#### How a variable gets its type

##### VariableDeclaration or ExpressionStatement/AssignmentExpression

```
let i = 1 // VariableDeclaration
i = 2 // ExpressionStatement/AssignmentExpression
```

AST type: NumericLiteral, StringLiteral, BooleanLiteral, NullLiteral, ArrayExpression, ObjectExpression

In these cases, type is _ALREADY KNOWN_ to AST, i.e. babel7 (not babel6 though).

##### VariableDeclaration + CallExpression

```
let c = getAge()
```

AST type: CallExpression

This is a potentially unknown type. We need to enforce the typing by following options.

- getAge() returns typval

```
function getAge(){
  return int`5`
}

let c = getAge()
```

- Additionally, mark `c` as typval

```
function getAge(){
  return int`5`
}
let c = int``
c = getAge()
```

- Or similarly wrap the invocation into typval (probably not a good idea).

```
function getAge(){
  return int`5`
}
let c = int`getAge()`
```

##### Tagged template

```
let c = makeCSS`h1`
```

##### TYPVAL

```
let c = int`1`

let c = int`a`  // ERROR?

```

#### Function arguments

```
function fun(x, n = number``) {
 console.log(n);
}

fun('r','u')
fun('r',1)

const x = int`3`
fun(0, x)

const y = 4
fun(0, y)

```

#### Implicit coercion of a value of type X to an unrelated type Y

#### Comparison between a value with static type X and a possibly unrelated type Y

```
const x = int`0`
const y = 5.5
const same = x === y
```
