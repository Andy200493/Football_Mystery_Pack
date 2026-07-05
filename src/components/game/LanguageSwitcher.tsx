import { LOCALES } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className="inline-flex items-center rounded-full glass border border-white/10 p-0.5 text-[11px]"
    >
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code)}
          className={`px-3 py-1 rounded-full transition-colors ${
            locale === l.code
              ? "bg-neon text-primary-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={locale === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
