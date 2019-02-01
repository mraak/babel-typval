import * as babylon from "babylon";
import traverse from "@babel/traverse";

const typvals = ["number", "string", "int"];

function checkTypeCompatibility(type1, type2, loc) {
  let pass = true;
  let error = "";
  if (type1 === "number") {
    pass = type2 === "number" || type2 === "NumericLiteral" || type2 === "int";
  }
  if (type1 === "string") {
    pass = type2 === "string" || type2 === "StringLiteral";
  }

  if (type1 === "int") {
    pass = type2 === "int";
  }
  if (!pass && loc) {
    error = getErrorMessage(
      type1,
      type2,
      loc.start.line,
      loc.start.column,
      loc.identifierName
    );
  }

  return { pass, error };
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
              const { pass, error } = checkTypeCompatibility(
                p,
                args[i].type,
                args[i].loc
              );
              if (!pass) {
                errors.push(error);
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

          if (right.type === "Identifier") {
            // x = y
            // right is in vars?
            const rightVar = vars.find(e => e.name === right.name);
            if (rightVar) {
              rightType = rightVar.typval
                ? rightVar.typval.type
                : rightVar.type;
              const { pass, error } = checkTypeCompatibility(
                leftType,
                rightType,
                right.loc
              );
              if (!pass) {
                errors.push(error);
              }
            }
          } else if (right.type.includes("Literal")) {
            // x = 4
            const { pass, error } = checkTypeCompatibility(
              leftType,
              right.type,
              right.loc
            );
            if (!pass) {
              errors.push(error);
            }
          } else if (right.type === "CallExpression") {
            // x = getX()
            // right is in funcs?
            const rightFunc = funcs.find(e => e.name === right.name);
          }
          // right is a xLiteral or MemberExpression?

          console.log(left.name, leftType, "\t=\t", right.name, rightType);
        }
      } else if (path.node.type === "VariableDeclaration") {
        // variable declarations
      }
    }
  });
  return errors;
}
