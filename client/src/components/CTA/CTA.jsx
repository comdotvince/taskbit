// src/components/CTA/CTA.jsx
import styles from "./CTA.module.css";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className={styles.ctaSection} id="cta">
      <div className="container">
        <h2>Ready to Boost Your Productivity?</h2>
        <p>
          Join thousands of users who are getting more done with Taskbit. It's
          free to get started!
        </p>
        <Link to="/signup" className={styles.whiteButton}>
          Sign Up Now
        </Link>
      </div>
    </section>
  );
};

export default CTA;
