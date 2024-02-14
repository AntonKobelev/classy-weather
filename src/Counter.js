import React from "react";

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { counter: 2 };
    this.handleIncreaseCounter = this.handleIncreaseCounter.bind(this);
    this.handleDecreaseCounter = this.handleDecreaseCounter.bind(this);
  }

  handleIncreaseCounter() {
    this.setState((state) => {
      return { counter: state.counter + 1 };
    });
  }

  handleDecreaseCounter() {
    this.setState((state) => {
      return { counter: state.counter - 1 };
    });
  }

  render() {
    const date = new Date("07 june 2027");
    date.setDate(date.getDate() + this.state.counter);
    return (
      <div>
        <button onClick={this.handleDecreaseCounter}>-</button>
        <span>
          {date.toDateString()}[{this.state.counter}]
        </span>
        <button onClick={this.handleIncreaseCounter}>+</button>
      </div>
    );
  }
}

export default Counter;
