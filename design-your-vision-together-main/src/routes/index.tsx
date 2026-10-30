import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Search, ShieldCheck, Star } from "lucide-react";
import { Container } from "../components/Container";
import { WorkerCard } from "../components/WorkerCard";
import { areas, services, workers } from "../lib/services";
import { useI18n } from "../lib/i18n";
import heroAsset from "../assets/services-hero.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Find Locals — Trusted local home service workers near you" },
      {
        name: "description",
        content:
          "Find Locals connects you with verified plumbers, electricians, cleaners, painters and appliance technicians nearby. Available in English, Hindi, Gujarati and Marathi.",
      },
      { property: "og:title", content: "Find Locals — Trusted local home service workers near you" },
      {
        property: "og:description",
        content: "Book verified local workers for everyday household services in your own language.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [area, setArea] = useState("");

  const topWorkers = [...workers].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const steps = [1, 2, 3].map((n) => ({
    n,
    title: t(`how.step${n}`),
    desc: t(`how.step${n}.desc`),
  }));

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero pt-14 pb-20 sm:pt-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t("hero.badge")}
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {t("hero.title")}
              </h1>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">{t("hero.subtitle")}</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate({
                    to: "/workers",
                    search: {
                      ...(service ? { service: service as never } : {}),
                      ...(area ? { area } : {}),
                    },
                  });
                }}
                className="glass-card mt-8 grid gap-3 rounded-2xl p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <select
                  aria-label={t("search.service")}
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="h-12 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">{t("search.allServices")}</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {t(`services.${s.id}`)}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={t("search.city")}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="h-12 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">{t("search.allCities")}</option>
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Search className="h-4 w-4" />
                  {t("search.button")}
                </button>
              </form>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6">
                {[t("hero.stat1"), t("hero.stat2"), t("hero.stat3")].map((stat) => (
                  <div key={stat}>
                    <dt className="text-sm text-muted-foreground">{stat}</dt>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <img
                src={heroAsset.url}
                alt="Hands holding a phone surrounded by icons of local workers doing plumbing, laundry and repair jobs"
                className="mx-auto w-full max-w-lg"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Services */}
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("services.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("services.subtitle")}</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.id}
                to="/workers"
                search={{ service: s.id }}
                className="glass-card group rounded-2xl p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{t(`services.${s.id}`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`services.${s.id}.desc`)}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="bg-card py-20">
        <Container>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("how.title")}
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  {step.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Top rated workers */}
      <section className="py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("workers.title")}
            </h2>
            <Link
              to="/workers"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              {t("nav.workers")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topWorkers.map((w) => (
              <WorkerCard key={w.id} worker={w} />
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t("workers.verified")}
            </span>
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 text-chart-3" />
              {t("about.value2")}
            </span>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <Container>
          <div className="mx-auto max-w-4xl rounded-3xl bg-primary px-6 py-16 text-center sm:px-16">
            <h2 className="text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">{t("cta.subtitle")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/join"
                className="inline-flex items-center justify-center rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
              >
                {t("nav.join")}
              </Link>
              <Link
                to="/workers"
                className="inline-flex items-center justify-center rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                {t("hero.secondary")}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
