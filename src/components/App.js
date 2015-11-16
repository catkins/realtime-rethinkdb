import React, { Component, PropTypes } from 'react';
import 'normalize.css';
import styles from './App.css';
import lodash from 'lodash';

import Leaderboard from './Leaderboard';
import LoginForm from './LoginForm';
import Button from './Button';

class App extends Component {
  static propTypes = {
    socket: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      numberOfClicks: 0,
      name: null,
      teams: []
    }
  }

  componentDidMount() {
    const { socket } = this.props;
    socket.on('leaderboard', ::this.initLeaderboard);
    socket.on('teamUpdated', ::this.updateLeaderboard);
  }

  updateLeaderboard(updatedPlayer) {
    if (updatedPlayer.name === this.state.name) {
      this.setState({ numberOfClicks: updatedPlayer.clicks });
    }

    const teams = lodash.chain(this.state.teams)
      .reject(p => p.name === updatedPlayer.name)
      .push(updatedPlayer)
      .sortBy(p => -p.clicks)
      .take(10)
      .value();

    this.setState({ teams });
  }

  initLeaderboard(teams) {
    this.setState({ teams: teams });
  }

  buttonPressed() {
    const { name, numberOfClicks } = this.state;
    this.props.socket.emit('click', { name });

    // optimistic updates #ux
    this.setState({ numberOfClicks: numberOfClicks + 1 });
    return false;
  }

  handleLogin(name) {
    this.props.socket.emit('join', { name })
    this.setState({ name });
  }

  handleLogout() {
    const { name } = this.state;
    this.props.socket.emit('logout', { name })
    this.setState({ name: null })
  }

  render() {
    return (
      <div id="wrapper" className={styles.wrapper}>
        <h1>ClickSquad</h1>

        <LoginForm
          onLogin={::this.handleLogin}
          onLogout={::this.handleLogout}
          teamName={this.state.name} />

        <Leaderboard
          teams={this.state.teams}
          activeTeam={this.state.name} />

        {this.state.name
          ? <Button
              onClick={::this.buttonPressed}
              numberOfClicks={this.state.numberOfClicks} />
          : null}
      </div>
    )
  }
}

export default App;
