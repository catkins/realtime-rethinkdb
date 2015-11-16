import React from 'react';
import styles from './Button.css';

export default ({ onClick, numberOfClicks }) => {
  return (
    <div>
      <button
        className={styles.button}
        onClick={onClick}>
          {numberOfClicks}
      </button>
    </div>
  );
};
