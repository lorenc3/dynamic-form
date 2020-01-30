import React, { Component } from "react";

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      loading: true,
      success: ""
    };
  }

  componentDidMount() {
    //Getting the results and updating state.
    fetch("https://api.myjson.com/bins/1gax86")
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            data: result.form_inputs,
            loading: false
          });
          //Setting dynamic state props and values based on the result.
          this.setDynamicState(result.form_inputs);
        },
        error => {
          console.log(error);
        }
      );
  }

  setDynamicState = data => {
    //Assumption that the rules prop maintains the same format.
    //Can be easily modified if the rules prop changes format.
    data.map(item => {
      const rulesObj = {};
      const rules = item.rules.split("|");
      rules.map(item => {
        let prop = item.split(":")[0];
        let val = item.split(":")[1];
        rulesObj[prop] = val;
      });
      //Setting dynamic state props based on the item.
      this.setState({
        [`${item.name}`]: item.value,
        [`${item.name}Rules`]: rulesObj,
        [`${item.name}Error`]: false
      });
    });
  };

  submitServer = () => {
    const { data } = this.state;
    this.setState({ success: "" });
    //Validating as per the rule set and checking for errors.
    const errors = this.validate();
    //Creating the data object that we will send in the POST req.
    const dataObj = {};
    data.map(item => {
      dataObj[item.name] = this.state[item.name];
    });
    if (!errors) {
      //If no errors setting a loading state which disables buttons and inputs.
      //Setting a timeout of 1 sec to simulate time of post req and to
      //show the disabled form and button.
      this.setState({ loading: true });
      setTimeout(() => {
        //Tested with 2 endpoints: Success(201)--> 'https://reqres.in/api/data'
        //Unsuccesful(404,400 ...) --> 'https://reqres.in/'
        fetch("https://reqres.in/api/data", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dataObj)
        })
          .then(response => {
            if (response.status === 201) {
              this.setState({
                loading: false,
                success: "Succesful"
              });
            } else {
              this.setState({
                loading: false,
                success:
                  "Error: Request was not succesful. Please check your endpoint."
              });
            }
          })
          .catch(err => console.log(err));
      }, 1000);
    }
  };

  renderError = item => {
    //Checks for errors of every item and updates the form with error messages
    //when errors are found, otherwise no changes.
    const error = this.state[`${item.name}Error`];
    if (error) {
      return <p className="errText">{item.errorMessage}</p>;
    }
    return null;
  };

  validate = () => {
    const { data } = this.state;
    //Initially no errors.
    let hasErrors = false;
    data.forEach(item => {
      //Formatting the rules prop and validating the item value
      //for dynamic input types: text or number.
      //Can be easily updated for any aditional input types
      let itemVal = this.state[item.name];
      let rules = this.state[`${item.name}Rules`];
      let isRequired = rules.required === "true";
      let min = parseInt(rules.min);
      let max = parseInt(rules.max);
      if (
        (isRequired && itemVal === null) ||
        itemVal === "Select..." ||
        (item.type === "number" ? parseInt(itemVal) : itemVal.length) < min ||
        (item.type === "number" ? parseInt(itemVal) : itemVal.length) > max
      ) {
        this.setState({
          [`${item.name}Error`]: true
        });
        //If an error is found return true and the POST req will not be performed.
        hasErrors = true;
      } else {
        this.setState({
          [`${item.name}Error`]: false
        });
      }
    });
    return hasErrors;
  };

  handleChange = (event, name) => {
    //Change func for the dynamic input val
    this.setState({ [`${name}`]: event.target.value });
  };

  renderInputs = item => {
    //Rendering all supported inputs as asked for in the task(text, select, number, textarea).
    //Can be easily updated to support any of the input types.
    const { loading } = this.state;
    switch (item.type) {
      case "text":
        return (
          <input
            onChange={ev => this.handleChange(ev, item.name)}
            //If the state prop specified is undefined at first to prevent
            //input no-undefined error
            value={this.state[item.name] || ""}
            style={{ opacity: loading ? 0.5 : 1 }}
            type={item.type}
            disabled={loading}
            placeholder={item.placeholder}
            className="formBox"
          ></input>
        );
      case "select":
        return (
          <select
            className="formBox"
            style={{ opacity: loading ? 0.5 : 1 }}
            defaultValue="Select..."
            placeholder={item.placeholder}
            disabled={loading}
            onChange={ev => this.handleChange(ev, item.name)}
          >
            <option>Select...</option>
            {item.options.map(option => {
              return (
                <option label={option.label} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </select>
        );
      case "number":
        return (
          <input
            onChange={ev => this.handleChange(ev, item.name)}
            value={this.state[item.name] || ""}
            type={item.type}
            disabled={loading}
            placeholder={item.placeholder}
            className="formBox"
            style={{ opacity: loading ? 0.5 : 1 }}
          ></input>
        );
      case "textarea":
        return (
          <textarea
            onChange={ev => this.handleChange(ev, item.name)}
            value={this.state[item.name] || ""}
            type={item.type}
            disabled={loading}
            placeholder={item.placeholder}
            className="formBox"
            style={{
              height: 100,
              paddingTop: 5,
              resize: "vertical",
              maxHeight: 300,
              minHeight: 100,
              opacity: loading ? 0.5 : 1
            }}
          ></textarea>
        );
      default:
        break;
    }
  };

  render() {
    const { data, loading, success } = this.state;

    return (
      <div className="App">
        <div className="form">
          <h3>Personal Information</h3>
          {data.map(item => {
            return (
              <div className="inputBox" key={item.name}>
                <p>{item.label}</p>
                <div className="inputErr">
                  {this.renderInputs(item)}
                  {this.renderError(item)}
                </div>
              </div>
            );
          })}
          <button
            className="btn"
            onClick={this.submitServer}
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            Save
          </button>
        </div>
        <p style={{ color: success === "Succesful" ? "#22bb33" : "red" }}>
          {success}
        </p>
      </div>
    );
  }
}

export default App;
