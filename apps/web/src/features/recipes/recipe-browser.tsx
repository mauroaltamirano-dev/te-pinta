import { useState } from "react";

import { useIngredients } from "../ingredients/use-ingredients";
import { useProducts } from "../products/use-products";
import { RecipeItemForm } from "./recipe-item-form";
import { useRecipeByProductId, useRecipeItems } from "./use-recipes";

export function RecipeBrowser() {
  const [selectedProductId, setSelectedProductId] = useState("");

  const { data: products } = useProducts();
  const preparedProducts = products?.filter(
    (product) => product.kind === "prepared",
  );
  const { data: ingredients } = useIngredients();

  const recipeQuery = useRecipeByProductId(selectedProductId);
  const recipeId = recipeQuery.data?.id ?? "";
  const itemsQuery = useRecipeItems(recipeId);

  const getProductName = (productId: string) =>
    products?.find((product) => product.id === productId)?.name ?? productId;

  const getIngredientName = (ingredientId: string) =>
    ingredients?.find((ingredient) => ingredient.id === ingredientId)?.name ??
    ingredientId;

  return (
    <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
      <div className="border-b border-sombra px-5 py-4">
        <h2 className="text-lg font-bold text-bordo">Visor de recetas</h2>
        <p className="mt-1 text-sm text-cafe/75">
          Consultá la receta de cualquier producto preparado: sus ingredientes,
          cantidades y notas de elaboración.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <label htmlFor="recipe-selector" className="text-sm font-semibold text-cafe">
            Seleccionar producto
          </label>
          <p className="text-xs leading-5 text-cafe/70">
            Elegí el producto para ver o editar su receta. Solo se muestran
            productos preparados.
          </p>
          <select
            id="recipe-selector"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
          >
            <option value="">Seleccionar producto preparado</option>
            {preparedProducts?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {!selectedProductId ? (
          <p className="text-sm text-cafe/60">
            Seleccioná un producto para ver su receta.
          </p>
        ) : null}

        {selectedProductId && recipeQuery.isLoading ? (
          <p className="text-sm text-cafe/70">Cargando receta...</p>
        ) : null}

        {selectedProductId && recipeQuery.isError ? (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            Este producto todavía no tiene una receta activa. Podés crearla
            desde la sección "Nueva receta".
          </div>
        ) : null}

        {recipeQuery.data ? (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-2xl border border-sombra bg-arena/40 px-4 py-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cafe/60">
                  Producto
                </p>
                <p className="mt-1 font-medium text-bordo">
                  {getProductName(recipeQuery.data.productId)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cafe/60">
                  Rendimiento
                </p>
                <p className="mt-1 font-medium text-cafe">
                  {recipeQuery.data.yieldQuantity} unidades
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cafe/60">
                  Notas
                </p>
                <p className="mt-1 text-cafe/80">
                  {recipeQuery.data.notes || "Sin notas"}
                </p>
              </div>
            </div>

            <RecipeItemForm recipeId={recipeQuery.data.id} />

            <div className="overflow-hidden rounded-2xl border border-sombra">
              <div className="border-b border-sombra bg-arena/50 px-5 py-3">
                <p className="text-sm font-semibold text-cafe">
                  Ingredientes de la receta
                </p>
              </div>
              <table className="min-w-full">
                <thead className="bg-arena/30">
                  <tr>
                    <th className="border-b border-sombra px-5 py-3 text-left text-sm font-semibold text-cafe">
                      Ingrediente
                    </th>
                    <th className="border-b border-sombra px-5 py-3 text-left text-sm font-semibold text-cafe">
                      Cantidad
                    </th>
                    <th className="border-b border-sombra px-5 py-3 text-left text-sm font-semibold text-cafe">
                      Unidad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {itemsQuery.data?.map((item) => (
                    <tr key={item.id} className="transition hover:bg-arena/20">
                      <td className="border-b border-sombra px-5 py-3 text-sm font-medium text-bordo">
                        {getIngredientName(item.ingredientId)}
                      </td>
                      <td className="border-b border-sombra px-5 py-3 text-sm text-cafe">
                        {item.quantity}
                      </td>
                      <td className="border-b border-sombra px-5 py-3 text-sm text-cafe">
                        {item.unit}
                      </td>
                    </tr>
                  ))}

                  {!itemsQuery.data?.length ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-8 text-center text-sm text-cafe/65"
                      >
                        Todavía no hay ingredientes cargados en esta receta.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
