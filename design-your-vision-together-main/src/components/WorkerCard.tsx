import { toast } from "sonner";
import { BadgeCheck, MapPin, Phone, Star } from "lucide-react";
import { services, type Worker } from "../lib/services";
import { useI18n } from "../lib/i18n";
import { addBooking } from "../lib/bookings";

export function WorkerCard({ worker }: { worker: Worker }) {
  const { t } = useI18n();
  const Icon = services.find((s) => s.id === worker.service)?.icon;
  const initials = worker.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <article className="glass-card flex flex-col rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-base font-semibold text-secondary-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-foreground">{worker.name}</h3>
            <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label={t("workers.verified")} />
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {t(`services.${worker.service}`)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1 font-medium text-foreground">
          <Star className="h-4 w-4 fill-chart-3 text-chart-3" />
          {worker.rating.toFixed(1)}
          <span className="font-normal text-muted-foreground">({worker.reviews})</span>
        </span>
        <span>
          {worker.experience} {t("workers.experience")}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {worker.area}
        </span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {t("workers.speaks")}: {worker.languages.join(", ")}
      </p>

      <p className="mt-3 text-sm font-semibold text-foreground">
        {t("workers.from")} ₹{worker.visitFee} / {t("workers.visit")}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`tel:${worker.phone}`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Phone className="h-4 w-4" />
          {t("workers.call")}
        </a>
        <button
          type="button"
          onClick={() => {
            addBooking({ workerId: worker.id, workerName: worker.name, service: worker.service, area: worker.area });
            toast.success(t("app.created"));
          }}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {t("workers.book")}
        </button>
      </div>
    </article>
  );
}
