// src/components/Features/Features.jsx
import styles from "./Features.module.css";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: "✓",
    title: "Simple Interface",
    description:
      "Clean, intuitive design that lets you focus on what matters - getting things done.",
  },
  // Add other features similarly
];

const Features = () => {
  return (
    <section className={styles.features} id="features">
      <div className="container">
        <h2 className={styles.sectionTitle}>Powerful Features</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
