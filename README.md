## babel-typval

Babel plugin for static Javascript type checking. It is based on the https://github.com/getify/typval type annotations, e.g.

```
let i = int`1`
let a = string`a`
i = a // compile error
```
