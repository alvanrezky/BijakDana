import "./landing-tokens.css";
import LandingHeader from "./sections/LandingHeader";
import Hero from "./sections/Hero";
import Problem from "./sections/Problem";
import Steps from "./sections/Steps";
import Features from "./sections/Features";
import Showcase from "./sections/Showcase";
import Testimonials from "./sections/Testimonials";
import Faq from "./sections/Faq";
import CtaBanner from "./sections/CtaBanner";
import LandingFooter from "./sections/LandingFooter";

// Halaman utama Landing Page BijakDana (route "/").
// Setiap section dipisah jadi komponen + CSS module sendiri di folder ./sections
export default function LandingPage() {
  return (
    <div className="landing">
      <LandingHeader />
      <Hero />
      <Problem />
      <Steps />
      <Features />
      <Showcase />
      <Testimonials />
      <Faq />
      <CtaBanner />
      <LandingFooter />
    </div>
  );
}