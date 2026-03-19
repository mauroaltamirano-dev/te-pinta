import { useMemo, useState } from "react";
import type { Category } from "../../services/api/categories.api";
import { CategoryForm } from "../../features/categories/category-form";
import { CategoriesTable } from "../../features/categories/categories-table";
import { useCategories } from "../../features/categories/use-categories";

export function CategoriesPage() {
  const { data: categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const selectedCategory = useMemo<Category | null>(() => {
    if (!categories || !selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId) ?? null;
  }, [categories, selectedCategoryId]);

  const handleCancelEdit = () => setSelectedCategoryId(null);

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Catálogo
        </p>
        <h1 className="mt-1 text-2xl font-bold text-strong">Categorías</h1>
      </div>

      {/* ── Banner de edición activa ────────────────────────── */}
      {selectedCategory && (
        <div
          className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm animate-slide-up"
          style={{
            background: "var(--warning-soft)",
            borderColor: "var(--warning)",
            color: "var(--warning-text)",
          }}
        >
          <span>
            ✏️ Editando:{" "}
            <strong className="font-semibold">{selectedCategory.name}</strong>
          </span>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="ml-4 rounded-lg px-3 py-1 text-xs font-semibold transition"
            style={{
              background: "var(--warning)",
              color: "#fff",
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* ── Layout principal ────────────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <CategoryForm
          category={selectedCategory}
          onCancelEdit={handleCancelEdit}
        />
        <CategoriesTable
          selectedCategoryId={selectedCategoryId}
          onEditCategory={setSelectedCategoryId}
        />
      </div>
    </div>
  );
}
