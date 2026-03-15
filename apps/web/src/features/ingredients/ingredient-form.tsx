import { useForm } from "react-hook-form";
import { useCreateIngredient } from "./use-ingredients";

type FormData = {
  name: string;
  description?: string;
  unit: "kg" | "g" | "l" | "ml" | "unit";
  currentCost: number;
};

const UNIT_LABELS: Record<FormData["unit"], string> = {
  kg: "Kilogramo (kg)",
  g: "Gramo (g)",
  l: "Litro (l)",
  ml: "Mililitro (ml)",
  unit: "Unidad (u)",
};

export function IngredientForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      unit: "kg",
      currentCost: 0,
    },
  });

  const mutation = useCreateIngredient();

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      {
        ...data,
        currentCost: Number(data.currentCost),
      },
      {
        onSuccess: () => reset({ unit: "kg", currentCost: 0 }),
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
          Nuevo ingrediente
        </p>
        <h2 className="mt-2 text-xl font-bold text-bordo">
          Registrar ingrediente
        </h2>
        <p className="mt-2 text-sm leading-6 text-cafe/80">
          Cargá los datos del ingrediente que usás en tus recetas. El costo
          actual se usará para calcular el costo de producción.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="ingredient-name" className="text-sm font-semibold text-cafe">
          Nombre del ingrediente
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Nombre con el que identificarás este insumo en el sistema y en las
          recetas.
        </p>
        <input
          id="ingredient-name"
          {...register("name", { required: "Debes ingresar un nombre" })}
          placeholder="Ej: Harina 000"
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition placeholder:text-cafe/45 focus:border-bordo"
        />
        {errors.name ? (
          <p className="text-sm text-red-700">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="ingredient-description" className="text-sm font-semibold text-cafe">
          Descripción <span className="font-normal text-cafe/50">(opcional)</span>
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Información adicional para identificar mejor el ingrediente, como
          marca, presentación o calidad.
        </p>
        <input
          id="ingredient-description"
          {...register("description")}
          placeholder="Ej: Harina 000 de trigo, bolsa de 25kg"
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition placeholder:text-cafe/45 focus:border-bordo"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="ingredient-unit" className="text-sm font-semibold text-cafe">
          Unidad de medida
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Unidad en la que se mide y compra este ingrediente. Debe coincidir con
          la unidad que usás en la receta.
        </p>
        <select
          id="ingredient-unit"
          {...register("unit")}
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
        >
          {Object.entries(UNIT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="ingredient-cost" className="text-sm font-semibold text-cafe">
          Costo actual por unidad
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Precio al que comprás actualmente este ingrediente por unidad de
          medida seleccionada. Se usa para calcular el costo de producción.
        </p>
        <input
          id="ingredient-cost"
          type="number"
          step="0.01"
          min="0"
          {...register("currentCost", {
            valueAsNumber: true,
            required: "Debes ingresar el costo",
          })}
          placeholder="Ej: 850"
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
        />
        {errors.currentCost ? (
          <p className="text-sm text-red-700">{errors.currentCost.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-bordo px-4 py-3 text-sm font-semibold text-crema transition hover:bg-cafe disabled:cursor-not-allowed disabled:opacity-60"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Guardando ingrediente..." : "Guardar ingrediente"}
      </button>

      {mutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Ocurrió un error al guardar el ingrediente"}
        </div>
      ) : null}

      {mutation.isSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Ingrediente registrado correctamente.
        </div>
      ) : null}
    </form>
  );
}
