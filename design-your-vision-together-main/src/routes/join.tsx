import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Container } from "../components/Container";
import { areas, services } from "../lib/services";
import { useI18n } from "../lib/i18n";
import { Languages, TrendingUp, Star } from "lucide-react";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join as a Worker — Find Locals" },
      {
        name: "description",
        content:
          "Register as a plumber, electrician, cleaner, painter or technician on Find Locals and get customer requests from your own area.",
      },
      { property: "og:title", content: "Join as a Worker — Find Locals" },
      {
        property: "og:description",
        content: "Get more customers in your area. No commission on your first 10 jobs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);

  const benefits = [
    { icon: TrendingUp, title: t("join.benefit1"), desc: t("join.benefit1.desc") },
    { icon: Languages, title: t("join.benefit2"), desc: t("join.benefit2.desc") },
    { icon: Star, title: t("join.benefit3"), desc: t("join.benefit3.desc") },
  ];

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("join.title")}
            </h1>
            <p className="mt-4 text-muted-foreground">{t("join.subtitle")}</p>
            <div className="mt-10 space-y-6">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{b.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitting(true);
              window.setTimeout(() => {
                setSubmitting(false);
                (e.target as HTMLFormElement).reset();
                toast.success(t("join.success"));
              }, 600);
            }}
            className="glass-card space-y-4 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-foreground">{t("join.form")}</h2>
            <Field label={t("join.name")}>
              <input required name="name" className={inputClass} />
            </Field>
            <Field label={t("join.phone")}>
              <input required type="tel" name="phone" className={inputClass} />
            </Field>
            <Field label={t("join.service")}>
              <select required name="service" className={inputClass} defaultValue="">
                <option value="" disabled />
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {t(`services.${s.id}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("join.city")}>
              <select required name="area" className={inputClass} defaultValue="">
                <option value="" disabled />
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("join.experience")}>
              <input required type="number" min="0" max="60" name="experience" className={inputClass} />
            </Field>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {t("join.submit")}
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
