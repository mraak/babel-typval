import * as babylon from "babylon";
import traverse from "@babel/traverse";

const typvals = ["number", "string", "int"];

function checkTypeCompatibility(type1, type2) {
  if (type1 === "number") {
    return type2 === "number" || type2 === "NumericLiteral" || type2 === "int";
  }
  if (type1 === "string") {
    return type2 === "string" || type2 === "StringLiteral";
  }

  if (type1 === "int") {
    return type2 === "int";
  }
  return true;
}

function getErrorMessage(needed, found, line, column, identifier) {
  let msg = `TypeError: need '${needed}' but found '${found}', at line ${line} and column ${column}.`;
  if (identifier) {
    msg += " Identifier: " + identifier;
  }
  return msg;
}

export function check(code) {
  const ast = babylon.parse(code);
  window.ast = ast;
  console.log("ast", ast);

  const funcs = [];
  const vars = [];
  const errors = [];

  // first grab functions and their args
  traverse(ast, {
    enter(path) {
      if (path.node.type === "FunctionDeclaration") {
        const params = path.node.params.map(p => {
          if (p.right && p.right.tag) {
            return p.right.tag.name;
          } else {
            return "";
          }
        });
        funcs.push({ name: path.node.id.name, params });
      }
      if (path.node.type === "VariableDeclaration") {
        const name = path.node.declarations[0].id.name;
        const type = path.node.declarations[0].init.type;
        let typval = null;
        if (path.node.declarations[0].init.tag) {
          const tag = path.node.declarations[0].init.tag;
          // check if it's our type def or other tagged expression
          // console.log(tag);
          if (typvals.includes(tag.name)) {
            typval = { type: tag.name };
          } else {
            // TODO: Get the type
            // const quasis = path.node.declarations[0].init.quasis
            // const expressions = path.node.declarations[0].init.expressions
          }
        }
        vars.push({ name, type, typval });
      }
    }
  });
  console.log({ funcs, vars });
  // now check invocations and assignments
  traverse(ast, {
    enter(path) {
      if (path.node.type === "ExpressionStatement") {
        // function calls, assignments
        if (!path.node.expression) {
          return;
        }
        if (path.node.expression.type === "CallExpression") {
          const callee = path.node.expression.callee;
          const args = path.node.expression.arguments;
          const func = funcs.find(f => f.name === callee.name);
          if (func) {
            // console.log(func);
            func.params.forEach((p, i) => {
              // console.log(p, i);
              const pass = checkTypeCompatibility(p, args[i].type);
              if (!pass) {
                const line = args[i].loc.start.line;
                const col = args[i].loc.start.column;
                const identifier = args[i].loc.identifierName;
                console.log(identifier);
                const err = getErrorMessage(
                  p,
                  args[i].type,
                  line,
                  col,
                  identifier
                );
                errors.push(err);
              }
            });
          }
        } else if (path.node.expression.type === "AssignmentExpression") {
          const left = path.node.expression.left;
          const leftVar = vars.find(e => e.name === left.name);
          const leftType = leftVar.typval ? leftVar.typval.type : leftVar.type;

          //const.rightType = get Literal or BinaryExprassion get from vars or get from funcs
          const right = path.node.expression.right;
          let rightType = null;
          let pass = false;
          // right is in vars?
          const rightVar = vars.find(e => e.name === right.name);
          if (rightVar) {
            rightType = rightVar.typval ? rightVar.typval.type : rightVar.type;
            pass = checkTypeCompatibility(leftType, rightType);
            if (!pass) {
              const line = right.loc.start.line;
              const column = right.loc.start.column;
              const identifier = right.loc.identifierName;
              const error = getErrorMessage(
                leftType,
                rightType,
                line,
                column,
                identifier
              );
              errors.push(error);
            }
          }
          // right is a literal or MemberExpression?
          // right is in funcs?
          const rightFunc = funcs.find(e => e.name === right.name);

          console.log(
            left.name,
            leftType,
            "\t=\t",
            right.name,
            rightType,
            pass
          );
        }
      } else if (path.node.type === "VariableDeclaration") {
        // variable declarations
      }
    }
  });
  return errors;
}
