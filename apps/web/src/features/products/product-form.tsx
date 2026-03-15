import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import type { Product } from "../../services/api/products.api";
import { useCategories } from "../categories/use-categories";
import { useCreateProduct, useUpdateProduct } from "./use-products";

type FormData = {
  categoryId: string;
  name: string;
  description?: string;
  kind: "prepared" | "resale" | "combo";
  unitPrice: number;
  halfDozenPrice?: number;
  dozenPrice?: number;
  directCost?: number;
};

type ProductFormProps = {
  product?: Product | null;
  onCancelEdit?: () => void;
};

function formatKindLabel(kind: FormData["kind"]) {
  if (kind === "prepared") return "Preparado";
  if (kind === "resale") return "Reventa";
  return "Combo";
}

export function ProductForm({ product, onCancelEdit }: ProductFormProps) {
  const isEditing = Boolean(product);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      categoryId: "",
      name: "",
      description: "",
      kind: "prepared",
      unitPrice: 0,
      halfDozenPrice: 0,
      dozenPrice: 0,
      directCost: 0,
    },
  });

  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const kind = watch("kind");

  const requiresDirectCost = useMemo(
    () => kind === "resale" || kind === "combo",
    [kind],
  );

  const isPrepared = kind === "prepared";

  useEffect(() => {
    if (product) {
      reset({
        categoryId: product.categoryId,
        name: product.name,
        description: product.description ?? "",
        kind: product.kind,
        unitPrice: product.unitPrice,
        halfDozenPrice: product.halfDozenPrice ?? 0,
        dozenPrice: product.dozenPrice ?? 0,
        directCost: product.directCost ?? 0,
      });

      return;
    }

    reset({
      categoryId: "",
      name: "",
      description: "",
      kind: "prepared",
      unitPrice: 0,
      halfDozenPrice: 0,
      dozenPrice: 0,
      directCost: 0,
    });
  }, [product, reset]);

  const onSubmit = (data: FormData) => {
    const payload = {
      categoryId: data.categoryId,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      kind: data.kind,
      unitPrice: Number(data.unitPrice),
      halfDozenPrice: isPrepared
        ? data.halfDozenPrice && data.halfDozenPrice > 0
          ? Number(data.halfDozenPrice)
          : undefined
        : undefined,
      dozenPrice: isPrepared
        ? data.dozenPrice && data.dozenPrice > 0
          ? Number(data.dozenPrice)
          : undefined
        : undefined,
      directCost: requiresDirectCost
        ? data.directCost !== undefined && data.directCost > 0
          ? Number(data.directCost)
          : undefined
        : undefined,
    };

    if (isEditing && product) {
      updateMutation.mutate(
        {
          productId: product.id,
          data: payload,
        },
        {
          onSuccess: () => {
            onCancelEdit?.();
          },
        },
      );

      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        reset({
          categoryId: "",
          name: "",
          description: "",
          kind: "prepared",
          unitPrice: 0,
          halfDozenPrice: 0,
          dozenPrice: 0,
          directCost: 0,
        });
      },
    });
  };

  const currentMutation = isEditing ? updateMutation : createMutation;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-sombra bg-crema p-5 shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cafe/65">
          {isEditing ? "Edición de producto" : "Nuevo producto"}
        </p>

        <h2 className="mt-2 text-xl font-bold text-bordo">
          {isEditing ? "Modificar producto" : "Registrar producto"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-cafe/80">
          {isEditing
            ? "Actualizá la información del producto seleccionado. Revisá especialmente categoría, tipo, precios y costo directo."
            : "Completá la información del producto para dejar bien definido qué se vende, cómo se clasifica y qué valores económicos utiliza el sistema."}
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="product-category"
          className="text-sm font-semibold text-cafe"
        >
          Categoría del producto
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Elegí la categoría a la que pertenece este producto dentro del menú o
          catálogo.
        </p>
        <select
          id="product-category"
          {...register("categoryId", {
            required: "Debes seleccionar una categoría",
          })}
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
        >
          <option value="">Seleccionar categoría</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId ? (
          <p className="text-sm text-red-700">{errors.categoryId.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="product-name"
          className="text-sm font-semibold text-cafe"
        >
          Nombre del producto
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Ingresá el nombre con el que el producto será identificado en el
          sistema.
        </p>
        <input
          id="product-name"
          {...register("name", {
            required: "Debes ingresar un nombre",
          })}
          placeholder="Ej: Empanada de jamón y queso"
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition placeholder:text-cafe/45 focus:border-bordo"
        />
        {errors.name ? (
          <p className="text-sm text-red-700">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="product-description"
          className="text-sm font-semibold text-cafe"
        >
          Descripción del producto
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Detallá información útil para identificarlo mejor. Este campo es
          opcional.
        </p>
        <textarea
          id="product-description"
          {...register("description")}
          rows={3}
          placeholder="Ej: Empanada horneable, lista para freezar o cocinar"
          className="w-full resize-none rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition placeholder:text-cafe/45 focus:border-bordo"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="product-kind"
          className="text-sm font-semibold text-cafe"
        >
          Tipo de producto
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Definí si el producto es elaborado por ustedes, de reventa o si
          corresponde a un combo.
        </p>
        <select
          id="product-kind"
          {...register("kind")}
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
        >
          <option value="prepared">Preparado</option>
          <option value="resale">Reventa</option>
          <option value="combo">Combo</option>
        </select>

        <div className="rounded-2xl border border-sombra bg-arena/60 px-4 py-3 text-xs leading-5 text-cafe/80">
          Tipo seleccionado:{" "}
          <span className="font-semibold">{formatKindLabel(kind)}</span>
          {kind === "prepared"
            ? ". Producto elaborado por el negocio, como empanadas. Puede tener precio por unidad, media docena y docena."
            : ". Producto de venta directa o combo. Usa precio unitario y requiere costo directo."}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="product-unit-price"
          className="text-sm font-semibold text-cafe"
        >
          Precio de venta por unidad
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Indicá cuánto se cobra una unidad individual del producto.
        </p>
        <input
          id="product-unit-price"
          type="number"
          step="0.01"
          min="0"
          {...register("unitPrice", {
            valueAsNumber: true,
            required: "Debes ingresar el precio unitario",
          })}
          placeholder="Ej: 1500"
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
        />
        <div className="rounded-2xl border border-sombra bg-arena/50 px-4 py-3 text-xs leading-5 text-cafe/75">
          {kind === "prepared"
            ? "En productos preparados, este valor representa el precio de una unidad individual, por ejemplo una empanada suelta."
            : "En productos de reventa o combo, este valor representa el precio final de venta por unidad."}
        </div>
        {errors.unitPrice ? (
          <p className="text-sm text-red-700">{errors.unitPrice.message}</p>
        ) : null}
      </div>

      {isPrepared ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="product-half-dozen-price"
              className="text-sm font-semibold text-cafe"
            >
              Precio de media docena
            </label>
            <p className="text-xs leading-5 text-cafe/70">
              Usá este campo si el producto se vende por 6 unidades con precio
              especial.
            </p>
            <input
              id="product-half-dozen-price"
              type="number"
              step="0.01"
              min="0"
              {...register("halfDozenPrice", { valueAsNumber: true })}
              placeholder="Ej: 8500"
              className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="product-dozen-price"
              className="text-sm font-semibold text-cafe"
            >
              Precio de docena
            </label>
            <p className="text-xs leading-5 text-cafe/70">
              Usá este campo si el producto se vende por 12 unidades con precio
              especial.
            </p>
            <input
              id="product-dozen-price"
              type="number"
              step="0.01"
              min="0"
              {...register("dozenPrice", { valueAsNumber: true })}
              placeholder="Ej: 15000"
              className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
            />
          </div>
        </div>
      ) : null}

      {requiresDirectCost ? (
        <div className="space-y-2">
          <label
            htmlFor="product-direct-cost"
            className="text-sm font-semibold text-cafe"
          >
            Costo directo del producto
          </label>
          <p className="text-xs leading-5 text-cafe/70">
            Indicá el costo directo unitario. Este valor es obligatorio para
            productos de reventa y combos.
          </p>
          <input
            id="product-direct-cost"
            type="number"
            step="0.01"
            min="0"
            {...register("directCost", {
              valueAsNumber: true,
              required: requiresDirectCost
                ? "Debes ingresar el costo directo"
                : false,
            })}
            placeholder="Ej: 900"
            className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
          />
          {errors.directCost ? (
            <p className="text-sm text-red-700">{errors.directCost.message}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={currentMutation.isPending}
          className="w-full rounded-2xl bg-bordo px-4 py-3 text-sm font-semibold text-crema transition hover:bg-cafe disabled:cursor-not-allowed disabled:opacity-60"
        >
          {currentMutation.isPending
            ? isEditing
              ? "Guardando cambios..."
              : "Creando producto..."
            : isEditing
              ? "Guardar cambios del producto"
              : "Registrar producto"}
        </button>

        {isEditing ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="w-full rounded-2xl border border-sombra bg-arena px-4 py-3 text-sm font-semibold text-cafe transition hover:bg-sombra/60"
          >
            Cancelar edición
          </button>
        ) : null}
      </div>

      {currentMutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {currentMutation.error instanceof Error
            ? currentMutation.error.message
            : isEditing
              ? "Ocurrió un error al editar el producto"
              : "Ocurrió un error al crear el producto"}
        </div>
      ) : null}

      {currentMutation.isSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {isEditing
            ? "Producto actualizado correctamente."
            : "Producto creado correctamente."}
        </div>
      ) : null}
    </form>
  );
}
