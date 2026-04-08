import { useState, useCallback, useMemo } from "react";
import { MdAdd } from "react-icons/md";

import type { Category } from "../../services/api/categories.api";
import { CategoryForm } from "../../features/categories/category-form";
import { Drawer } from "../../components/ui/Drawer";
import { CategoriesTable } from "../../features/categories/categories-table";
import { useCategories } from "../../features/categories/use-categories";

export function CategoriesPage() {
  const { data: categories } = useCategories();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const selectedCategory = useMemo<Category | null>(() => {
    if (!categories || !selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId) ?? null;
  }, [categories, selectedCategoryId]);

  const openNew = useCallback(() => {
    setSelectedCategoryId(null);
    setDrawerOpen(true);
  }, []);

  const openEdit = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);

    setTimeout(() => {
      setSelectedCategoryId(null);
    }, 300);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Catálogo
          </p>
          <h1 className="mt-1 text-2xl font-bold text-strong">Categorías</h1>
          <p className="mt-2 text-sm text-soft">
            Organizá las categorías del sistema de forma clara y ordenada.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          <MdAdd size={18} />
          Nueva categoría
        </button>
      </div>

      <CategoriesTable
        selectedCategoryId={selectedCategoryId}
        onEditCategory={openEdit}
      />

      <Drawer open={drawerOpen} onClose={closeDrawer}>
        <CategoryForm category={selectedCategory} onCancelEdit={closeDrawer} />
      </Drawer>
    </div>
  );
}
