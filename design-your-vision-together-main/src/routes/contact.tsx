import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Container } from "../components/Container";
import { useI18n } from "../lib/i18n";
import { Mail, MessageCircle, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Find Locals — Support for customers and workers" },
      {
        name: "description",
        content:
          "Questions about booking a worker or joining Find Locals? Send us a message and our support team will reply in your language.",
      },
      { property: "og:title", content: "Contact Find Locals" },
      { property: "og:description", content: "Support for customers and local service workers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

function ContactPage() {
  const { t } = useI18n();
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("contact.title")}
            </h1>
            <p className="mt-4 text-muted-foreground">{t("contact.subtitle")}</p>
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                +91 98123 40000
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                support@findlocals.app
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <MessageCircle className="h-4 w-4 text-primary" />
                Mon – Sat, 9:00 – 20:00
              </li>
            </ul>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              (e.target as HTMLFormElement).reset();
              toast.success(t("contact.success"));
            }}
            className="glass-card space-y-4 rounded-2xl p-6"
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("contact.name")}
              </span>
              <input required name="name" className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("contact.email")}
              </span>
              <input required type="email" name="email" className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("contact.message")}
              </span>
              <textarea required name="message" rows={5} className={inputClass} />
            </label>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("contact.send")}
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}
