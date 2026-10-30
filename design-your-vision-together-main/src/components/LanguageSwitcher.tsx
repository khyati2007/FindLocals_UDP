import { Globe } from "lucide-react";
import { languages, useI18n, type LangCode } from "../lib/i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <Globe className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <span className="sr-only">Language</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as LangCode)}
        className="appearance-none rounded-full border border-border bg-card py-2 pl-9 pr-8 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </label>
  );
}
