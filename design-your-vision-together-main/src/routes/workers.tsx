import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Container } from "../components/Container";
import { WorkerCard } from "../components/WorkerCard";
import { areas, services, workers, type ServiceId } from "../lib/services";
import { useI18n } from "../lib/i18n";
import { Search } from "lucide-react";

type WorkerSearch = { service?: ServiceId | undefined; area?: string | undefined };

export const Route = createFileRoute("/workers")({
  validateSearch: (search: Record<string, unknown>): WorkerSearch => ({
    service: (search["service"] as ServiceId) || undefined,
    area: (search["area"] as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Find Local Workers Near You — Find Locals" },
      {
        name: "description",
        content:
          "Browse verified local plumbers, electricians, cleaners, painters and technicians by service and area. Compare ratings, charges and languages.",
      },
      { property: "og:title", content: "Find Local Workers Near You — Find Locals" },
      {
        property: "og:description",
        content: "Compare verified local workers by rating, experience, charges and language.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkersPage,
});

function WorkersPage() {
  const { t } = useI18n();
  const initial = Route.useSearch();
  const [service, setService] = useState<string>(initial.service ?? "");
  const [area, setArea] = useState<string>(initial.area ?? "");

  const results = workers.filter(
    (w) => (!service || w.service === service) && (!area || w.area === area),
  );

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("workers.title")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("workers.subtitle")}</p>

        <div className="glass-card mt-8 grid gap-4 rounded-2xl p-4 sm:grid-cols-[1fr_1fr_auto]">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("search.service")}
            </span>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{t("search.allServices")}</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {t(`services.${s.id}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("search.city")}
            </span>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{t("search.allCities")}</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => toast.success(`${results.length} ${t("workers.found")}`)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              <Search className="h-4 w-4" />
              {t("search.button")}
            </button>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {results.length} {t("workers.found")}
        </p>

        {results.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            {t("workers.none")}
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
