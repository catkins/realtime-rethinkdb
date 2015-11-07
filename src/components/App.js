import React, { Component } from 'react';
import 'normalize.css'
import styles from './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberOfClicks: 0
    }
  }

  handleClick() {
    this.setState({
      numberOfClicks: this.state.numberOfClicks + 1
    });
  }

  handleSetName() {
    const input = this.refs.nameInput;
    const name = input.value;
    if (name) {
      this.setState({ name });
    }
  }

  render() {
    const childComponent = this.state.name
      ? (
        <button
          className={styles.button}
          onClick={::this.handleClick}>
          You have clicked me {this.state.numberOfClicks} times
        </button>
      )
      : (
        <div>
          <label>Name</label>
          <input ref="nameInput" name="name"></input>
          <button onClick={::this.handleSetName}>Set name</button>
        </div>
      );

    return (
      <div id="wrapper" className={styles.wrapper}>
        <h1>Realtime RethinkDB demo</h1>

        {childComponent}
      </div>
    )
  }
}
