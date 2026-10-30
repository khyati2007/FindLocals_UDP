import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "../lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">{t("brand.tagline")}</p>
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("footer.language")}
              </p>
              <LanguageSwitcher />
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            <Link to="/services" className="text-muted-foreground hover:text-foreground">
              {t("nav.services")}
            </Link>
            <Link to="/workers" className="text-muted-foreground hover:text-foreground">
              {t("nav.workers")}
            </Link>
            <Link to="/join" className="text-muted-foreground hover:text-foreground">
              {t("nav.join")}
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground">
              {t("nav.about")}
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground">
              {t("nav.contact")}
            </Link>
            <Link to="/app" className="text-muted-foreground hover:text-foreground">
              {t("nav.openApp")}
            </Link>
          </nav>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("brand.name")}. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
