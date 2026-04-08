import { useState } from "react";
import {
  MdEdit,
  MdDelete,
  MdPowerSettingsNew,
  MdClose,
  MdCheck,
} from "react-icons/md";

import { useIngredients } from "../ingredients/use-ingredients";
import { useProducts } from "../products/use-products";
import { RecipeItemForm } from "./recipe-item-form";
import { RecipeForm } from "./recipe-form";
import { Drawer } from "../../components/ui/Drawer";
import {
  useDeactivateRecipe,
  useDeleteRecipeItem,
  useReactivateRecipe,
  useRecipeByProductId,
  useRecipeItems,
  useUpdateRecipeItem,
} from "./use-recipes";

type RecipeUnit = "kg" | "g" | "l" | "ml" | "unit";

type RecipeBrowserProps = {
  selectedProductId: string;
  onSelectProductId: (id: string) => void;
};

export function RecipeBrowser({ selectedProductId, onSelectProductId }: RecipeBrowserProps) {
  const [isEditingRecipe, setIsEditingRecipe] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemQuantity, setEditingItemQuantity] = useState("");
  const [editingItemUnit, setEditingItemUnit] = useState<RecipeUnit>("g");

  const { data: products } = useProducts();
  const { data: ingredients } = useIngredients();

  const preparedProducts = products?.filter((p) => p.kind === "prepared");

  const recipeQuery = useRecipeByProductId(selectedProductId, {
    includeInactive: true,
  });
  const recipeId = recipeQuery.data?.id ?? "";
  const itemsQuery = useRecipeItems(recipeId);

  const deactivateRecipeMutation = useDeactivateRecipe();
  const reactivateRecipeMutation = useReactivateRecipe();
  const updateRecipeItemMutation = useUpdateRecipeItem();
  const deleteRecipeItemMutation = useDeleteRecipeItem();

  const getIngredientName = (ingredientId: string) =>
    ingredients?.find((i) => i.id === ingredientId)?.name ?? ingredientId;

  const recipe = recipeQuery.data;
  const hasRecipe = !!recipe;
  const isActive = recipe?.isActive ?? false;

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="border-b px-5 py-4"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--surface-2)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--foreground-muted)" }}
        >
          Recetas
        </p>
        <h2
          className="mt-0.5 text-base font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Visor de recetas
        </h2>
      </div>

      <div className="space-y-5 p-5">
        {/* ── Selector de producto ────────────────────────────── */}
        <div className="space-y-1.5">
          <label
            htmlFor="recipe-selector"
            className="block text-sm font-medium"
            style={{ color: "var(--foreground-soft)" }}
          >
            Producto preparado
          </label>
          <select
            id="recipe-selector"
            value={selectedProductId}
            onChange={(e) => {
              onSelectProductId(e.target.value);
              setIsEditingRecipe(false);
              setEditingItemId(null);
            }}
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
            style={{
              background: "var(--background)",
              borderColor: "var(--border)",
              color: selectedProductId
                ? "var(--foreground)"
                : "var(--foreground-muted)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--primary)";
              e.target.style.boxShadow = "0 0 0 3px var(--ring)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="">Seleccionar producto preparado…</option>
            {preparedProducts?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* ── Estado vacío ────────────────────────────────────── */}
        {!selectedProductId && (
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            Seleccioná un producto para ver su receta.
          </p>
        )}

        {/* ── Loading ─────────────────────────────────────────── */}
        {selectedProductId && recipeQuery.isLoading && (
          <p
            className="animate-pulse text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            Cargando receta…
          </p>
        )}

        {/* ── Sin receta ──────────────────────────────────────── */}
        {selectedProductId && recipeQuery.isError && (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{
              background: "var(--warning-soft)",
              borderColor: "var(--warning)",
              color: "var(--warning-text)",
            }}
          >
            Este producto todavía no tiene una receta. Podés crearla desde la
            sección <strong>Nueva receta</strong>.
          </div>
        )}

        {/* ── Contenido de la receta ──────────────────────────── */}
        {hasRecipe && (
          <div className="space-y-4 animate-fade-in">
            {/* Panel info receta */}
            <div
              className="grid gap-4 rounded-xl border px-5 py-4 sm:grid-cols-3"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border-soft)",
              }}
            >
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Rendimiento
                </p>
                <p
                  className="mt-1 text-sm font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {recipe.yieldQuantity} unidades
                </p>
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Estado
                </p>
                <span
                  className="mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={
                    isActive
                      ? {
                          background: "var(--success-soft)",
                          color: "var(--success-text)",
                        }
                      : {
                          background: "var(--surface-3)",
                          color: "var(--foreground-muted)",
                        }
                  }
                >
                  <span
                    className="mr-1.5 h-1.5 w-1.5 rounded-full"
                    style={{
                      background: isActive
                        ? "var(--success)"
                        : "var(--foreground-faint)",
                    }}
                  />
                  {isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Notas
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{
                    color: recipe.notes
                      ? "var(--foreground-soft)"
                      : "var(--foreground-faint)",
                  }}
                >
                  {recipe.notes || "Sin notas"}
                </p>
              </div>
            </div>

            {/* Acciones de receta */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsEditingRecipe((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition"
                style={
                  isEditingRecipe
                    ? {
                        background: "var(--warning)",
                        borderColor: "var(--warning)",
                        color: "#fff",
                      }
                    : {
                        background: "var(--surface-2)",
                        borderColor: "var(--border)",
                        color: "var(--foreground-soft)",
                      }
                }
              >
                <MdEdit size={13} />
                {isEditingRecipe ? "Cerrar edición" : "Editar receta"}
              </button>

              {isActive ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("¿Desactivar esta receta?"))
                      deactivateRecipeMutation.mutate(recipe.id);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition"
                  style={{
                    background: "var(--surface-2)",
                    borderColor: "var(--border)",
                    color: "var(--foreground-muted)",
                  }}
                >
                  <MdPowerSettingsNew size={13} />
                  Desactivar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("¿Reactivar esta receta?"))
                      reactivateRecipeMutation.mutate(recipe.id);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition"
                  style={{
                    background: "var(--success-soft)",
                    borderColor: "var(--success)",
                    color: "var(--success-text)",
                  }}
                >
                  <MdPowerSettingsNew size={13} />
                  Reactivar
                </button>
              )}
            </div>

            {/* Form edición receta */}
            <Drawer open={isEditingRecipe} onClose={() => setIsEditingRecipe(false)}>
              <RecipeForm
                recipe={recipe}
                onCancelEdit={() => setIsEditingRecipe(false)}
              />
            </Drawer>

            {/* Form agregar ingrediente */}
            {isActive && <RecipeItemForm recipeId={recipe.id} />}

            {/* ── Tabla de items ───────────────────────────────── */}
            <div
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: "var(--border-soft)" }}
            >
              {/* Header tabla */}
              <div
                className="border-b px-5 py-3 flex items-center justify-between"
                style={{
                  borderColor: "var(--border-soft)",
                  background: "var(--surface-2)",
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Ingredientes de la receta
                </p>
                <span
                  className="text-xs"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {itemsQuery.data?.length ?? 0} ingrediente
                  {(itemsQuery.data?.length ?? 0) !== 1 ? "s" : ""}
                </span>
              </div>

              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--surface-2)" }}>
                    {["Ingrediente", "Cantidad", "Unidad", ""].map((col) => (
                      <th
                        key={col}
                        className="border-b px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{
                          borderColor: "var(--border-soft)",
                          color: "var(--foreground-muted)",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {itemsQuery.data?.length ? (
                    itemsQuery.data.map((item) => {
                      const isEditingItem = editingItemId === item.id;

                      return (
                        <tr
                          key={item.id}
                          className="transition"
                          style={{
                            background: isEditingItem
                              ? "var(--warning-soft)"
                              : "transparent",
                            borderLeft: isEditingItem
                              ? "3px solid var(--warning)"
                              : "3px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (!isEditingItem)
                              (
                                e.currentTarget as HTMLTableRowElement
                              ).style.background = "var(--surface-hover)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isEditingItem)
                              (
                                e.currentTarget as HTMLTableRowElement
                              ).style.background = "transparent";
                          }}
                        >
                          {/* Nombre */}
                          <td
                            className="border-b px-5 py-3 font-medium"
                            style={{
                              borderColor: "var(--border-soft)",
                              color: isEditingItem
                                ? "var(--warning-text)"
                                : "var(--foreground)",
                            }}
                          >
                            {getIngredientName(item.ingredientId)}
                          </td>

                          {/* Cantidad */}
                          <td
                            className="border-b px-5 py-3"
                            style={{ borderColor: "var(--border-soft)" }}
                          >
                            {isEditingItem ? (
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editingItemQuantity}
                                onChange={(e) =>
                                  setEditingItemQuantity(e.target.value)
                                }
                                className="w-24 rounded-lg border px-3 py-1.5 text-sm outline-none"
                                style={{
                                  background: "var(--background)",
                                  borderColor: "var(--warning)",
                                  color: "var(--foreground)",
                                  boxShadow: "0 0 0 3px var(--warning-soft)",
                                }}
                              />
                            ) : (
                              <span
                                className="tabular-nums"
                                style={{ color: "var(--foreground)" }}
                              >
                                {item.quantity}
                              </span>
                            )}
                          </td>

                          {/* Unidad */}
                          <td
                            className="border-b px-5 py-3"
                            style={{ borderColor: "var(--border-soft)" }}
                          >
                            {isEditingItem ? (
                              <select
                                value={editingItemUnit}
                                onChange={(e) =>
                                  setEditingItemUnit(
                                    e.target.value as RecipeUnit,
                                  )
                                }
                                className="rounded-lg border px-3 py-1.5 text-sm outline-none"
                                style={{
                                  background: "var(--background)",
                                  borderColor: "var(--warning)",
                                  color: "var(--foreground)",
                                  boxShadow: "0 0 0 3px var(--warning-soft)",
                                }}
                              >
                                {["kg", "g", "l", "ml", "unit"].map((u) => (
                                  <option key={u} value={u}>
                                    {u}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span
                                className="inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold"
                                style={{
                                  background: "var(--surface-3)",
                                  color: "var(--foreground-soft)",
                                }}
                              >
                                {item.unit}
                              </span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td
                            className="border-b px-5 py-3"
                            style={{ borderColor: "var(--border-soft)" }}
                          >
                            <div className="flex items-center gap-2">
                              {isEditingItem ? (
                                <>
                                  {/* Guardar */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateRecipeItemMutation.mutate(
                                        {
                                          recipeId: recipe.id,
                                          itemId: item.id,
                                          data: {
                                            quantity:
                                              Number(editingItemQuantity),
                                            unit: editingItemUnit,
                                          },
                                        },
                                        {
                                          onSuccess: () => {
                                            setEditingItemId(null);
                                            setEditingItemQuantity("");
                                          },
                                        },
                                      );
                                    }}
                                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition"
                                    style={{
                                      background: "var(--warning)",
                                      color: "#fff",
                                    }}
                                  >
                                    <MdCheck size={13} />
                                    Guardar
                                  </button>
                                  {/* Cancelar */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingItemId(null);
                                      setEditingItemQuantity("");
                                    }}
                                    className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition"
                                    style={{
                                      background: "transparent",
                                      borderColor: "var(--border)",
                                      color: "var(--foreground-muted)",
                                    }}
                                  >
                                    <MdClose size={13} />
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* Editar item */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingItemId(item.id);
                                      setEditingItemQuantity(
                                        String(item.quantity),
                                      );
                                      setEditingItemUnit(item.unit);
                                    }}
                                    className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition"
                                    style={{
                                      background: "var(--surface-2)",
                                      borderColor: "var(--border)",
                                      color: "var(--foreground-soft)",
                                    }}
                                    title="Editar"
                                  >
                                    <MdEdit size={13} />
                                    Editar
                                  </button>
                                  {/* Eliminar item */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "¿Eliminar este ingrediente de la receta?",
                                        )
                                      ) {
                                        deleteRecipeItemMutation.mutate({
                                          recipeId: recipe.id,
                                          itemId: item.id,
                                        });
                                      }
                                    }}
                                    className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition"
                                    style={{
                                      background: "var(--danger-soft)",
                                      borderColor: "var(--danger)",
                                      color: "var(--danger-text)",
                                    }}
                                    title="Eliminar"
                                  >
                                    <MdDelete size={13} />
                                    Eliminar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-sm"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        Todavía no hay ingredientes en esta receta.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
