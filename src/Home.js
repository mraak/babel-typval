import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import * as Typ from "./typChecker";

export class Home extends React.Component {
  state = {
    code: `function fun(x, n = number\`\`) {
 console.log(n);
}

fun('r','u')
fun('r',1)`,

    code1: `// dynamically typed
let a = 1
let b = "b"


// typval typed 
let x = number\`1\`
let y = string\`a\`
let z = number\`2\`

a = x // must pass
a = b // must fail: coertion
b = x // must fail: coertion
b = y // must pass
x = z // must pass

a === b // must fail: comparison
x === y // must fail: comparison

`,

    errors: [],
    errors1: []
  };

  handleCodeChange = e => {
    const code = e.target.value;
    const errors = Typ.check(code);
    this.setState({ code, errors });
  };

  handleCodeChange1 = e => {
    const code1 = e.target.value;
    const errors1 = Typ.check(code1);
    this.setState({ code1, errors1 });
  };

  componentDidMount() {
    const { code, code1 } = this.state;
    const errors = Typ.check(code);
    const errors1 = Typ.check(code1);
    //this.setState({ errors, errors1 });
    this.setState({ errors1 });
  }
  render() {
    const { code, errors, code1, errors1 } = this.state;
    return (
      <>
        <ul>
          <li>
            Edit the code inside the text area. The code is not executed, only
            checked for type safety.
          </li>
          <li>Only type 'number' is checked</li>
        </ul>
        <h2>Function arguments</h2>
        <textarea
          style={{ height: 200, width: 400 }}
          onChange={this.handleCodeChange}
        >
          {code}
        </textarea>
        <p>Compile Errors:</p>
        {errors.map(e => (
          <p key={e.toString()}>{e}</p>
        ))}
        <h2>Coercion, comparison</h2>
        <textarea
          style={{ height: 300, width: 400 }}
          onChange={this.handleCodeChange1}
        >
          {code1}
        </textarea>
        <p>Compile Errors:</p>
        {errors1.map(e => (
          <p key={e.toString()}>{e}</p>
        ))}
      </>
    );
  }
}
