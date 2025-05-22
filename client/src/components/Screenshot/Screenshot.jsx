// src/components/Screenshot/Screenshot.jsx
import styles from "./Screenshot.module.css";

const Screenshot = () => {
  return (
    <section className={styles.screenshot} id="screenshot">
      <div className="container">
        <h2 className={styles.sectionTitle}>Beautiful & Functional</h2>
        <div className={styles.appPreview}>
          <img
            src="https://via.placeholder.com/800x500?text=Taskify+App+Screenshot"
            alt="Taskbit App Interface"
          />
        </div>
      </div>
    </section>
  );
};

export default Screenshot;
