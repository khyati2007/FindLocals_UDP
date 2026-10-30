import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Container } from "../components/Container";
import { loadBookings, saveBookings, type Booking } from "../lib/bookings";
import { useI18n } from "../lib/i18n";
import { CalendarCheck, Check, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "My Bookings — Find Locals" },
      {
        name: "description",
        content: "Track your upcoming and completed home service bookings with local workers on Find Locals.",
      },
      { property: "og:title", content: "My Bookings — Find Locals" },
      { property: "og:description", content: "Manage your home service bookings in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  const { t } = useI18n();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const sync = () => setBookings(loadBookings());
    sync();
    window.addEventListener("findlocals:bookings", sync);
    return () => window.removeEventListener("findlocals:bookings", sync);
  }, []);

  const update = (next: Booking[]) => {
    setBookings(next);
    saveBookings(next);
  };

  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const completed = bookings.filter((b) => b.status === "completed");

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("app.title")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("app.subtitle")}</p>

        {bookings.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
            <CalendarCheck className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">{t("app.empty")}</p>
            <Link
              to="/workers"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t("app.new")}
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <Section title={`${t("app.upcoming")} (${upcoming.length})`}>
              {upcoming.map((b) => (
                <Row key={b.id}>
                  <div>
                    <p className="font-semibold text-foreground">{b.workerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {t(`services.${b.service}`)} · {b.area}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label={t("app.markDone")}
                      onClick={() => {
                        update(
                          bookings.map((x) => (x.id === b.id ? { ...x, status: "completed" } : x)),
                        );
                        toast.success(t("app.done"));
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground hover:bg-accent"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("app.cancel")}
                      onClick={() => {
                        update(bookings.filter((x) => x.id !== b.id));
                        toast.success(t("app.cancelled"));
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-destructive hover:bg-accent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Row>
              ))}
            </Section>
            <Section title={`${t("app.completed")} (${completed.length})`}>
              {completed.map((b) => (
                <Row key={b.id}>
                  <div>
                    <p className="font-semibold text-foreground line-through">{b.workerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {t(`services.${b.service}`)} · {b.area}
                    </p>
                  </div>
                </Row>
              ))}
            </Section>
          </div>
        )}
      </Container>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card flex items-center justify-between gap-4 rounded-2xl p-4">{children}</div>
  );
}
