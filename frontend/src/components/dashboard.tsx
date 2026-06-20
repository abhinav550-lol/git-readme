import DashboardNavbar from "./parts/navbar";
import Footer from "./parts/footer";
import { DashboardHero } from "./parts/dashboard/dashboardHero";
import { DashboardDocs } from "./parts/dashboard/dashboardDocs";

const Dashboard = () => {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-zinc-950 text-white">
      {/* ── Background Layer ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 landing-animate-grid-fade"
          style={{
            backgroundImage: `
						linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
						linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
					`,
            backgroundSize: "64px 64px",
          }}
        />
        <div className="landing-animate-glow absolute left-[60%] top-[20%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div
          className="landing-animate-glow absolute left-[30%] top-[60%] h-[400px] w-[400px] rounded-full bg-sky-500/8 blur-[100px]"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <DashboardNavbar />

      {/* ── Hero Section ── */}
      <DashboardHero />

      {/* ── Explore Section ── */}
      <DashboardDocs />

      <Footer />
    </main>
  );
};

export default Dashboard;
