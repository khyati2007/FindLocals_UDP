import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import translations from "./translations.js";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Clock3,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Wrench,
  Zap,
  Sparkles,
  Paintbrush,
  Wind,
  Hammer,
  Truck,
  Heart,
  SlidersHorizontal,
  CalendarDays,
  Phone,
  UserRound,
  BriefcaseBusiness,
  LayoutDashboard,
  Bot,
  Send,
  Check,
  CircleHelp,
  Globe2,
  Users,
  BadgeCheck,
  ClipboardList,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import "./App.css";

const initialWorkers = [
  {
    id: 1,
    name: "Ramesh Patel",
    service: "Plumber",
    area: "Navrangpura",
    city: "Ahmedabad",
    rating: 0,
    reviews: 0,
    price: 399,
    experience: 8,
    languages: "Gujarati · Hindi",
    available: "Available today",
    image: "photo-150 plumbing",
    photo:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=85",
    verified: false,
    demo: true,
    jobs: 0,
    about:
      "Reliable plumbing repairs, installations and emergency leak fixes. I believe in clear estimates and leaving every home tidy.",
  },
  {
    id: 2,
    name: "Farhan Sheikh",
    service: "Electrician",
    area: "Bodakdev",
    city: "Ahmedabad",
    rating: 0,
    reviews: 0,
    price: 499,
    experience: 6,
    languages: "Hindi · English",
    available: "Available today",
    photo:
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=85",
    verified: false,
    demo: true,
    jobs: 0,
    about:
      "Certified home electrician for safe wiring, lighting, fans and quick troubleshooting.",
  },
  {
    id: 3,
    name: "Sunita Desai",
    service: "Home cleaning",
    area: "Satellite",
    city: "Ahmedabad",
    rating: 0,
    reviews: 0,
    price: 299,
    experience: 5,
    languages: "Gujarati · English",
    available: "Available tomorrow",
    photo:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=85",
    verified: false,
    demo: true,
    jobs: 0,
    about:
      "Thoughtful home cleaning with flexible add-ons for kitchens, bathrooms and move-in resets.",
  },
  {
    id: 4,
    name: "Aarav Shah",
    service: "Painting",
    area: "Thaltej",
    city: "Ahmedabad",
    rating: 0,
    reviews: 0,
    price: 699,
    experience: 10,
    languages: "Gujarati · Hindi",
    available: "Available this week",
    photo:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=85",
    verified: false,
    demo: true,
    jobs: 0,
    about:
      "Interior refreshes, careful prep and clean, even finishes for homes of every size.",
  },
  {
    id: 5,
    name: "Imran Khan",
    service: "AC repair",
    area: "Vastrapur",
    city: "Ahmedabad",
    rating: 0,
    reviews: 0,
    price: 549,
    experience: 7,
    languages: "Hindi · English",
    available: "Available today",
    photo:
      "https://images.unsplash.com/photo-1631545806609-3c7c6e3a92aa?auto=format&fit=crop&w=800&q=85",
    verified: false,
    demo: true,
    jobs: 0,
    about:
      "AC servicing, installation and repairs for split and window units. Upfront diagnosis.",
  },
  {
    id: 6,
    name: "Kiran Parmar",
    service: "Carpenter",
    area: "Maninagar",
    city: "Ahmedabad",
    rating: 0,
    reviews: 0,
    price: 449,
    experience: 9,
    languages: "Gujarati · Hindi",
    available: "Available tomorrow",
    photo:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=85",
    verified: false,
    demo: true,
    jobs: 0,
    about:
      "Custom shelves, furniture repair and precise fittings made to last.",
  },
];
const defaultCategories = [
  { name: "Plumber", icon: Wrench, tint: "peach" },
  { name: "Electrician", icon: Zap, tint: "blue" },
  { name: "Home cleaning", icon: Sparkles, tint: "mint" },
  { name: "Painting", icon: Paintbrush, tint: "lilac" },
  { name: "AC repair", icon: Wind, tint: "blue" },
  { name: "Carpenter", icon: Hammer, tint: "peach" },
  { name: "Moving help", icon: Truck, tint: "mint" },
];
const copy = {
  EN: {
    navServices: "Services",
    navHow: "How it works",
    navJoin: "Join as a worker",
    login: "My bookings",
    heroEyebrow: "Neighbors near. Good help here.",
    heroTitle: "Good hands, right where you stand.",
    heroBody:
      "Book trusted local professionals for the little fixes and big to-dos around home.",
    search: "What do you need help with?",
    location: "Your neighborhood",
    find: "Find a pro",
    categories: "What can we help with?",
    explore: "Explore all services",
    popular: "Local pros people love",
    seeAll: "See all professionals",
    trust: "Good work. Good people. Good neighbors.",
    trustBody:
      "Every profile gives you the details you need to choose with confidence.",
    how: "Getting help is easy",
    howBody: "A few simple steps from “I need a hand” to “all sorted.”",
    joinTitle: "Your skills deserve to be seen.",
    joinBody:
      "Meet nearby customers, grow your reputation and choose the jobs that work for you.",
    joinButton: "Create your worker profile",
    footer: "A little help goes a long way.",
  },
  HI: {
    navServices: "सेवाएँ",
    navHow: "कैसे काम करता है",
    navJoin: "कामगार बनें",
    login: "मेरी बुकिंग",
    heroEyebrow: "मदद पास, भरोसा ख़ास",
    heroTitle: "कुशल हाथ, हर काम में साथ",
    heroBody: "घर के कामों के लिए भरोसेमंद स्थानीय पेशेवर बुक करें।",
    search: "आपको किस काम में मदद चाहिए?",
    location: "आपका इलाका",
    find: "कारीगर खोजें",
    categories: "हम किस काम में मदद करें?",
    explore: "सभी सेवाएँ देखें",
    popular: "पसंदीदा स्थानीय कारीगर",
    seeAll: "सभी कारीगर देखें",
    trust: "अच्छा काम। अच्छे लोग। अच्छे पड़ोसी।",
    trustBody: "सही चुनाव के लिए हर प्रोफ़ाइल में ज़रूरी जानकारी देखें।",
    how: "मदद पाना आसान है",
    howBody: "ज़रूरत से समाधान तक बस कुछ आसान कदम।",
    joinTitle: "आपका हुनर सबको दिखना चाहिए।",
    joinBody:
      "नज़दीकी ग्राहकों से जुड़ें, पहचान बनाएँ और अपने हिसाब से काम चुनें।",
    joinButton: "कारीगर प्रोफ़ाइल बनाएँ",
    footer: "छोटी सी मदद बड़ा बदलाव लाती है।",
  },
  GU: {
    navServices: "સેવાઓ",
    navHow: "કેવી રીતે કામ કરે છે",
    navJoin: "કામદાર તરીકે જોડાઓ",
    login: "મારી બુકિંગ",
    heroEyebrow: "મદદ પાસે, ભરોસો ખાસ",
    heroTitle: "સારા હાથ, દરેક કામમાં સાથ",
    heroBody: "ઘરના કામ માટે વિશ્વાસુ સ્થાનિક નિષ્ણાતોને બુક કરો.",
    search: "તમને કઈ મદદ જોઈએ છે?",
    location: "તમારો વિસ્તાર",
    find: "નિષ્ણાત શોધો",
    categories: "અમે શું મદદ કરી શકીએ?",
    explore: "બધી સેવાઓ જુઓ",
    popular: "લોકપ્રિય સ્થાનિક નિષ્ણાતો",
    seeAll: "બધા નિષ્ણાતો જુઓ",
    trust: "સારું કામ. સારા લોકો. સારા પડોશી.",
    trustBody: "વિશ્વાસથી પસંદગી કરવા દરેક પ્રોફાઇલની વિગતો જુઓ.",
    how: "મદદ મેળવવી સરળ છે",
    howBody: "જરૂરિયાતથી ઉકેલ સુધીના થોડા સરળ પગલાં.",
    joinTitle: "તમારી આવડત દેખાવા લાયક છે.",
    joinBody:
      "નજીકના ગ્રાહકોને મળો, તમારી પ્રતિષ્ઠા વધારો અને યોગ્ય કામ પસંદ કરો.",
    joinButton: "કામદાર પ્રોફાઇલ બનાવો",
    footer: "થોડી મદદથી મોટો ફેર પડે છે.",
  },
};
const storage = {
  read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};
function initialLanguage() {
  const saved = storage.read("fl-language", null);
  if (["EN", "HI", "GU"].includes(saved)) return saved;
  const browserLanguage = navigator.language?.toLowerCase() || "";
  if (browserLanguage.startsWith("hi")) return "HI";
  if (browserLanguage.startsWith("gu")) return "GU";
  return "EN";
}
async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      result.error || "The service is unavailable. Please try again.",
    );
  return result;
}

