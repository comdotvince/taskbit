// src/components/Footer/Footer.jsx
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p>© {new Date().getFullYear()} Taskbit. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
