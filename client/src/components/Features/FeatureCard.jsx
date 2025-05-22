// src/components/Features/FeatureCard.jsx
import styles from "./Features.module.css";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FeatureCard;
