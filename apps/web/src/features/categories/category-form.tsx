import { useForm } from "react-hook-form";

import { useCreateCategory } from "./use-categories";

type FormData = {
  name: string;
  description?: string;
};

export function CategoryForm() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const mutation = useCreateCategory();

  const onSubmit = (data: FormData) => {
    mutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-sombra bg-crema p-5 shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cafe/65">
          Nueva categoría
        </p>
        <h2 className="mt-2 text-xl font-bold text-bordo">Crear categoría</h2>
        <p className="mt-2 text-sm leading-6 text-cafe/80">
          Registrá una nueva categoría para clasificar mejor tus productos.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="category-name"
          className="text-sm font-medium text-cafe"
        >
          Nombre
        </label>
        <input
          id="category-name"
          {...register("name")}
          placeholder="Ej: Empanadas clásicas"
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition placeholder:text-cafe/45 focus:border-bordo"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="category-description"
          className="text-sm font-medium text-cafe"
        >
          Descripción
        </label>
        <input
          id="category-description"
          {...register("description")}
          placeholder="Ej: Variedades tradicionales del menú"
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition placeholder:text-cafe/45 focus:border-bordo"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-bordo px-4 py-3 text-sm font-semibold text-crema transition hover:bg-cafe disabled:cursor-not-allowed disabled:opacity-60"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Creando categoría..." : "Guardar categoría"}
      </button>

      {mutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Ocurrió un error al crear la categoría"}
        </div>
      ) : null}

      {mutation.isSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Categoría creada correctamente.
        </div>
      ) : null}
    </form>
  );
}
