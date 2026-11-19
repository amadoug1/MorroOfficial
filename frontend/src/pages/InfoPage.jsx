const PAGES = {
  privacy: {
    title: "LEGAL & PRIVACY",
    body: [
      "MORRO collects only the information needed to fulfil your order and, if you subscribe, to send you drop announcements. We never sell or share your data with third parties for marketing.",
      "Payment details are processed securely by Stripe and never touch our servers. You may request a copy or deletion of your data at any time by writing to us.",
      "[Full privacy policy text]",
    ],
  },
  shipping: {
    title: "SHIPPING",
    body: [
      "[Shipping times, costs and the return window.]",
    ],
  },
  returns: {
    title: "RETURNS",
    body: [
      "[Return window and conditions]",
    ],
  },
};

export default function InfoPage({ page }) {
  const { title, body } = PAGES[page];
  return (
    <div className="px-[20px] md:px-[40px] pt-[40px] pb-[80px]" data-testid={`info-page-${page}`}>
      <div className="pb-[15px] mb-[40px]" style={{ borderBottom: "1px solid var(--ink)" }}>
        <h1 className="font-display" style={{ fontSize: 32 }}>{title}</h1>
      </div>
      <div className="max-w-[640px]">
        {body.map((p, i) => (
          <p key={i} className="t-body-copy mb-[20px]">{p}</p>
        ))}
      </div>
    </div>
  );
}
