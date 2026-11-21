import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { StoreProvider, useStore } from "@/lib/store";
import { Header } from "@/components/Header";
import { MenuDrawer } from "@/components/MenuDrawer";
import { CartDrawer } from "@/components/CartDrawer";
import { SearchOverlay } from "@/components/SearchOverlay";
import { RegionModal } from "@/components/RegionModal";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductPage from "@/pages/ProductPage";
import Lookbook from "@/pages/Lookbook";
import About from "@/pages/About";
import ClientServices from "@/pages/ClientServices";
import InfoPage from "@/pages/InfoPage";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import DropMode from "@/pages/DropMode";
import { PaymentSuccess, PaymentCancel } from "@/pages/PaymentPages";
import NotFound from "@/pages/NotFound";
import { Intro } from "@/components/Intro";
import { RouteLoader, PageFade } from "@/components/RouteLoader";
import { FilmGrain, ScrollStar, MagneticButtons, FlyToBag } from "@/components/Experience";

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

function Gate({ children }) {
  const { settings, siteLocked } = useStore();
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/account") || pathname.startsWith("/payment");

  // Wait for settings so locked visitors never request store data.
  if (!settings && !isAdminRoute) return null;
  if (siteLocked && !isAdminRoute) {
    return <DropMode />;
  }
  return children;
}

function PreviewBar() {
  const { setAdminPreview } = useStore();
  return (
    <div
      data-testid="drop-preview-bar"
      className="t-mono-xs fixed bottom-0 inset-x-0 z-[100] flex items-center justify-center gap-[15px] py-[10px] px-[20px] text-center"
      style={{ background: "#d4ff3a", color: "#111" }}
    >
      <span>PREVIEW · DROP MODE IS LIVE · CUSTOMERS SEE THE COUNTDOWN</span>
      <a href="/admin?tab=dropmode" style={{ textDecoration: "underline" }}>STUDIO</a>
      <button data-testid="exit-preview" onClick={() => setAdminPreview(false)} style={{ textDecoration: "underline" }}>EXIT PREVIEW</button>
    </div>
  );
}

function Layout() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  const { settings } = useStore();
  const { dropLive, isAdmin, adminPreview } = useStore();
  const previewing = dropLive && isAdmin && adminPreview;

  return (
    <div className="App">
      <ScrollToTop />
      <FilmGrain />
      <MagneticButtons />
      <FlyToBag />
      <ScrollStar />
      {settings && !settings.drop_mode && <Intro />}
      {previewing && <PreviewBar />}
      <Gate>
        <Header />
        <MenuDrawer />
        <CartDrawer />
        <SearchOverlay />
        <RegionModal />
        <RouteLoader />
        <main>
          <PageFade>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/lookbook" element={<Lookbook />} />
            <Route path="/about" element={<About />} />
            <Route path="/client-services" element={<ClientServices />} />
            <Route path="/privacy" element={<InfoPage page="privacy" />} />
            <Route path="/shipping" element={<InfoPage page="shipping" />} />
            <Route path="/returns" element={<InfoPage page="returns" />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </PageFade>
        </main>
        <Footer />
      </Gate>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
