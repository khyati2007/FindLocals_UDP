import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useI18n } from "../lib/i18n";

export function Logo({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link to="/" className={`flex items-center gap-2 font-semibold text-foreground ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <MapPin className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <span className="text-lg tracking-tight">{t("brand.name")}</span>
    </Link>
  );
}
