import React from "react";
import Header from "../components/Header/Header";
import Hero from "../components/Hero/Hero";
import Features from "../components/Features/Features";
import CTA from "../components/CTA/CTA.jsx";
import Footer from "../components/Footer/Footer";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
