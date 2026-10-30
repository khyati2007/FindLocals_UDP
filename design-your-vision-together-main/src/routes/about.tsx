import { createFileRoute } from "@tanstack/react-router";
import { Container } from "../components/Container";
import { useI18n } from "../lib/i18n";
import { Languages, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Find Locals — Connecting local workers and customers" },
      {
        name: "description",
        content:
          "Find Locals was built to solve the problem of finding trusted local workers, and to give household service workers more job opportunities.",
      },
      { property: "og:title", content: "About Find Locals" },
      {
        property: "og:description",
        content: "Why we built a multilingual platform for local household services.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  const values = [
    { icon: ShieldCheck, title: t("about.value1"), desc: t("about.value1.desc") },
    { icon: Languages, title: t("about.value2"), desc: t("about.value2.desc") },
    { icon: Users, title: t("about.value3"), desc: t("about.value3.desc") },
  ];

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("about.title")}
          </h1>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>{t("about.body1")}</p>
            <p>{t("about.body2")}</p>
            <p>{t("about.body3")}</p>
          </div>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="glass-card rounded-2xl p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <v.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold text-foreground">{v.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
