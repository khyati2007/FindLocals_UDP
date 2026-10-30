import { useEffect, useState } from "react";
import splash from "../assets/splash.gif.asset.json";
import { useI18n } from "../lib/i18n";

export function SplashScreen() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("findlocals.splash") === "seen") {
      setVisible(false);
      return;
    }
    const fadeTimer = window.setTimeout(() => setFading(true), 2400);
    const hideTimer = window.setTimeout(() => {
      window.sessionStorage.setItem("findlocals.splash", "seen");
      setVisible(false);
    }, 3000);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={splash.url}
        alt=""
        className="max-h-[60vh] w-auto max-w-[85vw] object-contain"
      />
      <p className="mt-6 text-sm font-medium text-muted-foreground">{t("splash.loading")}</p>
    </div>
  );
}
