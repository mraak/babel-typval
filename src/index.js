import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import * as Typ from "./typChecker";
import { Home } from "./Home";

class App extends React.Component {
  state = {
    code: `function fun(x, n = number\`\`) {
 // force execution of number() to allow default params?
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
let k = int\`a\`   // throw an error here?

a = x // must pass
a = b // must pass
b = x // must pass
x = a // must pass
x = b // must fail: coercion
x = z // must pass
k = x // must fail: coercion
y = 4 // must fail: coercion


a + y // pass or fail?

a === b // must fail? comparison
x === y // must fail? comparison

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
    this.setState({ errors, errors1 });
  }
  render() {
    const { code, errors, code1, errors1 } = this.state;
    return (
      <>
        <p>
          Edit the code inside the text area. The code is not executed, only
          checked for type safety.
        </p>

        <h2>Assignment, comparison</h2>
        <textarea
          style={{ height: 300, width: 500 }}
          onChange={this.handleCodeChange1}
        >
          {code1}
        </textarea>
        <p>Compile Errors:</p>
        {errors1.map(e => (
          <p key={e.toString()}>{e}</p>
        ))}
        <hr />
        <h2>(Arrow) Function arguments and return types</h2>
        <textarea
          style={{ height: 200, width: 500 }}
          onChange={this.handleCodeChange}
        >
          {code}
        </textarea>
        <p>Compile Errors:</p>
        {errors.map(e => (
          <p key={e.toString()}>{e}</p>
        ))}
        <hr />
        <h2>Scope</h2>
        <hr />
        <h2>Custom Types</h2>
      </>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