function App() {
  const locationState = useLocation();
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [workers, setWorkers] = useState(initialWorkers);
  const [categories, setCategories] = useState(defaultCategories);
  const [bookings, setBookings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authRole, setAuthRole] = useState("customer");
  const [authError, setAuthError] = useState("");
  const [workerProfile, setWorkerProfile] = useState(null);
  const [adminSummary, setAdminSummary] = useState(null);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminReviews, setAdminReviews] = useState([]);
  const [adminPayments, setAdminPayments] = useState([]);
  const [databaseTables, setDatabaseTables] = useState([]);
  const [adminCategories, setAdminCategories] = useState([]);
  const [lang, setLang] = useState(initialLanguage);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Ahmedabad");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [maxPrice, setMaxPrice] = useState("any");
  const [minRating, setMinRating] = useState("any");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [modal, setModal] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [pendingBooking, setPendingBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      from: "ai",
      text: "Hi there! Tell me what needs fixing, and I’ll help you find the right local pro.",
    },
  ]);
  useEffect(() => {
    let active = true;
    api("/api/workers")
      .then((data) => {
        if (!active) return;
        setWorkers(data.workers || []);
      })
      .catch(() => {
        if (active) setWorkers(initialWorkers);
      });
    api("/api/me")
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });
    api("/api/categories")
      .then((data) => {
        if (!active) return;
        setCategories((data.categories || []).map(({ name }) => ({
          name,
          ...(defaultCategories.find((category) => category.name === name) || { icon: Wrench, tint: "peach" }),
        })));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!authReady) return;
    if (user?.role === "admin" && locationState.pathname !== "/admin") {
      navigate("/admin", { replace: true });
      return;
    }
    if (locationState.pathname === "/admin" && user && user.role !== "admin")
      navigate("/", { replace: true });
  }, [authReady, locationState.pathname, user, navigate]);
  useEffect(() => {
    if (!user) return;
    let active = true;
    api("/api/bookings")
      .then((data) => {
        if (active) setBookings(data.bookings || []);
      })
      .catch(() => {
        if (active) setBookings([]);
      });
    if (user.role === "worker")
      api("/api/worker/profile")
        .then((data) => {
          if (active) setWorkerProfile(data.profile);
        })
        .catch(() => {});
    if (user.role === "admin") {
      api("/api/admin/summary")
        .then((data) => {
          if (active) setAdminSummary(data);
        })
        .catch(() => {});
      api("/api/admin/applications")
        .then((data) => {
          if (active) setApplications(data.applications || []);
        })
        .catch(() => {});
      api("/api/admin/workers")
        .then((data) => {
          if (active) setPendingWorkers(data.workers || []);
        })
        .catch(() => {});
      api("/api/admin/users")
        .then((data) => { if (active) setAdminUsers(data.users || []); })
        .catch(() => {});
      api("/api/admin/reviews")
        .then((data) => { if (active) setAdminReviews(data.reviews || []); })
        .catch(() => {});
      api("/api/admin/payments")
        .then((data) => { if (active) setAdminPayments(data.payments || []); })
        .catch(() => {});
      api("/api/admin/database/tables")
        .then((data) => { if (active) setDatabaseTables(data.tables || []); })
        .catch(() => {});
      api("/api/admin/categories")
        .then((data) => { if (active) setAdminCategories(data.categories || []); })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [user]);
  const t = copy[lang];
  const tr = (phrase) => translations[lang]?.[phrase] || phrase;
  const isAdminRoute = locationState.pathname === "/admin";
  const route = locationState.pathname;
  const isAccountRoute = route === "/account";
  const profileId = route.startsWith("/workers/") ? route.split("/").at(-1) : null;
  const routeWorker = selectedWorker || workers.find((worker) => String(worker.id) === profileId);
  const visibleAuthMode = isAdminRoute ? "login" : authMode;
  const authFormRole = isAccountRoute || pendingBooking ? "customer" : authRole;
  const visibleModal = isAdminRoute && authReady
    ? user?.role === "admin" ? "dashboard" : user ? null : "auth"
    : isAccountRoute ? "auth" : modal;
  const screenModal = visibleModal && !isAdminRoute && !isAccountRoute;
  useEffect(() => {
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);
  const filtered = useMemo(() => {
    let result = workers.filter(
      (w) =>
        `${w.name} ${w.service} ${w.area} ${w.city}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (activeCategory === "All" ||
          w.service.toLowerCase().includes(activeCategory.toLowerCase())) &&
        `${w.city} ${w.area}`.toLowerCase().includes(location.toLowerCase()) &&
        (maxPrice === "any" || Number(w.price) <= Number(maxPrice)) &&
        (minRating === "any" || Number(w.rating) >= Number(minRating)) &&
        (!availableOnly || /today|available/i.test(w.available || "")),
    );
    if (sort === "Top rated")
      result = [...result].sort((a, b) => b.rating - a.rating);
    if (sort === "Price: low to high")
      result = [...result].sort((a, b) => a.price - b.price);
    return result;
  }, [
    workers,
    query,
    location,
    activeCategory,
    sort,
    maxPrice,
    minRating,
    availableOnly,
  ]);
  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };
  const book = (worker) => {
    setSelectedWorker(worker);
    setAuthError("");
    if (!user) {
      setPendingBooking(true);
      setAuthRole("customer");
      setAuthMode("register");
      setModal("auth");
      return;
    }
    if (user.role !== "customer") {
      notify("Please use a customer account to request a service.");
      return;
    }
    setPendingBooking(false);
    setModal("booking");
  };
  const submitBooking = async (e) => {
    e.preventDefault();
    setBusy(true);
    setAuthError("");
    const data = new FormData(e.currentTarget);
    try {
      const result = await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          worker_id: selectedWorker.id,
          customer_name: data.get("customer"),
          phone: data.get("phone"),
          date: data.get("date"),
          slot: data.get("slot"),
          address: data.get("address"),
          description: data.get("description"),
        }),
      });
      setBookings((current) => [result.booking, ...current]);
      setModal(null);
      notify("Your request was sent to the worker.");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setBusy(false);
    }
  };
  const submitApplication = async (e) => {
    e.preventDefault();
    setBusy(true);
    setAuthError("");
    const data = new FormData(e.currentTarget);
    try {
      await api("/api/applications", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          service: data.get("service"),
          area: data.get("area"),
          phone: data.get("phone"),
          experience: data.get("experience"),
          about: data.get("about"),
        }),
      });
      setModal(null);
      notify("Application received. It will be reviewed before listing.");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setBusy(false);
    }
  };
  const submitAuth = async (e) => {
    e.preventDefault();
    setBusy(true);
    setAuthError("");
    const data = new FormData(e.currentTarget);
    const registering = authMode === "register" && !isAdminRoute;
    try {
      const result = await api(registering ? "/api/register" : "/api/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      setUser(result.user);
      const resumeBooking = pendingBooking && result.user.role === "customer";
      const openAdminPortal = result.user.role === "admin";
      setModal(resumeBooking ? "booking" : openAdminPortal ? "dashboard" : null);
      setPendingBooking(false);
      setAuthError("");
      if (openAdminPortal) navigate("/admin", { replace: true });
      else if (isAccountRoute && !resumeBooking) navigate("/", { replace: true });
      notify(
        registering
          ? "Your account is ready."
          : `Welcome back, ${result.user.name}.`,
      );
      if (locationState.pathname === "/admin" && result.user.role !== "admin") {
        setModal(null);
        navigate("/", { replace: true });
        notify("You do not have permission to do that.");
        return;
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setBusy(false);
    }
  };
  const signOut = async () => {
    try {
      await api("/api/logout", { method: "POST", body: "{}" });
      setUser(null);
      setBookings([]);
      setApplications([]);
      setWorkerProfile(null);
      setAdminSummary(null);
      setPendingWorkers([]);
      setAdminUsers([]);
      setAdminReviews([]);
      setAdminPayments([]);
      setDatabaseTables([]);
      setAdminCategories([]);
      setPendingBooking(false);
      setModal(null);
      notify("You have signed out.");
    } catch (error) {
      notify(error.message);
    }
  };
  const doBookingAction = async (id, action) => {
    try {
      await api(
        user.role === "worker"
          ? `/api/worker/bookings/${id}`
          : `/api/bookings/${id}`,
        { method: "POST", body: JSON.stringify({ action }) },
      );
      const data = await api("/api/bookings");
      setBookings(data.bookings || []);
      notify("Booking updated.");
    } catch (error) {
      notify(error.message);
    }
  };
  const doAdminBookingAction = async (id, action) => {
    const statuses = { accept: "Accepted", reject: "Rejected", start: "In progress", complete: "Completed", cancel: "Cancelled" };
    try {
      await api(`/api/admin/bookings/${id}`, { method: "POST", body: JSON.stringify({ status: statuses[action] }) });
      const data = await api("/api/bookings");
      setBookings(data.bookings || []);
      notify("Booking status updated.");
    } catch (error) {
      notify(error.message);
    }
  };
  const removeReview = async (id) => {
    try {
      await api(`/api/admin/reviews/${id}`, { method: "POST", body: JSON.stringify({ action: "remove" }) });
      const [reviews, listings] = await Promise.all([api("/api/admin/reviews"), api("/api/workers")]);
      setAdminReviews(reviews.reviews || []);
      setWorkers(listings.workers || []);
      notify("Review removed.");
    } catch (error) {
      notify(error.message);
    }
  };
  const updateAdminPayment = async (payment, status) => {
    try {
      await api(`/api/admin/payments/${payment.id}`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      const result = await api("/api/admin/payments");
      setAdminPayments(result.payments || []);
      notify(status === "paid" ? "Payment marked as paid." : "Payment marked as refunded.");
    } catch (error) {
      notify(error.message);
    }
  };
  const submitCategory = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await api("/api/admin/categories", { method: "POST", body: JSON.stringify({ name: data.get("name") }) });
      const result = await api("/api/admin/categories");
      setAdminCategories(result.categories || []);
      const publicCategories = await api("/api/categories");
      setCategories((publicCategories.categories || []).map(({ name }) => ({
        name,
        ...(defaultCategories.find((category) => category.name === name) || { icon: Wrench, tint: "peach" }),
      })));
      form.reset();
      notify("Category added.");
    } catch (error) {
      notify(error.message);
    }
  };
  const disableCategory = async (id) => {
    try {
      await api(`/api/admin/categories/${id}`, { method: "POST", body: JSON.stringify({ active: false }) });
      const result = await api("/api/admin/categories");
      setAdminCategories(result.categories || []);
      const publicCategories = await api("/api/categories");
      setCategories((publicCategories.categories || []).map(({ name }) => ({
        name,
        ...(defaultCategories.find((category) => category.name === name) || { icon: Wrench, tint: "peach" }),
      })));
      notify("Category disabled.");
    } catch (error) {
      notify(error.message);
    }
  };
  const reviewApplication = async (id, action) => {
    try {
      await api(`/api/admin/applications/${id}`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      const [apps, pros, summary] = await Promise.all([
        api("/api/admin/applications"),
        api("/api/workers"),
        api("/api/admin/summary"),
      ]);
      setApplications(apps.applications || []);
      setWorkers(pros.workers || []);
      setAdminSummary(summary);
      notify(`Application ${action === "approve" ? "approved" : "declined"}.`);
    } catch (error) {
      notify(error.message);
    }
  };
  const verifyWorker = async (id, action) => {
    try {
      await api(`/api/admin/workers/${id}`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      const [profiles, summary, listings] = await Promise.all([
        api("/api/admin/workers"),
        api("/api/admin/summary"),
        api("/api/workers"),
      ]);
      setPendingWorkers(profiles.workers || []);
      setAdminSummary(summary);
      setWorkers(listings.workers || []);
      notify(`Worker ${action === "approve" ? "verified" : "declined"}.`);
    } catch (error) {
      notify(error.message);
    }
  };
  const updateWorkerBooking = async (id, action) => doBookingAction(id, action);
  const startBookingAction = (id, action) => {
    if (action === "review") {
      setSelectedBooking(bookings.find((booking) => booking.id === id));
      setAuthError("");
      setModal("review");
    } else {
      doBookingAction(id, action);
    }
  };
  const submitReview = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setBusy(true);
    setAuthError("");
    const data = new FormData(e.currentTarget);
    try {
      await api(`/api/bookings/${selectedBooking.id}`, {
        method: "POST",
        body: JSON.stringify({
          action: "review",
          rating: data.get("rating"),
          comment: data.get("comment"),
        }),
      });
      const result = await api("/api/bookings");
      setBookings(result.bookings || []);
      setModal("dashboard");
      notify("Thank you for sharing your feedback.");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setBusy(false);
    }
  };
  const updateProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    setAuthError("");
    const data = new FormData(e.currentTarget);
    try {
      const result = await api("/api/profile", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      setUser(result.user);
      notify("Profile updated.");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setBusy(false);
    }
  };
  const updateWorkerProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    setAuthError("");
    const data = new FormData(e.currentTarget);
    try {
      const result = await api("/api/worker/profile", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      setWorkerProfile(result.profile);
      const listings = await api("/api/workers");
      setWorkers(listings.workers || []);
      notify("Worker profile saved.");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setBusy(false);
    }
  };
  const answerAI = (e) => {
    e.preventDefault();
    if (!aiText.trim()) return;
    const text = aiText.trim();
    const lower = text.toLowerCase();
    const serviceWords = {
      Plumber: ["plumb", "pipe", "leak"], Electrician: ["electric", "wire", "wiring"],
      "Home cleaning": ["clean", "cleaning", "maid"], Painting: ["paint", "painting"],
      "AC repair": ["air conditioner", "cooling", " ac "], Carpenter: ["carpenter", "wood", "furniture"],
      "Moving help": ["moving", "move house", "packing", "relocation"],
    };
    const match = categories.find((c) => {
      const name = c.name.toLowerCase();
      const keywordMatch = (serviceWords[c.name] || []).some((word) => lower.includes(word));
      return lower.includes(name) || keywordMatch;
    });
    const localize = (en, hi, gu) => ({ EN: en, HI: hi, GU: gu })[lang];
    let response;
    if (match) {
      const matches = workers.filter((w) => w.service.toLowerCase().includes(match.name.toLowerCase()));
      response = matches.length
        ? localize(`I found ${matches.length} local ${match.name} profile(s). Compare price, experience and verification in Find work. Browse without an account; sign in when you book.`, `${matches.length} स्थानीय ${tr(match.name)} प्रोफ़ाइल मिलीं। Find work में कीमत, अनुभव और सत्यापन देखें। बिना खाते के ब्राउज़ करें; बुकिंग के समय साइन इन करें।`, `${matches.length} સ્થાનિક ${tr(match.name)} પ્રોફાઇલ મળી. Find work માં કિંમત, અનુભવ અને ચકાસણી જુઓ. એકાઉન્ટ વિના બ્રાઉઝ કરો; બુકિંગ વખતે સાઇન ઇન કરો.`)
        : localize(`No ${match.name} professionals are listed in this area yet. Try another service or ask again later.`, `इस इलाके में अभी ${tr(match.name)} पेशेवर सूचीबद्ध नहीं हैं। दूसरी सेवा आज़माएँ या बाद में फिर पूछें।`, `આ વિસ્તારમાં હાલમાં ${tr(match.name)} નિષ્ણાતો સૂચિબદ્ધ નથી. બીજી સેવા અજમાવો અથવા પછી ફરી પૂછો.`);
    } else if (/service|offer|provide|help me find|service area|nearby/.test(lower)) {
      response = localize(`We currently list ${categories.map((category) => category.name).join(", ")}. I can help you compare the local profiles and explain booking, worker approval, prices and payment tracking.`, `अभी ये सेवाएँ सूचीबद्ध हैं: ${categories.map((category) => tr(category.name)).join(", ")}। मैं प्रोफ़ाइल की तुलना, बुकिंग, कामगार मंज़ूरी, कीमत और भुगतान स्थिति समझा सकता हूँ।`, `હાલમાં આ સેવાઓ સૂચિબદ્ધ છે: ${categories.map((category) => tr(category.name)).join(", ")}. હું પ્રોફાઇલ સરખામણી, બુકિંગ, કામદાર મંજૂરી, કિંમત અને ચુકવણી સ્થિતિ સમજાવી શકું છું.`);
    } else if (/book|booking|request|appointment/.test(lower)) {
      response = localize("Browse profiles without an account. When you request a booking, sign in or create a customer account, then follow the request from your account.", "बिना खाते के प्रोफ़ाइल देखें। बुकिंग अनुरोध भेजने के लिए साइन इन करें या ग्राहक खाता बनाएँ। फिर अपने खाते में अनुरोध की स्थिति देखें।", "એકાઉન્ટ વિના પ્રોફાઇલ જુઓ. બુકિંગ વિનંતી માટે સાઇન ઇન કરો અથવા ગ્રાહક એકાઉન્ટ બનાવો. પછી તમારા એકાઉન્ટમાં વિનંતીની સ્થિતિ જુઓ.");
    } else if (/pay|payment|price|cost|charge|refund/.test(lower)) {
      response = localize("Prices are starting estimates. Cash payments can be recorded after a completed job; card, UPI and online payment processing are not connected.", "दिखाई गई कीमतें शुरुआती अनुमान हैं। काम पूरा होने पर नकद भुगतान दर्ज किया जा सकता है; कार्ड, UPI और ऑनलाइन भुगतान जुड़े नहीं हैं।", "દેખાતી કિંમતો શરૂઆતના અંદાજ છે. કામ પૂરું થયા પછી રોકડ ચુકવણી નોંધાય છે; કાર્ડ, UPI અને ઓનલાઇન ચુકવણી જોડાયેલ નથી.");
    } else if (/worker|professional|join|earn|job/.test(lower)) {
      response = localize("Choose Join as a worker to submit your skills and service area. Your listing stays hidden until an administrator approves it.", "अपना कौशल और सेवा क्षेत्र भेजने के लिए कामगार के रूप में जुड़ें चुनें। एडमिन की मंज़ूरी तक आपकी सूची छिपी रहेगी।", "તમારી કુશળતા અને સેવા વિસ્તાર મોકલવા કામદાર તરીકે જોડાઓ પસંદ કરો. એડમિનની મંજૂરી મળે ત્યાં સુધી તમારી સૂચિ દેખાશે નહીં.");
    } else if (/admin|verify|approval|verified/.test(lower)) {
      response = localize("An administrator reviews worker profiles before they appear as verified. Admin sign-in is at /admin.", "कामगार प्रोफ़ाइल को सत्यापित दिखाने से पहले एडमिन जाँचता है। एडमिन साइन इन /admin पर है।", "કામદાર પ્રોફાઇલને ચકાસાયેલ બતાવતા પહેલાં એડમિન તપાસે છે. એડમિન સાઇન ઇન /admin પર છે.");
    } else if (/language|hindi|gujarati|ગુજરાતી|हिन्दी/.test(lower)) {
      response = localize("Use the language selector in the top navigation to switch between English, Hindi and Gujarati. Your choice is saved on this device.", "ऊपर के भाषा मेनू से अंग्रेज़ी, हिंदी या गुजराती चुनें। आपकी पसंद इस डिवाइस पर सहेजी जाती है।", "ઉપરના ભાષા મેનૂમાંથી અંગ્રેજી, હિન્દી અથવા ગુજરાતી પસંદ કરો. તમારી પસંદ આ ઉપકરણમાં સાચવાય છે.");
    } else if (/contact|support|help|email|phone/.test(lower)) {
      response = localize("Open Contact in the navigation for support information and help options.", "सहायता की जानकारी और विकल्पों के लिए मेनू में Contact खोलें।", "સહાયની માહિતી અને વિકલ્પો માટે મેનૂમાં Contact ખોલો.");
    } else {
      response = localize("I can help with services, choosing a worker, booking, account access, worker approval, prices, payment tracking and language settings. Tell me a little more and I’ll point you to the right place.", "मैं सेवाएँ, कामगार चुनना, बुकिंग, खाते, कामगार मंज़ूरी, कीमत, भुगतान स्थिति और भाषा सेटिंग में मदद कर सकता हूँ। थोड़ा और बताएँ, मैं सही जगह दिखाऊँगा।", "હું સેવાઓ, કામદાર પસંદગી, બુકિંગ, એકાઉન્ટ, કામદાર મંજૂરી, કિંમત, ચુકવણી સ્થિતિ અને ભાષા સેટિંગમાં મદદ કરી શકું છું. થોડું વધુ કહો, હું યોગ્ય જગ્યાએ દોરીશ.");
    }
    setAiMessages((m) => [
      ...m,
      { from: "you", text },
      { from: "ai", text: response },
    ]);
    setAiText("");
  };

  return (
    <div className={`site-shell ${isAccountRoute ? "account-mode" : ""} ${isAdminRoute ? "admin-mode" : ""} ${screenModal ? `screen-mode screen-mode-${visibleModal}` : ""}`}>
      <div className="topline">
        <span>
          <span className="live-dot" /> {tr("Here for your neighborhood")}
        </span>
        <span>
          {tr("Good people, just around the corner")} <ArrowUpRight size={13} />
        </span>
      </div>
      <header className="header">
        <a className="brand" href="#home" aria-label="Find Locals home">
          <span className="brand-mark">
            <MapPin size={22} fill="currentColor" />
          </span>
          <span>
            find<span className="brand-accent">locals</span>
            <small>{tr("GOOD HELP, CLOSE TO HOME")}</small>
          </span>
        </a>
        <button
          className="mobile-toggle"
          onClick={() => setMobileNav(!mobileNav)}
          aria-label="Toggle navigation"
        >
          {mobileNav ? <X /> : <Menu />}
        </button>
        <nav className={mobileNav ? "nav open" : "nav"}>
          <button className="nav-link" onClick={() => { navigate("/workers"); setMobileNav(false); }}>{tr("Find work")}</button>
          <button className="nav-link" onClick={() => { navigate("/services"); setMobileNav(false); }}>{t.navServices}</button>
          <button className="nav-link" onClick={() => { navigate("/contact"); setMobileNav(false); }}>{tr("Contact")}</button>
          <button
            className="nav-link"
            onClick={() => {
              setAuthMode("register");
              setAuthRole("worker");
              setAuthError("");
              navigate("/");
              setModal("auth");
              setMobileNav(false);
            }}
          >
            {t.navJoin}
          </button>
          <button
            className="bookings-link"
            onClick={() => {
              setAuthError("");
              if (user) setModal("dashboard");
              else { setAuthMode("login"); navigate("/account"); }
            }}
          >
            <ClipboardList size={17} /> {user ? user.name : tr("Sign in")}
            {bookings.length > 0 && user && <b>{bookings.length}</b>}
          </button>
          <label className="language">
            <Globe2 size={15} />
            <select
              aria-label="Select language"
              value={lang}
              onChange={(e) => {
                setLang(e.target.value);
                storage.write("fl-language", e.target.value);
              }}
            >
              <option value="EN">English</option>
              <option value="HI">हिन्दी</option>
              <option value="GU">ગુજરાતી</option>
            </select>
            <ChevronDown size={13} />
          </label>
        </nav>
      </header>
      <main id="home">
      {route === "/" || isAccountRoute || isAdminRoute ? <>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-icon">
                <Sparkles size={14} />
              </span>
              {t.heroEyebrow}
            </div>
            <h1>
              {t.heroTitle.split(" ").slice(0, -3).join(" ")}{" "}
              <em>{t.heroTitle.split(" ").slice(-3).join(" ")}</em>
            </h1>
            <p>{t.heroBody}</p>
            <div className="search-card">
              <label className="search-field">
                <Search size={19} />
                <span>
                  <small>{tr("WHAT NEEDS DOING?")}</small>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.search}
                  />
                </span>
              </label>
              <span className="search-divider" />
              <label className="search-field location-field">
                <MapPin size={19} />
                <span>
                  <small>{tr("YOUR LOCATION")}</small>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.location}
                  />
                </span>
              </label>
              <button
                className="primary-button search-button"
                onClick={() =>
                  document
                    .querySelector("#pros")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t.find}
                <ArrowRight size={17} />
              </button>
            </div>
            <div className="hero-proof">
              <span>
                <strong>{workers.length}</strong> local profiles to explore
              </span>
              <span className="proof-stars">
                <ShieldCheck size={14} /> {workers.filter((worker) => worker.verified).length} verified professionals
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <img
              className="hero-photo"
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=90"
              alt="Local home professional helping with a home project"
            />
            <div className="photo-wash" />
            <div className="hero-note note-top">
              <span className="note-icon orange">
                <ShieldCheck size={18} />
              </span>
              <span>
                <strong>{tr("Compare with clarity")}</strong>
                <small>{tr("Service, area and price upfront")}</small>
              </span>
              <BadgeCheck size={19} className="note-check" />
            </div>
            <div className="hero-note note-bottom">
              <span className="mini-rating"><ShieldCheck size={15} /></span>
              <span>
                <strong>{tr("Verified when approved")}</strong>
                <small>{tr("Reviewed by Find Locals admins")}</small>
              </span>
            </div>
            <div className="hero-sticker">
              <span className="sticker-sun">
                <Sparkles size={18} />
              </span>{" "}
              {tr("Small jobs")},
              <br />
              big relief.
            </div>
          </div>
        </section>
        <div className="trust-strip">
          <span>
            <ShieldCheck /> Verification before listing
          </span>
          <i />
          <span>
            <Clock3 /> Flexible scheduling
          </span>
          <i />
          <span>
            <Heart /> Neighbors helping neighbors
          </span>
          <i />
          <span>
            <MapPin /> Ahmedabad, Gujarat
          </span>
        </div>
        <section className="section categories-section" id="services">
          <div className="section-heading">
            <div>
              <div className="kicker">{tr("A GOOD PLACE TO START")}</div>
              <h2>{t.categories}</h2>
            </div>
            <button
              className="text-link"
              onClick={() => {
                setActiveCategory("All");
                document
                  .querySelector("#pros")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t.explore}
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="category-grid">
            {categories.map(({ name, icon: Icon, tint }) => (
              <button
                className="category-card"
                key={name}
                onClick={() => {
                  setActiveCategory(name === "Moving help" ? "All" : name);
                  document
                    .querySelector("#pros")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span className={`category-icon ${tint}`}>
                  <Icon size={23} strokeWidth={1.8} />
                </span>
                <strong>{name}</strong>
                <small>{workers.filter((w) => w.service.toLowerCase().includes(name.toLowerCase())).length} {tr("profiles listed")}</small>
                <ArrowRight className="category-arrow" size={15} />
              </button>
            ))}
          </div>
        </section>
        <section className="section pros-section" id="pros">
          <div className="section-heading pros-heading">
            <div>
              <div className="kicker">{tr("GOOD HANDS, RIGHT HERE")}</div>
              <h2>{t.popular}</h2>
              <p>
                Real skills, honest reviews and a familiar face from your part
                of town.
              </p>
            </div>
            <button
              className="outline-button"
              onClick={() => {
                setActiveCategory("All");
                setQuery("");
              }}
            >
              {t.seeAll}
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="filter-bar">
            <div className="filter-pills">
              <button
                className={
                  activeCategory === "All"
                    ? "filter-pill active"
                    : "filter-pill"
                }
                onClick={() => setActiveCategory("All")}
              >
                {tr("All pros")} <span>{workers.length}</span>
              </button>
              {categories.slice(0, 5).map((c) => (
                <button
                  key={c.name}
                  className={
                    activeCategory === c.name
                      ? "filter-pill active"
                      : "filter-pill"
                  }
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === c.name ? "All" : c.name,
                    )
                  }
                >
                  {tr(c.name)}
                </button>
              ))}
            </div>
            <div className="filter-controls">
              <label className="sort-label">
                {tr("Price")}
                <select
                  aria-label="Maximum starting price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                >
                  <option value="any">{tr("Any")}</option>
                  <option value="400">{tr("Under ₹400")}</option>
                  <option value="600">{tr("Under ₹600")}</option>
                  <option value="800">{tr("Under ₹800")}</option>
                </select>
              </label>
              <label className="sort-label">
                {tr("Rating")}
                <select
                  aria-label="Minimum rating"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                >
                  <option value="any">{tr("Any")}</option>
                  <option value="4">{tr("4+ stars")}</option>
                  <option value="4.5">{tr("4.5+ stars")}</option>
                  <option value="4.8">{tr("4.8+ stars")}</option>
                </select>
              </label>
              <label className="availability-toggle">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                />{" "}
                {tr("Available today")}
              </label>
              <label className="sort-label sort-select">
                <SlidersHorizontal size={15} />
                <select
                  aria-label="Sort workers"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="Recommended">{tr("Recommended")}</option>
                  <option value="Top rated">{tr("Top rated")}</option>
                  <option value="Price: low to high">{tr("Price: low to high")}</option>
                </select>
                <ChevronDown size={13} />
              </label>
            </div>
          </div>
          {filtered.length ? (
            <div className="worker-grid">
              {filtered.slice(0, 6).map((worker) => (
                <article className="worker-card" key={worker.id}>
                  <div className="worker-image-wrap">
                    <img
                      src={worker.photo}
                      alt={`${worker.name}, ${worker.service}`}
                    />
                    <span className="verified-chip">
                      <ShieldCheck size={13} />
                      {worker.verified ? tr("Verified") : tr("Sample profile")}
                    </span>
                    <button
                      className="favorite"
                      aria-label="Save worker"
                      onClick={(e) => {
                        e.currentTarget.classList.toggle("saved");
                        notify("Saved to your favorites.");
                      }}
                    >
                      <Heart size={17} />
                    </button>
                  </div>
                  <div className="worker-content">
                    <div className="worker-title">
                      <div>
                        <h3>{worker.name}</h3>
                        <p>
                          {worker.service} <span>·</span> {worker.area}
                        </p>
                      </div>
                      {worker.reviews > 0 && (
                        <span className="rating">
                          <Star size={14} fill="currentColor" />{" "}
                          {worker.rating.toFixed(1)}{" "}
                          <small>({worker.reviews})</small>
                        </span>
                      )}
                    </div>
                    <div className="worker-meta">
                      <span>
                        <BriefcaseBusiness size={14} /> {worker.experience}{" "}
                        {tr("years")}
                      </span>
                      <span>
                        <MapPin size={14} /> {worker.city}
                      </span>
                    </div>
                    <div className="availability">
                      <span className="available-dot" />
                      {worker.available}
                      <span className="price">
                        {tr("from")} <strong>₹{worker.price}</strong>
                      </span>
                    </div>
                    <button
                      className="worker-cta"
                      onClick={() => {
                        setSelectedWorker(worker);
                        navigate(`/workers/${worker.id}`);
                      }}
                    >
                      {tr("View profile")} <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={24} />
              <h3>{tr("No pros found just yet")}</h3>
              <p>{tr("Try a different service or neighborhood to find your match.")}</p>
              <button
                className="text-link"
                onClick={() => {
                  setQuery("");
                  setLocation("Ahmedabad");
                  setActiveCategory("All");
                }}
              >
                {tr("Clear search")} <ArrowRight size={15} />
              </button>
            </div>
          )}
        </section>
        <section className="trust-section">
          <div className="trust-copy">
            <div className="kicker">{tr("A LITTLE MORE PEACE OF MIND")}</div>
            <h2>{t.trust}</h2>
            <p>
              {t.trustBody} We put the useful stuff upfront, so finding help
              feels a little more human.
            </p>
            <button className="white-button" onClick={() => setModal("trust")}>
              How we build trust <ArrowRight size={16} />
            </button>
          </div>
          <div className="trust-features">
            <div>
              <span className="feature-icon">
                <BadgeCheck />
              </span>
              <strong>{tr("Verified before we say verified")}</strong>
              <p>
                Worker accounts stay hidden from public search until an admin approves the profile.
              </p>
            </div>
            <div>
              <span className="feature-icon">
                <MessageCircle />
              </span>
              <strong>{tr("Clear from the start")}</strong>
              <p>
                See ratings left by customers after completed services.
              </p>
            </div>
            <div>
              <span className="feature-icon">
                <Heart />
              </span>
              <strong>{tr("Local by nature")}</strong>
              <p>{tr("We help you meet talented people who live and work nearby.")}</p>
            </div>
          </div>
        </section>
        <section className="section how-section" id="how">
          <div className="section-heading centered-heading">
            <div>
              <div className="kicker">{tr("NO GUESSWORK, JUST GOOD HELP")}</div>
              <h2>{t.how}</h2>
              <p>{t.howBody}</p>
            </div>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">01</span>
              <div className="step-illustration search-illus">
                <Search size={28} />
                <MapPin size={18} />
              </div>
              <h3>{tr("Tell us what you need")}</h3>
              <p>
                {tr("Choose a service and your neighborhood. No account needed to browse.")}
              </p>
            </div>
            <div className="step-connector">
              <ArrowRight />
            </div>
            <div className="step-card">
              <span className="step-number">02</span>
              <div className="step-illustration star-illus">
                <UserRound size={27} />
                <Star size={16} fill="currentColor" />
              </div>
              <h3>{tr("Meet your kind of pro")}</h3>
              <p>
                {tr("Compare skills, reviews, availability and clear starting prices.")}
              </p>
            </div>
            <div className="step-connector">
              <ArrowRight />
            </div>
            <div className="step-card">
              <span className="step-number">03</span>
              <div className="step-illustration check-illus">
                <CalendarDays size={28} />
                <Check size={16} />
              </div>
              <h3>{tr("Make a plan together")}</h3>
              <p>
                {tr("Send a request in seconds and keep your service details in one place.")}
              </p>
            </div>
          </div>
        </section>
        <section className="join-banner">
          <div className="join-art">
            <span className="join-sun">✳</span>
            <div className="join-circle">
              <Wrench size={43} />
            </div>
            <span className="join-spark">✦</span>
          </div>
          <div className="join-copy">
            <div className="kicker">{tr("FOR THE PEOPLE WHO MAKE IT WORK")}</div>
            <h2>{t.joinTitle}</h2>
            <p>{t.joinBody}</p>
            <button className="primary-button" onClick={() => { setAuthMode("register"); setAuthRole("worker"); setAuthError(""); setModal("auth"); }}>
              {t.joinButton}
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="join-stat">
            <strong>{workers.length}</strong>
            <span>
              local profiles
              <br />
              currently listed
            </span>
            <div className="join-stars">{tr("Join the network")}</div>
          </div>
        </section>
        <section className="community-strip">
          <span className="community-icon">
            <Users size={20} />
          </span>
          <div>
              <strong>{tr("A platform built around people, not just appointments.")}</strong>
            <p>
              {tr("Every booking is a chance for neighbors to support one another.")}
            </p>
          </div>
          <button onClick={() => setAiOpen(true)}>
            {tr("Ask our local guide")} <ArrowRight size={15} />
          </button>
        </section>
      </> : route === "/workers" ? (
        <section className="section route-page workers-route">
          <div className="section-heading"><div><div className="kicker">{tr("LOCAL PROFESSIONALS")}</div><h1>{tr("Find local help")}</h1><p>{tr("Search, compare and book a service near you.")}</p></div></div>
          <div className="filters-bar route-filters">
            <label className="search-field"><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr("Service, worker or location")}/></label>
            <label className="sort-label">{tr("Service")}<select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}><option value="All">{tr("All services")}</option>{categories.map((c) => <option key={c.name}>{c.name}</option>)}</select></label>
            <label className="sort-label">{tr("Location")}<input value={location} onChange={(e) => setLocation(e.target.value)} aria-label={tr("Location")}/></label>
            <label className="sort-label">{tr("Maximum price")}<select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}><option value="any">{tr("Any")}</option><option value="400">₹400</option><option value="600">₹600</option><option value="800">₹800</option></select></label>
            <label className="sort-label">{tr("Rating")}<select value={minRating} onChange={(e) => setMinRating(e.target.value)}><option value="any">{tr("Any")}</option><option value="4">{tr("4+ stars")}</option><option value="4.5">{tr("4.5+ stars")}</option></select></label>
            <label className="sort-label"><input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)}/>{tr("Available today")}</label>
          </div>
          <div className="worker-grid route-worker-grid">{filtered.map((worker) => <article className="worker-card" key={worker.id}><div className="worker-image-wrap"><img src={worker.photo} alt=""/><span className="verified-chip"><ShieldCheck size={13}/>{worker.verified ? tr("Verified") : tr("Sample profile")}</span></div><div className="worker-content"><div className="worker-title"><div><h3>{worker.name}</h3><p>{worker.service} · {worker.area}, {worker.city}</p></div></div><div className="worker-meta"><span>{worker.experience} {tr("years")} · {worker.languages}</span></div><p>{worker.about}</p><div className="availability">{worker.available}<span className="price">{tr("from")} <strong>₹{worker.price}</strong></span></div><button className="worker-cta" onClick={() => { setSelectedWorker(worker); navigate(`/workers/${worker.id}`); }}>{tr("View profile")} <ArrowRight size={15}/></button></div></article>)}</div>
          {!filtered.length && <div className="empty-state"><Search/><h3>{tr("No pros found just yet")}</h3><p>{tr("Try a different service or neighborhood to find your match.")}</p></div>}
        </section>
      ) : route === "/services" ? (
        <section className="section route-page"><div className="section-heading"><div><div className="kicker">{tr("FIND THE RIGHT HELP")}</div><h1>{tr("Services for your home and neighborhood")}</h1><p>{tr("Browse local service categories, compare professionals and request a booking when you are ready.")}</p></div></div><div className="category-grid">{categories.map((category) => <button className="category-card" key={category.name} onClick={() => { setActiveCategory(category.name); navigate("/workers"); }}><span className="category-icon"><category.icon size={22}/></span><strong>{category.name}</strong><small>{workers.filter((w) => w.service.toLowerCase().includes(category.name.toLowerCase())).length} {tr("profiles listed")}</small><ArrowRight size={17}/></button>)}</div><div className="route-callout"><h2>{tr("Not sure where to start?")}</h2><p>{tr("Ask Findy for help choosing a service or finding a local professional.")}</p><button className="primary-button" onClick={() => setAiOpen(true)}>{tr("Ask Findy")} <ArrowRight size={16}/></button></div></section>
      ) : route === "/contact" ? (
        <section className="section route-page contact-route">
          <div className="section-heading"><div><div className="kicker">{tr("WE ARE HERE TO HELP")}</div><h1>{tr("Contact Find Locals")}</h1><p>{tr("Questions about finding a service, a booking or joining as a worker? Get in touch with our local team.")}</p></div></div>
          <div className="contact-grid">
            <article className="contact-card"><span className="feature-icon"><MapPin/></span><h2>{tr("Local service area")}</h2><p>{tr("Find Locals currently helps customers discover workers in Ahmedabad and nearby neighborhoods.")}</p><span className="feature-icon"><CircleHelp/></span><h2>{tr("Need booking help?")}</h2><p>{tr("Sign in to see your requests, or ask Findy for guidance about services and using the website.")}</p><button className="primary-button" onClick={() => setAiOpen(true)}>{tr("Ask Findy")} <ArrowRight size={16}/></button></article>
            <article className="contact-card"><h2>{tr("For customers and workers")}</h2><p>{tr("Customers can browse freely, then sign in when they are ready to book. Local professionals can apply to join and wait for admin verification.")}</p><button className="outline-button" onClick={() => navigate("/account")}>{tr("Customer sign in")} <ArrowRight size={15}/></button><button className="primary-button" onClick={() => { setAuthRole("worker"); setAuthMode("register"); setModal("auth"); }}>{tr("Join as a worker")} <ArrowRight size={15}/></button></article>
          </div>
        </section>
      ) : profileId && routeWorker ? (
        <section className="section route-page full-profile"><button className="text-link" onClick={() => navigate("/workers")}>← {tr("Back to professionals")}</button><div className="profile-hero"><img src={routeWorker.photo} alt=""/><div><span className="verified-chip"><ShieldCheck size={13}/>{routeWorker.verified ? tr("Verified professional") : tr("Sample profile")}</span><h1>{routeWorker.name}</h1><p>{routeWorker.service} · {routeWorker.area}, {routeWorker.city}</p>{routeWorker.reviews > 0 && <div className="profile-rating"><Star size={15} fill="currentColor"/> <strong>{routeWorker.rating.toFixed(1)}</strong> ({routeWorker.reviews} {tr("neighbor reviews")})</div>}</div></div><div className="profile-stats"><div><strong>{routeWorker.experience} {tr("years")}</strong><small>{tr("experience")}</small></div><div><strong>{routeWorker.jobs || 0}</strong><small>{tr("jobs completed")}</small></div><div><strong>{routeWorker.languages}</strong><small>{tr("languages")}</small></div></div><h2>{tr("A little about their work")}</h2><p className="profile-about">{routeWorker.about}</p><div className="profile-availability"><span className="available-dot"/>{routeWorker.available}<span>{tr("Starting at")} <strong>₹{routeWorker.price}</strong></span></div><button className="primary-button" onClick={() => book(routeWorker)}>{tr("Request a booking")} <ArrowRight size={16}/></button></section>
      ) : <section className="section route-page"><h1>{tr("Page not found")}</h1><button className="primary-button" onClick={() => navigate("/")}>{tr("Back home")}</button></section>}
      </main>
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand" href="#home">
              <span className="brand-mark">
                <MapPin size={22} fill="currentColor" />
              </span>
              <span>
                find<span className="brand-accent">locals</span>
                <small>{tr("GOOD HELP, CLOSE TO HOME")}</small>
              </span>
            </a>
            <p>
              {t.footer}
              <br />
              {tr("Connecting good people with good work.")}
            </p>
          </div>
          <div className="footer-col">
            <strong>{tr("Explore")}</strong>
            <button onClick={() => navigate("/services")}>{tr("Home services")}</button>
            <button onClick={() => navigate("/workers")}>{tr("Meet local pros")}</button>
            <button onClick={() => navigate("/")}>{tr("How it works")}</button>
            <button onClick={() => navigate("/contact")}>{tr("Contact")}</button>
          </div>
          <div className="footer-col">
            <strong>{tr("For professionals")}</strong>
            <button
              onClick={() => {
                setAuthMode("register");
                setAuthRole("worker");
                setAuthError("");
                setModal("auth");
              }}
            >
              {tr("Join as a worker")}
            </button>
            <button
              onClick={() => {
                if (user?.role === "worker") setModal("dashboard");
                else {
                  setAuthMode("login");
                  setModal("auth");
                }
              }}
            >
              {tr("Worker dashboard")}
            </button>
          </div>
          <div className="footer-help">
            <span className="help-bubble">
              <CircleHelp size={20} />
            </span>
            <strong>{tr("Need a hand?")}</strong>
            <p>{tr("Our local guide can help you find the right service.")}</p>
            <button onClick={() => setAiOpen(true)}>
              Ask Findy <ArrowRight size={14} />
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Find Locals. Made for our neighborhoods.</span>
          <span>
            <ShieldCheck size={13} /> Booking details go to the assigned
            professional and platform admin.
          </span>
          <button
            onClick={() =>
              setLang(lang === "EN" ? "HI" : lang === "HI" ? "GU" : "EN")
            }
          >
            <Globe2 size={14} /> {lang} <ChevronDown size={12} />
          </button>
        </div>
      </footer>
      <button
        className={aiOpen ? "ai-fab active" : "ai-fab"}
        onClick={() => setAiOpen(!aiOpen)}
        aria-label="Open AI help"
      >
        <span>{aiOpen ? <X size={21} /> : <Bot size={23} />}</span>
        <small>{aiOpen ? "Close" : "Ask Findy"}</small>
      </button>
      {aiOpen && (
        <aside className="ai-panel">
          <div className="ai-head">
            <div className="ai-avatar">
              <Bot size={20} />
            </div>
            <div>
              <strong>{tr("Findy, your local guide")}</strong>
              <small>
                <span className="available-dot" /> Here to help
              </small>
            </div>
            <button onClick={() => setAiOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <div className="ai-messages">
            {aiMessages.map((m, i) => (
              <div key={i} className={`ai-message ${m.from}`}>
                {m.from === "ai" && <Sparkles size={13} />}
                <span>{m.text}</span>
              </div>
            ))}
            <div className="ai-suggestions">
              <button
                onClick={() => {
                  setAiText("I need a plumber");
                }}
              >
                Find a plumber
              </button>
              <button
                onClick={() => {
                  setAiText("How does booking work?");
                }}
              >
                How booking works
              </button>
            </div>
          </div>
          <form className="ai-input" onSubmit={answerAI}>
            <input
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="Tell me what you need..."
            />
            <button aria-label="Send">
              <Send size={17} />
            </button>
          </form>
          <div className="ai-disclaimer">
            Helpful suggestions, powered by your local directory.
          </div>
        </aside>
      )}
      {toast && (
        <div className="toast">
          <Check size={17} />
          {tr(toast)}
        </div>
      )}
      {visibleModal && (
        <div
          className={`modal-backdrop ${isAccountRoute ? "account-screen" : ""} ${isAdminRoute ? "admin-screen" : ""}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setPendingBooking(false);
              setModal(null);
              if (isAccountRoute) navigate("/");
              if (isAdminRoute) navigate("/");
            }
          }}
        >
          <div className={`modal-card ${isAdminRoute ? "admin-portal-card" : ""}`}>
            {!(isAdminRoute && user?.role === "admin") && (
              <button
                className="modal-close"
                onClick={() => {
                  setPendingBooking(false);
                  setModal(null);
                  if (isAccountRoute || isAdminRoute) navigate("/");
                }}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            )}
            {visibleModal === "auth" && (
              <>
                <div className="modal-kicker">
                  <UserRound size={15} /> {tr(isAdminRoute ? "ADMINISTRATOR ACCESS" : "FIND LOCALS ACCOUNT")}
                </div>
                <h2>
                  {isAdminRoute ? tr("Admin workspace") : visibleAuthMode === "login"
                    ? tr("Welcome back.")
                    : tr("Create your account.")}
                </h2>
                <p className="modal-intro">
                  {isAdminRoute
                    ? tr("Sign in with your administrator account to manage workers, users, bookings, payments and reviews.")
                    : pendingBooking
                    ? tr("Create an account or sign in to continue booking with this worker.")
                    : tr("Browse without an account. Sign in to keep track of your bookings and worker profile.")}
                </p>
                <form className="modal-form" onSubmit={submitAuth}>
                  {visibleAuthMode === "register" && (
                    <>
                      <label>
                        {tr("Your name")}
                        <input name="name" required autoComplete="name" />
                      </label>
                      <label>
                        {tr("Phone number")}
                        <input name="phone" type="tel" autoComplete="tel" />
                      </label>
                      <input type="hidden" name="role" value={authFormRole} />
                      {authFormRole === "worker" && <div className="worker-register-fields">
                        <label>
                          {tr("Service you provide")}
                          <input
                            name="service"
                            placeholder="e.g. Plumbing"
                            required
                          />
                        </label>
                        <label>
                          {tr("Your neighborhood")}
                          <input
                            name="area"
                            placeholder="e.g. Navrangpura"
                            required
                          />
                        </label>
                        <label>
                          {tr("Starting price (₹)")}
                          <input
                            name="price"
                            type="number"
                            min="0"
                            defaultValue="0"
                          />
                        </label>
                        <label>
                          {tr("Years of experience")}
                          <input
                            name="experience"
                            type="number"
                            min="0"
                            defaultValue="0"
                          />
                        </label>
                        <label>
                          {tr("About your work")}
                          <textarea name="about" rows="3" maxLength="800" />
                        </label>
                        <p className="worker-register-note">{tr("Your profile remains private until an admin completes verification.")}</p>
                      </div>}
                    </>
                  )}
                  <label>
                    {tr("Email address")}
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                    />
                  </label>
                  <label>
                    {tr("Password")}
                    <input
                      name="password"
                      type="password"
                      minLength="8"
                      required
                      autoComplete={
                        visibleAuthMode === "login"
                          ? "current-password"
                          : "new-password"
                      }
                    />
                  </label>
                  {authError && (
                    <p className="form-error" role="alert">
                      {tr(authError)}
                    </p>
                  )}
                  <button
                    className="primary-button full-button"
                    disabled={busy}
                  >
                    {busy
                      ? tr("Please wait…")
                      : visibleAuthMode === "login"
                        ? tr("Sign in")
                        : tr("Create account")}
                    <ArrowRight size={16} />
                  </button>
                </form>
                {locationState.pathname !== "/admin" && (
                  <button
                    className="text-link auth-switch"
                    onClick={() => {
                      setAuthMode(visibleAuthMode === "login" ? "register" : "login");
                      setAuthError("");
                    }}
                  >
                    {visibleAuthMode === "login"
                      ? tr("New here? Create an account")
                      : tr("Already have an account? Sign in")}
                  </button>
                )}
              </>
            )}
            {visibleModal === "review" && selectedBooking && (
              <>
                <div className="modal-kicker">
                  <Star size={15} /> {tr("SERVICE FEEDBACK")}
                </div>
                <h2>{tr("How did it go?")}</h2>
                <p className="modal-intro">
                  {tr("Your review helps neighbors choose a professional with confidence.")}
                </p>
                <form className="modal-form" onSubmit={submitReview}>
                  <label>
                    {tr("Rating")}
                    <select name="rating" required defaultValue="5">
                      <option value="5">5 · {tr("Excellent")}</option>
                      <option value="4">4 · {tr("Good")}</option>
                      <option value="3">3 · {tr("Okay")}</option>
                      <option value="2">2 · {tr("Could be better")}</option>
                      <option value="1">1 · {tr("Poor")}</option>
                    </select>
                  </label>
                  <label>
                    {tr("Share a few details")}
                    <textarea
                      name="comment"
                      rows="4"
                      maxLength="1000"
                      placeholder={tr("What should other customers know?")}
                    />
                  </label>
                  {authError && (
                    <p className="form-error" role="alert">
                      {tr(authError)}
                    </p>
                  )}
                  <button
                    className="primary-button full-button"
                    disabled={busy}
                  >
                    {busy ? tr("Sending…") : tr("Submit review")}
                    <ArrowRight size={16} />
                  </button>
                </form>
              </>
            )}
            {visibleModal === "booking" && selectedWorker && (
              <>
                <div className="modal-kicker">
                  <CalendarDays size={15} /> {tr("A GOOD PLAN STARTS HERE")}
                </div>
                <h2>Request {selectedWorker.name}</h2>
                <p className="modal-intro">
                  {tr("Share a few details and we’ll send your request to the worker after you sign in.")}
                </p>
                <form className="modal-form" onSubmit={submitBooking}>
                  <label>
                    {tr("What should we call you?")}
                    <input
                      required
                      name="customer"
                      placeholder="Your name"
                      autoComplete="name"
                      defaultValue={user?.name || ""}
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      {tr("Phone number")}
                      <input
                        required
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                        defaultValue={user?.phone || ""}
                      />
                    </label>
                    <label>
                      {tr("Preferred day")}
                      <input
                        required
                        name="date"
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                      />
                    </label>
                  </div>
                  <label>
                    {tr("Time that works")}
                    <select name="slot">
                      <option>Morning · 9 AM–12 PM</option>
                      <option>Afternoon · 12–4 PM</option>
                      <option>Evening · 4–7 PM</option>
                    </select>
                  </label>
                  <label>
                    {tr("Service address")}
                    <input
                      required
                      name="address"
                      placeholder="House / street / neighborhood"
                      autoComplete="street-address"
                    />
                  </label>
                  <label>
                    {tr("What do you need done?")}
                    <textarea
                      name="description"
                      rows="3"
                      maxLength="800"
                      placeholder={tr("Add a few details so the worker can prepare")}
                    />
                  </label>
                  {authError && (
                    <p className="form-error" role="alert">
                      {tr(authError)}
                    </p>
                  )}
                  <div className="booking-summary">
                    <span>
                      {selectedWorker.service} · {selectedWorker.name}
                    </span>
                    <strong>{tr("from")} ₹{selectedWorker.price}</strong>
                  </div>
                  <button
                    className="primary-button full-button"
                    disabled={busy}
                  >
                    {busy ? tr("Sending…") : tr("Send booking request")}{" "}
                    <ArrowRight size={16} />
                  </button>
                  <small className="privacy-note">
                    <ShieldCheck size={13} /> {tr("Your number is shared with the assigned professional and platform admin.")}
                  </small>
                </form>
              </>
            )}
            {visibleModal === "join" && (
              <>
                <div className="modal-kicker">
                  <BriefcaseBusiness size={15} /> YOUR SKILLS, YOUR NEIGHBORHOOD
                </div>
                <h2>Grow your work locally.</h2>
                <p className="modal-intro">
                  Create a starter profile. Our team will review your details
                  before your listing goes live.
                </p>
                <form className="modal-form" onSubmit={submitApplication}>
                  <label>
                    Your full name
                    <input
                      required
                      name="name"
                      placeholder="e.g. Ramesh Patel"
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Service you offer
                      <select required name="service">
                        {categories.slice(0, 6).map((c) => (
                          <option key={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Your neighborhood
                      <input
                        required
                        name="area"
                        placeholder="e.g. Navrangpura"
                      />
                    </label>
                  </div>
                  <label>
                    Phone number
                    <input
                      required
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                    />
                  </label>
                  <div className="worker-benefit">
                    <ShieldCheck size={17} />
                    <span>
                      <strong>Thoughtful onboarding</strong>
                      <small>
                        We’ll contact you to verify your skills and service
                        area.
                      </small>
                    </span>
                  </div>
                  {authError && (
                    <p className="form-error" role="alert">
                      {tr(authError)}
                    </p>
                  )}
                  <button
                    className="primary-button full-button"
                    disabled={busy}
                  >
                    {busy ? "Sending…" : "Send my profile"}{" "}
                    <ArrowRight size={16} />
                  </button>
                </form>
              </>
            )}
            {visibleModal === "profile" && selectedWorker && (
              <>
                <div className="profile-hero">
                  <img src={selectedWorker.photo} alt="" />
                  <div>
                    <span className="verified-chip">
                      <ShieldCheck size={13} />
                      {selectedWorker.verified
                        ? "Verified professional"
                        : "Sample profile"}
                    </span>
                    <h2>{selectedWorker.name}</h2>
                    <p>
                      {selectedWorker.service} · {selectedWorker.area},{" "}
                      {selectedWorker.city}
                    </p>
                    {selectedWorker.reviews > 0 && (
                      <div className="profile-rating">
                        <Star size={15} fill="currentColor" />{" "}
                        <strong>{selectedWorker.rating.toFixed(1)}</strong> (
                        {selectedWorker.reviews} neighbor reviews)
                      </div>
                    )}
                  </div>
                </div>
                <div className="profile-stats">
                  <div>
                    <strong>{selectedWorker.experience} yrs</strong>
                    <small>experience</small>
                  </div>
                  <div>
                    <strong>{selectedWorker.jobs || 0}</strong>
                    <small>{tr("jobs completed")}</small>
                  </div>
                  <div>
                    <strong>{selectedWorker.languages}</strong>
                    <small>languages</small>
                  </div>
                </div>
                <h3 className="about-heading">A little about their work</h3>
                <p className="profile-about">{selectedWorker.about}</p>
                <div className="profile-availability">
                  <span className="available-dot" />
                  {selectedWorker.available}
                  <span>
                    Starting at <strong>₹{selectedWorker.price}</strong>
                  </span>
                </div>
                <button
                  className="primary-button full-button"
                  onClick={() => book(selectedWorker)}
                >
                  Request a booking <ArrowRight size={16} />
                </button>
              </>
            )}
            {visibleModal === "dashboard" && (
              <>
                <label className="dashboard-language">
                  <Globe2 size={15} />
                  <select
                    aria-label="Select language"
                    value={lang}
                    onChange={(event) => {
                      setLang(event.target.value);
                      storage.write("fl-language", event.target.value);
                    }}
                  >
                    <option value="EN">English</option>
                    <option value="HI">हिन्दी</option>
                    <option value="GU">ગુજરાતી</option>
                  </select>
                </label>
                <div className="modal-kicker">
                  <LayoutDashboard size={15} /> {tr("YOUR FIND LOCALS SPACE")}
                </div>
                <h2>
                  {user?.role === "admin"
                    ? tr("Admin workspace")
                    : user?.role === "worker"
                      ? tr("Worker workspace")
                      : tr("Your bookings")}
                </h2>
                <p className="modal-intro">
                  {user?.role === "admin"
                    ? tr("Review platform activity and worker verification.")
                    : user?.role === "worker"
                      ? tr("Manage incoming requests and your local profile.")
                      : tr("Your booking history is private to your account.")}
                </p>
                <button
                  className="text-link dashboard-logout"
                  onClick={signOut}
                >
                  {tr("Sign out")} <ArrowRight size={14} />
                </button>
                {user?.role === "customer" && (
                  <>
                    <form
                      className="account-profile-form"
                      onSubmit={updateProfile}
                    >
                      <h3>{tr("Account details")}</h3>
                      <div className="form-row">
                        <label>
                          {tr("Name")}
                          <input
                            name="name"
                            defaultValue={user.name}
                            required
                          />
                        </label>
                        <label>
                          {tr("Phone")}
                          <input
                            name="phone"
                            defaultValue={user.phone}
                            type="tel"
                          />
                        </label>
                      </div>
                      {authError && (
                        <p className="form-error" role="alert">
                          {tr(authError)}
                        </p>
                      )}
                      <button className="outline-button" disabled={busy}>
                        Save profile
                      </button>
                    </form>
                    <DashboardList
                      translate={tr}
                      title="Your booking requests"
                      empty="Your next home win is one good pro away."
                      items={bookings.map((b) => ({
                        id: b.id,
                        title: `${b.service} · ${b.worker}`,
                        sub: `${b.date} · ${b.slot} · ${b.address || "Guest request"} · ${tr("Payment")}: ${tr(b.payment_status || "unpaid")}`,
                        status: b.status,
                        actions:
                          b.status === "Requested"
                            ? ["cancel"]
                            : b.status === "Completed" && !b.reviewed
                              ? ["review"]
                              : [],
                      }))}
                      onAction={startBookingAction}
                      action={() => {
                        setModal(null);
                        document
                          .querySelector("#pros")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      actionLabel="Find a local pro"
                    />
                  </>
                )}
                {user?.role === "worker" && (
                  <>
                    <div className="worker-verification-state">
                      <ShieldCheck size={18} />
                      <span>
                        <strong>
                          {workerProfile?.verified
                            ? "Verified professional"
                            : "Profile awaiting verification"}
                        </strong>
                        <small>
                          {workerProfile?.verified
                            ? "Your profile is visible to local customers."
                            : "Customers cannot see your profile until an admin approves it."}
                        </small>
                      </span>
                    </div>
                    {workerProfile && (
                      <form
                        className="account-profile-form"
                        onSubmit={updateWorkerProfile}
                      >
                        <h3>Worker profile</h3>
                        <div className="form-row">
                          <label>
                            {tr("Service")}
                            <input
                              name="service"
                              defaultValue={workerProfile.service}
                              required
                            />
                          </label>
                          <label>
                            {tr("Neighborhood")}
                            <input
                              name="area"
                              defaultValue={workerProfile.area}
                              required
                            />
                          </label>
                        </div>
                        <div className="form-row">
                          <label>
                            {tr("City")}
                            <input
                              name="city"
                              defaultValue={workerProfile.city}
                            />
                          </label>
                          <label>
                            Starting price (₹)
                            <input
                              name="price"
                              type="number"
                              min="0"
                              defaultValue={workerProfile.price}
                            />
                          </label>
                        </div>
                        <div className="form-row">
                          <label>
                            Years of experience
                            <input
                              name="experience"
                              type="number"
                              min="0"
                              defaultValue={workerProfile.experience}
                            />
                          </label>
                          <label>
                          {tr("Languages")}
                            <input
                              name="languages"
                              defaultValue={workerProfile.languages}
                            />
                          </label>
                        </div>
                        <label>
                          {tr("Availability")}
                          <input
                            name="available"
                            defaultValue={workerProfile.available}
                          />
                        </label>
                        <label>
                          About your work
                          <textarea
                            name="about"
                            rows="3"
                            defaultValue={workerProfile.about}
                          />
                        </label>
                        {authError && (
                          <p className="form-error" role="alert">
                            {tr(authError)}
                          </p>
                        )}
                        <button className="outline-button" disabled={busy}>
                          Save worker profile
                        </button>
                      </form>
                    )}
                    <DashboardList
                      translate={tr}
                      title="Worker requests & profile"
                      empty="No service requests yet. Keep your availability current."
                      items={bookings.map((b) => ({
                        id: b.id,
                        title: `${b.service} request · ${b.customer_name}`,
                        sub: `${b.date} · ${b.slot} · ${b.address} · ${tr("Payment")}: ${tr(b.payment_status || "unpaid")}`,
                        status: b.status,
                        actions:
                          {
                            Requested: ["accept", "reject"],
                            Accepted: ["start"],
                            "In progress": ["complete"],
                            Completed: b.payment_method === "cash" && b.payment_status === "unpaid" ? ["payment_received"] : [],
                          }[b.status] || [],
                      }))}
                      onAction={updateWorkerBooking}
                    />
                  </>
                )}
                {user?.role === "admin" && (
                  <>
                    <div className="admin-stats">
                      <div>
                        <Users size={18} />
                        <strong>{adminSummary?.users ?? "—"}</strong>
                        <small>{tr("customers")}</small>
                      </div>
                      <div>
                        <BriefcaseBusiness size={18} />
                        <strong>{adminSummary?.workers ?? "—"}</strong>
                        <small>{tr("Worker account")}</small>
                      </div>
                      <div>
                        <ShieldCheck size={18} />
                        <strong>{adminSummary?.pending ?? "—"}</strong>
                        <small>{tr("pending verification")}</small>
                      </div>
                      <div>
                        <ClipboardList size={18} />
                        <strong>{adminSummary?.bookings ?? "—"}</strong>
                        <small>{tr("bookings")}</small>
                      </div>
                    </div>
                    <section className="admin-categories">
                      <div className="dashboard-title">
                        <h3>{tr("Database tables")}</h3>
                        <span>{databaseTables.length} {tr("tables")}</span>
                      </div>
                      <div className="admin-category-chips database-table-list">
                        {databaseTables.map((table) => (
                          <div className="database-table-chip" key={table.name}>
                            <strong>{table.name}</strong>
                            <span>{tr(table.description)}</span>
                            <small>{table.rows} {tr("rows")}</small>
                          </div>
                        ))}
                      </div>
                    </section>
                    <DashboardList
                      translate={tr}
                      title="Worker verification"
                      empty="No worker accounts need review."
                      items={pendingWorkers
                        .filter((w) => w.verification_status === "pending")
                        .map((w) => ({
                          id: w.id,
                          title: `${w.name} · ${w.service}`,
                          sub: `${w.area}, ${w.city} · ${w.email || "Worker account"}`,
                          status: "Pending",
                          actions: ["approve", "reject"],
                          kind: "worker",
                        }))}
                      onAction={(id, action) => verifyWorker(id, action)}
                    />
                    <DashboardList
                      translate={tr}
                      title="All workers"
                      empty="No worker accounts have been created."
                      items={pendingWorkers.map((worker) => ({
                        id: worker.id,
                        title: `${worker.name} · ${worker.service}`,
                        sub: `${worker.area}, ${worker.city} · ${worker.is_demo ? tr("Sample profile") : worker.email || tr("Worker application")} · ${tr("Phone")}: ${worker.phone || tr("Not provided")} · ${tr("Starting price")}: ₹${worker.price}`,
                        status: worker.is_demo ? tr("Sample profile") : worker.verification_status === "approved" ? tr("Verified") : worker.verification_status === "rejected" ? tr("Rejected") : tr("Pending"),
                        actions: worker.is_demo ? [] : worker.verification_status === "pending" ? ["approve", "reject"] : worker.verification_status === "approved" ? ["reject"] : [],
                      }))}
                      onAction={(id, action) => verifyWorker(id, action)}
                    />
                    <DashboardList
                      translate={tr}
                      title="Worker applications"
                      empty="No applications to review."
                      items={applications
                        .filter((a) => a.status === "Reviewing")
                        .map((a) => ({
                          id: a.id,
                          title: `${a.name} · ${a.service}`,
                          sub: `${a.area} · ${a.phone}`,
                          status: a.status,
                          actions: ["approve", "reject"],
                          kind: "application",
                        }))}
                      onAction={(id, action) => reviewApplication(id, action)}
                    />
                    <DashboardList
                      translate={tr}
                      title="Platform bookings"
                      empty="No bookings have been requested."
                      items={bookings.map((b) => ({
                        id: b.id,
                        title: `${b.service} · ${b.customer_name}`,
                        sub: `${b.worker} · ${b.date} · ${b.slot} · ${b.address} · ${tr("Payment")}: ${tr(b.payment_status || "unpaid")}`,
                        status: b.status,
                        actions: ({ Requested: ["accept", "reject"], Accepted: ["start", "cancel"], "In progress": ["complete"] })[b.status] || [],
                      }))}
                      onAction={doAdminBookingAction}
                    />
                    <DashboardList
                      translate={tr}
                      title="Reviews and feedback"
                      empty="No reviews have been submitted."
                      items={adminReviews.map((r) => ({
                        id: r.id,
                        title: `${r.worker} · ${r.rating}/5`,
                        sub: `${r.customer}: ${r.comment || "No written comment"}`,
                        status: new Date(r.created_at * 1000).toLocaleDateString(),
                        actions: ["remove"],
                      }))}
                      onAction={(id) => removeReview(id)}
                    />
                    <DashboardList
                      translate={tr}
                      title="Payments"
                      empty="No payment records yet."
                      items={adminPayments.map((payment) => ({
                        id: payment.id,
                        title: `${payment.customer_name} → ${payment.worker} · ₹${payment.amount} ${payment.currency}`,
                        sub: `${payment.service} · ${payment.method} · ${payment.booking_status} · ${payment.service_date}`,
                        status: payment.status,
                        actions: payment.status === "unpaid" ? ["markPaid"] : payment.status === "paid" ? ["refund"] : [],
                      }))}
                      onAction={(id, action) => {
                        const payment = adminPayments.find((item) => item.id === id);
                        if (payment) updateAdminPayment(payment, action === "markPaid" ? "paid" : "refunded");
                      }}
                    />
                    <DashboardList
                      translate={tr}
                      title="User accounts"
                      empty="No accounts have been created."
                      items={adminUsers.map((account) => ({
                        id: account.id,
                        title: `${account.name} · ${account.role}`,
                        sub: `${account.email} · ${account.phone || "No phone added"}`,
                        status: "Account",
                      }))}
                    />
                    <section className="admin-categories">
                      <div className="dashboard-title"><h3>{tr("Service categories")}</h3><span>{adminCategories.length} {tr("active")}</span></div>
                      <form className="category-create-form" onSubmit={submitCategory}>
                        <input name="name" required maxLength="60" placeholder={tr("Add a service category")} aria-label={tr("New category name")} />
                        <button className="row-action">{tr("Add category")}</button>
                      </form>
                      <div className="admin-category-chips">
                        {adminCategories.filter((category) => category.active).map((category) => (
                          <button key={category.id} onClick={() => disableCategory(category.id)} title={`Disable ${category.name}`}>
                            {category.name}<X size={13}/>
                          </button>
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </>
            )}
            {visibleModal === "trust" && (
              <>
                <div className="modal-kicker">
                  <ShieldCheck size={15} /> TRUST, BUILT CLOSE TO HOME
                </div>
                <h2>Know who’s coming to your door.</h2>
                <p className="modal-intro">
                  Find Locals gives you useful signals to make your own informed
                  choice.
                </p>
                <div className="trust-modal-list">
                  <div>
                    <BadgeCheck />
                    <span>
                      <strong>Profile details reviewed</strong>
                      <small>
                        We check service, location and experience details with
                        each applicant.
                      </small>
                    </span>
                  </div>
                  <div>
                    <Star />
                    <span>
                      <strong>Reviews from real bookings</strong>
                      <small>
                        Customers can share feedback after a completed service.
                      </small>
                    </span>
                  </div>
                  <div>
                    <Phone />
                    <span>
                      <strong>Your details stay yours</strong>
                      <small>
                        Booking contact details are visible to the assigned worker and platform admin.
                      </small>
                    </span>
                  </div>
                </div>
                <button
                  className="primary-button full-button"
                  onClick={() => setModal(null)}
                >
                  {tr("Sounds good")} <Check size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardList({ title, empty, items, action, actionLabel, onAction, translate = (text) => text }) {
  return (
    <div className="dashboard-list">
      <div className="dashboard-title">
        <h3>{translate(title)}</h3>
        <span>{items.length} {translate("total")}</span>
      </div>
      {items.length > 0 ? (
        items.map((item, i) => (
          <div className="dashboard-item" key={item.id || i}>
            <span className="dashboard-icon">
              <ClipboardList size={17} />
            </span>
            <div>
              <strong>{item.title}</strong>
              <small>{item.sub}</small>
            </div>
            <span className="status-pill">{translate(item.status)}</span>
            {item.actions?.map((action) => (
              <button
                className={
                  action === "reject" || action === "cancel" || action === "remove"
                    ? "row-action secondary"
                    : "row-action"
                }
                key={action}
                onClick={() => onAction?.(item.id, action)}
              >
                {action === "approve" && <Check size={14} />}
                {action === "accept" && <Check size={14} />}
                {action === "markPaid" && <Check size={14} />}
                {action === "reject"
                  ? translate("Reject")
                  : action === "cancel"
                    ? translate("Cancel")
                    : action === "remove"
                      ? translate("Remove")
                              : action === "markPaid"
                                ? translate("Mark paid")
                                : action === "refund"
                                  ? translate("Refund")
                    : action === "approve"
                      ? translate("Approve")
                      : action === "accept"
                        ? translate("Accept")
                        : action === "start"
                          ? translate("Start job")
                            : action === "payment_received"
                              ? translate("Record cash received")
                          : action === "complete"
                            ? translate("Complete")
                            : translate("Review")}
              </button>
            ))}
          </div>
        ))
      ) : (
        <div className="dashboard-empty">
          <span>
            <CalendarDays size={21} />
          </span>
          <p>{translate(empty)}</p>
          {action && (
            <button className="text-link" onClick={action}>
              {translate(actionLabel)}
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
