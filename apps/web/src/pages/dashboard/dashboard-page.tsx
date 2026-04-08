import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  useWeeklyClosures,
  useOpenClosure,
} from "../../features/dashboard/hooks/use-weekly-closures";
import { OperationalSection } from "../../features/dashboard/components/operational-section";
import { WeeklySection } from "../../features/dashboard/components/weekly-section";
import { ClosureSelector } from "../../features/dashboard/components/closure-selector";

function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-4">
        <div
          className="h-4 w-40 rounded"
          style={{ background: "var(--surface-3)" }}
        />
        <div className="grid gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl border"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="h-px" style={{ background: "var(--border)" }} />

      <div className="space-y-4">
        <div
          className="h-4 w-48 rounded"
          style={{ background: "var(--surface-3)" }}
        />
        <div className="grid gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl border"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: closures, isLoading: loadingClosures } = useWeeklyClosures();
  const { data: openClosure } = useOpenClosure();

  const [selectedClosureId, setSelectedClosureId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (selectedClosureId) return;

    if (openClosure?.id) {
      setSelectedClosureId(openClosure.id);
      return;
    }

    if (closures && closures.length > 0) {
      setSelectedClosureId(closures[0].id);
    }
  }, [openClosure, closures, selectedClosureId]);

  const selectedClosure =
    closures?.find((c) => c.id === selectedClosureId) ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Dashboard
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {closures && closures.length > 0 && (
            <ClosureSelector
              closures={closures}
              selectedId={selectedClosureId}
              onChange={setSelectedClosureId}
            />
          )}

          {!openClosure && !loadingClosures && (
            <Link
              to="/weekly-closures"
              className="text-xs font-medium px-3 py-1.5 rounded-lg border hover:opacity-80 transition-opacity"
              style={{
                background: "rgba(192, 122, 82, 0.1)",
                borderColor: "var(--primary)",
                color: "var(--primary)",
              }}
            >
              + Abrir caja semanal
            </Link>
          )}
        </div>
      </div>

      {/* Contenido */}
      {loadingClosures ? (
        <PageSkeleton />
      ) : (
        <div className="space-y-10">
          <OperationalSection />

          <div
            className="flex items-center gap-4"
            style={{ color: "var(--foreground-muted)" }}
          >
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border)" }}
            />
            <span className="text-xs font-medium uppercase tracking-widest whitespace-nowrap">
              Análisis semanal
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border)" }}
            />
          </div>

          {selectedClosure ? (
            <WeeklySection closure={selectedClosure} />
          ) : (
            <div
              className="rounded-2xl border border-dashed py-12 text-center space-y-3"
              style={{ borderColor: "var(--border)" }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                No hay cierres semanales registrados
              </p>
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                Creá una caja semanal para empezar a ver métricas del negocio.
              </p>
              <Link
                to="/weekly-closures"
                className="inline-block mt-2 text-sm font-medium px-4 py-2 rounded-lg"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                Crear caja semanal
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
