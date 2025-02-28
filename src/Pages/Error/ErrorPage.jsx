import React from 'react';
import styles from './Error.module.css';
import Navbar from '../../Components/Navbar';
import ErrorImg from '../../assets/error.png';

/**
 *
 * @return {ErrorPageComponent}
 */
function ErrorPage() {
  return (
    <div className={styles.container}>
      <Navbar/>
      <div className={styles.ErrorContainer}>
        <img src={ErrorImg} alt="" />
        <h1>Oops! There is No Data to Show Comparison</h1>
      </div>
    </div>
  );
}

export default ErrorPage;
