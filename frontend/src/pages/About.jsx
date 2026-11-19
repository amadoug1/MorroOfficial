import { motion } from "framer-motion";
import { BecomingHeadline, FocusImage } from "../components/Star";

export default function About() {
  return (
    <div data-testid="about-page">
      <motion.div
        className="px-[20px] md:px-[40px] py-[60px] max-w-[760px]"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="t-mono-sm mb-[20px]" style={{ color: "var(--muted)" }}>THE BRAND</p>
        <h1 className="mb-[30px]">
          <BecomingHeadline style={{ fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 0.95, display: "block" }}>
            THE ART OF BECOMING
          </BecomingHeadline>
        </h1>
        <p className="t-body-copy-lg mb-[30px]">
          MORRO is about growth, evolution and becoming a better version of yourself. It's built for individuality and ambition, and for anyone who knows their past doesn't define their future. You're always becoming something greater.
        </p>
        <p className="t-mono-sm" style={{ color: "var(--ink)", borderLeft: "2px solid var(--ink)", paddingLeft: 14 }}>
          YOUR PAST DOESN'T DEFINE YOUR FUTURE.
        </p>
      </motion.div>
      <FocusImage
        src="/brand/lookbook-05.jpg"
        alt="MORRO — The art of becoming"
        style={{ height: "80vh", background: "var(--flatlay)" }}
      />
    </div>
  );
}
