import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  CircleHelp,
  Wrench,
  Zap,
  PaintRoller,
  Wind,
  Hammer,
  Truck,
  Sparkles,
} from "lucide-react";

import logo from "./assets/logo.png";
import hero from "./assets/hero.png";

function HomePage() {
  const navigate = useNavigate();

  const [banner, setBanner] = useState(0);

  const banners = [
    {
      title: "Trusted Local Workers",
      subtitle: "Book verified professionals near you",
    },
    {
      title: "Fast Home Services",
      subtitle: "Plumber, Electrician, Cleaning",
    },
    {
      title: "Best Rated Experts",
      subtitle: "Top reviewed workers",
    },
    {
      title: "Affordable Prices",
      subtitle: "Quality work guaranteed",
    },
    {
      title: "24/7 Support",
      subtitle: "We're always here",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setBanner((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const categories = [
    { name: "Plumber", icon: <Wrench size={24} /> },
    { name: "Electrician", icon: <Zap size={24} /> },
    { name: "Painter", icon: <PaintRoller size={24} /> },
    { name: "Cleaner", icon: <Sparkles size={24} /> },
    { name: "AC Repair", icon: <Wind size={24} /> },
    { name: "Carpenter", icon: <Hammer size={24} /> },
    { name: "Movers", icon: <Truck size={24} /> },
  ];

  const workers = [
    {
      name: "Ramesh Patel",
      work: "Plumber",
      price: "₹399",
      lang: "Gujarati, Hindi",
    },
    {
      name: "Farhan Sheikh",
      work: "Electrician",
      price: "₹499",
      lang: "Hindi, English",
    },
    {
      name: "Sunita Desai",
      work: "Cleaner",
      price: "₹299",
      lang: "Gujarati, English",
    },
  ];

  return (
    <div style={{ background: "#fff" }}>
      {/* HEADER */}

      <div
        style={{
          background: "#0A2342",
          color: "#fff",
          padding: "15px 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <img
              src={logo}
              alt=""
              style={{
                width: "50px",
              }}
            />

            <div>
              <h2 style={{ margin: 0 }}>Find Local</h2>

              <p
                style={{
                  margin: 0,
                  fontStyle: "italic",
                  color: "#cfd8dc",
                }}
              >
                Find Trusted Services
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "15px",
            }}
          >
            <select>
              <option>EN</option>
              <option>HI</option>
              <option>GU</option>
            </select>

            <CircleHelp />

            <Bell />
          </div>
        </div>
      </div>

      {/* HERO */}

      <div
        style={{
          padding: "50px",
          background: "#f7f9ff",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "30px",
            padding: "50px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 5px 25px rgba(0,0,0,.08)",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "55px",
                marginBottom: "15px",
              }}
            >
              {banners[banner].title}
            </h1>

            <p
              style={{
                fontSize: "20px",
              }}
            >
              {banners[banner].subtitle}
            </p>

            <button
              style={{
                background: "#2979ff",
                color: "#fff",
                border: "none",
                padding: "15px 30px",
                borderRadius: "30px",
                cursor: "pointer",
              }}
            >
              Book Now
            </button>
          </div>

          <img
            src={hero}
            alt=""
            style={{
              width: "420px",
            }}
          />
        </div>
      </div>

      {/* CATEGORIES */}

      <div
        style={{
          padding: "40px",
        }}
      >
        <h2>Categories</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: "20px",
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() =>
                navigate(`/workers/${cat.name}`)
              }
              style={{
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  background: "#edf3ff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "auto",
                }}
              >
                {cat.icon}
              </div>

              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WORKERS */}

      <div
        style={{
          padding: "40px",
        }}
      >
        <h2>Popular Workers</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "25px",
          }}
        >
          {workers.map((worker, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 4px 15px rgba(0,0,0,.08)",
              }}
            >
              <img
                src={`https://i.pravatar.cc/400?img=${index + 10}`}
                alt=""
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                }}
              />

              <div style={{ padding: "20px" }}>
                <h3>{worker.name}</h3>

                <p>{worker.work}</p>

                <p>Verified ✓</p>

                <p>{worker.lang}</p>

                <h3>{worker.price}/visit</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}

      <div
        style={{
          background: "#0A2342",
          color: "#fff",
          padding: "50px",
          marginTop: "40px",
        }}
      >
        <h2>Find Local</h2>

        <p>Find trusted services near you.</p>

        <hr />

        <p>© 2026 Find Local</p>
      </div>
    </div>
  );
}

export default HomePage;
