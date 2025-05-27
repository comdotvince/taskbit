// src/components/Hero/Hero.jsx
import styles from "./Hero.module.css";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className="container">
        <h1>Organize Your Day with Taskbit</h1>
        <p className={styles.subtitle}>
          The intuitive React-powered todo application that helps you stay
          productive and manage your tasks effortlessly on web.
        </p>
        <div className={styles.heroButtons}>
          <Link to="/signup" className={styles.ctaButton}>
            Start for Free
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
