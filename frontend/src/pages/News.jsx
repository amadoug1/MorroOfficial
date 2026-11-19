import { motion } from "framer-motion";

const STORIES = [
  {
    img: "https://images.unsplash.com/photo-1756451182421-d2a1961638c9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwyfHxtZW5zd2VhciUyMGVkaXRvcmlhbCUyMHN0cmVldHdlYXIlMjB3YXJtJTIwZmlsbSUyMHBob3RvZ3JhcGh5fGVufDB8fHx8MTc5NDEwOTc4NHww&ixlib=rb-4.1.0&q=85",
    date: "JULY 14, 2026",
    title: "FALL / WINTER '26 — DROP 1 ARRIVES",
    body: "Twelve pieces for the cold months. Heavyweight fleece, brushed wool and waxed cotton, cut and sewn in Portugal. Drop 1 is available now, online only.",
  },
  {
    img: "https://images.unsplash.com/photo-1519831296458-9341fc9d2b18?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwxfHxtZW5zd2VhciUyMGxvb2tib29rJTIwZmFzaGlvbiUyMHBvcnRyYWl0JTIwd2FybSUyMGxpZ2h0fGVufDB8fHx8MTc5NDEwOTc4NHww&ixlib=rb-4.1.0&q=85",
    date: "JULY 2, 2026",
    title: "NOTES ON QUIET LUXURY",
    body: "Why we make clothes without logos on the outside. A short essay on restraint, fabric weight, and letting the garment speak first.",
  },
  {
    img: "https://images.unsplash.com/photo-1669575861396-131deb9669d1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwyfHxtZW5zd2VhciUyMGxvb2tib29rJTIwZmFzaGlvbiUyMHBvcnRyYWl0JTIwd2FybSUyMGxpZ2h0fGVufDB8fHx8MTc5NDEwOTc4NHww&ixlib=rb-4.1.0&q=85",
    date: "JUNE 18, 2026",
    title: "INSIDE THE PORTO WORKSHOP",
    body: "A visit to the family-run atelier where every MORRO piece is cut. On craft, pace, and making fewer things better.",
  },
];

export default function News() {
  return (
    <div className="px-[20px] md:px-[40px] pb-[80px]" style={{ paddingTop: 120 }} data-testid="news-page">
      <h1 className="t-heading mb-[50px]">NEWS</h1>
      <div className="grid md:grid-cols-3 gap-[20px] md:gap-[30px]">
        {STORIES.map((s, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            data-testid={`news-story-${i}`}
          >
            <div style={{ aspectRatio: "4/3", background: "#F5F4F2" }} className="mb-[15px]">
              <img src={s.img} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <p className="t-small mb-[10px]" style={{ color: "var(--muted)" }}>{s.date}</p>
            <h2 className="t-product mb-[10px]">{s.title}</h2>
            <p className="t-body" style={{ color: "var(--muted)" }}>{s.body}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
