import { useForm } from "react-hook-form";

import { useIngredients } from "../ingredients/use-ingredients";
import { useCreateRecipeItem } from "./use-recipes";

type FormData = {
  ingredientId: string;
  quantity: number;
  unit: "kg" | "g" | "l" | "ml" | "unit";
};

const UNIT_LABELS: Record<FormData["unit"], string> = {
  kg: "Kilogramo (kg)",
  g: "Gramo (g)",
  l: "Litro (l)",
  ml: "Mililitro (ml)",
  unit: "Unidad (u)",
};

export function RecipeItemForm({ recipeId }: { recipeId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      unit: "g",
      quantity: 1,
    },
  });

  const { data: ingredients } = useIngredients();
  const mutation = useCreateRecipeItem();

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      {
        recipeId,
        data: {
          ingredientId: data.ingredientId,
          quantity: Number(data.quantity),
          unit: data.unit,
        },
      },
      {
        onSuccess: () =>
          reset({
            unit: "g",
            quantity: 1,
          }),
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl border border-sombra bg-arena/40 p-4"
    >
      <div>
        <p className="text-sm font-semibold text-cafe">Agregar ingrediente a la receta</p>
        <p className="mt-0.5 text-xs leading-5 text-cafe/70">
          Seleccioná el ingrediente, indicá la cantidad y la unidad de medida
          en la que se usa en esta receta.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1 md:col-span-3">
          <label htmlFor="item-ingredient" className="text-sm font-medium text-cafe">
            Ingrediente
          </label>
          <select
            id="item-ingredient"
            {...register("ingredientId", {
              required: "Debes seleccionar un ingrediente",
            })}
            className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-sm text-cafe outline-none transition focus:border-bordo"
          >
            <option value="">Seleccionar ingrediente</option>
            {ingredients?.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </option>
            ))}
          </select>
          {errors.ingredientId ? (
            <p className="text-xs text-red-700">{errors.ingredientId.message}</p>
          ) : null}
        </div>

        <div className="space-y-1 md:col-span-1">
          <label htmlFor="item-quantity" className="text-sm font-medium text-cafe">
            Cantidad
          </label>
          <input
            id="item-quantity"
            type="number"
            step="0.01"
            min="0"
            {...register("quantity", {
              valueAsNumber: true,
              required: "Debes ingresar la cantidad",
            })}
            placeholder="Ej: 250"
            className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-sm text-cafe outline-none transition focus:border-bordo"
          />
          {errors.quantity ? (
            <p className="text-xs text-red-700">{errors.quantity.message}</p>
          ) : null}
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="item-unit" className="text-sm font-medium text-cafe">
            Unidad de medida
          </label>
          <select
            id="item-unit"
            {...register("unit")}
            className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-sm text-cafe outline-none transition focus:border-bordo"
          >
            {Object.entries(UNIT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-bordo px-4 py-3 text-sm font-semibold text-crema transition hover:bg-cafe disabled:cursor-not-allowed disabled:opacity-60"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Agregando..." : "Agregar ingrediente"}
      </button>

      {mutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Ocurrió un error al agregar el ingrediente"}
        </div>
      ) : null}

      {mutation.isSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Ingrediente agregado a la receta.
        </div>
      ) : null}
    </form>
  );
}
