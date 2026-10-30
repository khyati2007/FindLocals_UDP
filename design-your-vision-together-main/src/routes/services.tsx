import { createFileRoute, Link } from "@tanstack/react-router";
import { Container } from "../components/Container";
import { services } from "../lib/services";
import { useI18n } from "../lib/i18n";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Home Services — Find Locals" },
      {
        name: "description",
        content:
          "Book verified plumbers, electricians, cleaners, painters, carpenters and appliance repair technicians near you with Find Locals.",
      },
      { property: "og:title", content: "Home Services — Find Locals" },
      {
        property: "og:description",
        content: "Verified local workers for plumbing, electrical, cleaning, painting and appliance repair.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { t } = useI18n();
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("services.title")}
          </h1>
          <p className="mt-4 text-muted-foreground">{t("services.subtitle")}</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.id}
              to="/workers"
              search={{ service: service.id }}
              className="glass-card group rounded-2xl p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <service.icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                {t(`services.${service.id}`)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`services.${service.id}.desc`)}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {t("nav.workers")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
