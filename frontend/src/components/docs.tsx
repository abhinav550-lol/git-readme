import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Code2,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { axiosGet } from "../api/axiosMethods";
import Footer from "./parts/footer";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

type EndpointType = "json" | "svg";

interface EndpointConfig {
  id: string;
  title: string;
  path: string;
  method: string;
  type: EndpointType;
  description: string;
}

const ENDPOINTS: EndpointConfig[] = [
  {
    id: "contrib-stats-json",
    title: "Contribution Stats (Data)",
    path: "/api/profile/data/contribution-stats",
    method: "GET",
    type: "json",
    description:
      "Returns raw GitHub contribution statistics in JSON format. Cached for 3 hours.",
  },
  {
    id: "contrib-stats-svg",
    title: "Contribution Stats (Card)",
    path: "/api/profile/card/contribution-stats",
    method: "GET",
    type: "svg",
    description:
      "Generates a beautifully rendered SVG image of contribution stats. Cached for 1 hour.",
  },
  {
    id: "lang-stats-json",
    title: "Language Stats (Data)",
    path: "/api/profile/data/language-stats",
    method: "GET",
    type: "json",
    description:
      "Returns programming language distribution in JSON format. Cached for 3 hours.",
  },
  {
    id: "lang-stats-svg",
    title: "Language Stats (Card)",
    path: "/api/profile/card/language-stats",
    method: "GET",
    type: "svg",
    description:
      "Generates a visual SVG representation of most used languages. Cached for 1 hour.",
  },
];

const JsonViewer = ({ url }: { url: string }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const res = await axiosGet(url);
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch data");
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 bg-red-950/20 rounded-xl border border-red-900/30 text-red-400">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
      <pre className="p-6 bg-zinc-950 rounded-xl border border-zinc-800/80 overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] max-h-[300px] overflow-y-auto custom-scrollbar">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
};

const SvgViewer = ({ url }: { url: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative min-h-[200px] flex items-center justify-center bg-zinc-950/50 rounded-xl border border-zinc-800/80 p-6 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm z-10">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 z-10 bg-red-950/10">
          <AlertCircle className="w-6 h-6 mb-2" />
          <span className="text-sm font-medium">Failed to load SVG</span>
        </div>
      )}
      <img
        src={url}
        alt="API Output Preview"
        className={`max-w-full h-auto transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"}`}
        onLoad={() => {
          setLoading(false);
          setError(false);
        }}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
};

export default function Docs() {
  const [username, setUsername] = useState("abhinav550-lol");
  const [activeUsername, setActiveUsername] = useState(username);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleHomeClick = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleTry = () => {
    if (isSubmitting || !username.trim()) return;

    setIsSubmitting(true);
    setActiveUsername(username.trim());

    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <>
      <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          {/* Header Section (Asymmetric) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20 items-end">
            <div className="md:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <button
                  onClick={handleHomeClick}
                  className="group inline-flex items-center space-x-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800/80 rounded-full mb-8 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all duration-300 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:-translate-x-1 group-hover:text-zinc-300 transition-all duration-300" />
                  <span className="text-sm font-semibold tracking-wide text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    Home
                  </span>
                </button>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-6">
                  Connect your
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">
                    Data Stream
                  </span>
                </h1>
                <p className="text-zinc-400 text-lg leading-relaxed max-w-[45ch]">
                  Integrate real-time GitHub statistics directly into your
                  applications. Fast, cached, and beautifully rendered.
                </p>
              </motion.div>
            </div>

            <div className="md:col-span-5 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-zinc-900 border border-zinc-800 p-2 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex items-center">
                  <div className="pl-4 pr-3 text-zinc-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter GitHub username..."
                    className="w-full bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 py-4 font-mono text-sm"
                    spellCheck={false}
                  />
                  <div className="pr-2">
                    <button
                      onClick={handleTry}
                      disabled={isSubmitting}
                      className="bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 px-4 py-2 rounded-xl text-xs font-medium border border-zinc-700/50 flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Running</span>
                        </>
                      ) : (
                        <>
                          <span>Try</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* API Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {ENDPOINTS.map((endpoint, i) => {
              const requestUrl = `${BACKEND_URL}${endpoint.path}?username=${activeUsername}${endpoint.type === "svg" ? "&color_scheme=dark" : ""}`;

              return (
                <motion.div
                  key={endpoint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3 + i * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                  }}
                  className="group flex flex-col bg-zinc-900/40 rounded-[2rem] border border-zinc-800/60 p-2 hover:bg-zinc-900/60 transition-colors duration-500 overflow-hidden relative"
                >
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight text-zinc-100 mb-2">
                          {endpoint.title}
                        </h3>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-[50ch]">
                          {endpoint.description}
                        </p>
                      </div>
                      <div className="p-3 bg-zinc-800/50 rounded-2xl border border-zinc-700/30 text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-950/20 group-hover:border-emerald-900/30 transition-all duration-500">
                        {endpoint.type === "json" ? (
                          <Code2 className="w-5 h-5" />
                        ) : (
                          <ImageIcon className="w-5 h-5" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mb-6 bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800/80 overflow-x-auto">
                      <span className="text-[10px] font-bold tracking-widest text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded-md uppercase">
                        {endpoint.method}
                      </span>
                      <span className="font-mono text-sm text-zinc-400 whitespace-nowrap">
                        <span className="text-zinc-600">{BACKEND_URL}</span>
                        {endpoint.path}
                      </span>
                    </div>

                    <div className="mt-auto">
                      <div className="text-xs font-semibold tracking-wider text-zinc-600 uppercase mb-3 px-1">
                        Live Preview ({activeUsername})
                      </div>
                      {endpoint.type === "json" ? (
                        <JsonViewer url={requestUrl} />
                      ) : (
                        <SvgViewer url={requestUrl} />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
