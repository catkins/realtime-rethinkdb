import React, { Component, PropTypes } from 'react';
import styles from './Leaderboard.css';

class Leaderboard extends Component {
  static propTypes = {
    teams: PropTypes.array,
    activeTeam: PropTypes.string
  };

  static defaultProps = {
    teams: []
  };

  render() {
    let { teams, activeTeam } = this.props;

    const renderTeam = (team, index) => {
      const className = team.name === activeTeam && styles.active;
      const rank = index + 1;
      return (
        <tr key={team.id} className={className}>
          <td>{rank}</td>
          <td>{team.name}</td>
          <td>{team.clicks}</td>
        </tr>
      )
    };

    return (
      <div className={styles.wrapper}>
        <h3>Leaderboard</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(renderTeam)}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Leaderboard;
