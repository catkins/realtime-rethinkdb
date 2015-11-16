import React, { Component, PropTypes } from 'react';
import styles from './LoginForm.css';

class LoginForm extends Component {

  static propTypes = {
    teamName: PropTypes.string,
    onLogin: PropTypes.func,
    onLogout: PropTypes.func
  };

  handleLogin(event) {
    event.preventDefault();
    const input = this.refs.nameInput;
    const name = input.value;

    if (name) {
      this.props.onLogin(name);
    }
  }

  handleLogout() {
    this.props.onLogout();
  }

  renderLoggedin() {
    return (
      <div>
        <label>Clicking for team '{this.props.teamName}'</label>
        <div>
          <button
            onClick={::this.props.onLogout}
            className={styles.button}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  renderLoggedOut() {
    return (
      <form onSubmit={::this.handleLogin}>
        <div>
          <label>Team name</label>
          <input
            className={styles.textfield}
            ref="nameInput"
            name="name" />
        </div>
        <input
          type="submit"
          value="Join Team"
          className={styles.button} />
      </form>
    );
  }

  render() {
    if (this.props.teamName) {
      return this.renderLoggedin();
    }

    return this.renderLoggedOut();
  }
}

export default LoginForm;
