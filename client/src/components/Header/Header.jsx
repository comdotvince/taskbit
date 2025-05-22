// src/components/Header/Header.jsx
import styles from "./Header.module.css";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>
            Taskbit
          </Link>
          <div className={styles.navLinks}>
            <Link to="#features">Features</Link>
            <Link to="#screenshot">Preview</Link>
            <Link to="#">Pricing</Link>
            <Link to="#">About</Link>
          </div>
          <Link to="/signup" className={styles.ctaButton}>
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
