import { useForm } from "react-hook-form";

import { useProducts } from "../products/use-products";
import { useCreateRecipe } from "./use-recipes";

type FormData = {
  productId: string;
  yieldQuantity: number;
  notes?: string;
};

export function RecipeForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      yieldQuantity: 1,
    },
  });

  const { data: products } = useProducts();
  const mutation = useCreateRecipe();

  const preparedProducts = products?.filter(
    (product) => product.kind === "prepared",
  );

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      {
        productId: data.productId,
        yieldQuantity: Number(data.yieldQuantity),
        notes: data.notes,
      },
      {
        onSuccess: () =>
          reset({
            yieldQuantity: 1,
          }),
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-sombra bg-crema p-5 shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cafe/65">
          Nueva receta
        </p>
        <h2 className="mt-2 text-xl font-bold text-bordo">Crear receta</h2>
        <p className="mt-2 text-sm leading-6 text-cafe/80">
          Asociá una receta a un producto preparado. Una vez creada, podrás
          agregar los ingredientes y cantidades que lo componen.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="recipe-product" className="text-sm font-semibold text-cafe">
          Producto preparado
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Seleccioná el producto para el cual estás definiendo la receta. Solo
          se muestran productos del tipo "Preparado".
        </p>
        <select
          id="recipe-product"
          {...register("productId", {
            required: "Debes seleccionar un producto",
          })}
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
        >
          <option value="">Seleccionar producto preparado</option>
          {preparedProducts?.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        {errors.productId ? (
          <p className="text-sm text-red-700">{errors.productId.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="recipe-yield" className="text-sm font-semibold text-cafe">
          Rendimiento (unidades producidas)
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Cantidad de unidades que produce esta receta. Por ejemplo, si la
          receta produce 12 empanadas, ingresá 12.
        </p>
        <input
          id="recipe-yield"
          type="number"
          step="1"
          min="1"
          {...register("yieldQuantity", {
            valueAsNumber: true,
            required: "Debes ingresar el rendimiento",
            min: { value: 1, message: "El rendimiento mínimo es 1" },
          })}
          placeholder="Ej: 12"
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
        />
        {errors.yieldQuantity ? (
          <p className="text-sm text-red-700">{errors.yieldQuantity.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="recipe-notes" className="text-sm font-semibold text-cafe">
          Notas <span className="font-normal text-cafe/50">(opcional)</span>
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Observaciones sobre la receta: técnica de cocción, temperatura,
          variantes, etc.
        </p>
        <textarea
          id="recipe-notes"
          {...register("notes")}
          rows={2}
          placeholder="Ej: Hornear a 180° por 25 minutos"
          className="w-full resize-none rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition placeholder:text-cafe/45 focus:border-bordo"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-bordo px-4 py-3 text-sm font-semibold text-crema transition hover:bg-cafe disabled:cursor-not-allowed disabled:opacity-60"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Creando receta..." : "Crear receta"}
      </button>

      {mutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Ocurrió un error al crear la receta"}
        </div>
      ) : null}

      {mutation.isSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Receta creada correctamente. Ahora podés agregar los ingredientes.
        </div>
      ) : null}
    </form>
  );
}
