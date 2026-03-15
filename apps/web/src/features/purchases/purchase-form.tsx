import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";

import { useIngredients } from "../ingredients/use-ingredients";
import { useCreatePurchase } from "./use-purchases";

registerLocale("es", es);

type FormData = {
  date: string;
  type: "ingredient" | "operational" | "investment";
  ingredientId?: string;
  nameSnapshot: string;
  quantity?: number;
  unit?: "kg" | "g" | "l" | "ml" | "unit";
  unitPrice?: number;
  totalAmount: number;
  supplier?: string;
  notes?: string;
};

const TYPE_LABELS: Record<FormData["type"], string> = {
  ingredient: "Ingrediente / insumo",
  operational: "Gasto operativo",
  investment: "Inversión / capital",
};

const UNIT_LABELS: Record<string, string> = {
  kg: "Kilogramo (kg)",
  g: "Gramo (g)",
  l: "Litro (l)",
  ml: "Mililitro (ml)",
  unit: "Unidad (u)",
};

export function PurchaseForm() {
  const { data: ingredients } = useIngredients();
  const mutation = useCreatePurchase();

  const { register, handleSubmit, watch, reset, setValue, control } =
    useForm<FormData>({
      defaultValues: {
        date: new Date().toISOString().slice(0, 10),
        type: "ingredient",
        unit: "kg",
        totalAmount: 0,
        quantity: 1,
        unitPrice: 0,
      },
    });

  const type = watch("type");
  const ingredientId = watch("ingredientId");
  const quantity = watch("quantity");
  const unitPrice = watch("unitPrice");

  const isIngredient = type === "ingredient";

  const selectedIngredient = useMemo(
    () => ingredients?.find((ingredient) => ingredient.id === ingredientId),
    [ingredients, ingredientId],
  );

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      {
        date: data.date,
        type: data.type,
        ingredientId: isIngredient ? data.ingredientId : undefined,
        nameSnapshot:
          isIngredient && selectedIngredient
            ? selectedIngredient.name
            : data.nameSnapshot,
        quantity: isIngredient ? Number(data.quantity) : undefined,
        unit: isIngredient ? data.unit : undefined,
        unitPrice: isIngredient ? Number(data.unitPrice) : undefined,
        totalAmount: Number(data.totalAmount),
        supplier: data.supplier || undefined,
        notes: data.notes || undefined,
      },
      {
        onSuccess: () => {
          reset({
            date: new Date().toISOString().slice(0, 10),
            type: "ingredient",
            unit: "kg",
            totalAmount: 0,
            quantity: 1,
            unitPrice: 0,
          });
        },
      },
    );
  };

  const handleIngredientChange = (value: string) => {
    setValue("ingredientId", value);

    const ingredient = ingredients?.find((item) => item.id === value);

    if (ingredient) {
      setValue("nameSnapshot", ingredient.name);
      setValue("unit", ingredient.unit);
      setValue("unitPrice", ingredient.currentCost);
      const nextQuantity = quantity || 1;
      setValue("totalAmount", nextQuantity * ingredient.currentCost);
    }
  };

  const handleQuantityOrPriceChange = (
    nextQuantity?: number,
    nextUnitPrice?: number,
  ) => {
    const qty = nextQuantity ?? quantity ?? 0;
    const price = nextUnitPrice ?? unitPrice ?? 0;
    setValue("totalAmount", qty * price);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-sombra bg-crema p-5 shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cafe/65">
          Nueva compra
        </p>
        <h2 className="mt-2 text-xl font-bold text-bordo">
          Registrar compra o gasto
        </h2>
        <p className="mt-2 text-sm leading-6 text-cafe/80">
          Registrá una compra de ingrediente, un gasto operativo o una
          inversión. Todos los movimientos quedan asentados en el libro de
          cuentas.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-cafe">
          Fecha de la compra
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Fecha en la que realizaste la compra o en la que se efectuó el gasto.
        </p>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              locale="es"
              dateFormat="dd/MM/yyyy"
              selected={field.value ? new Date(field.value) : null}
              onChange={(date: Date | null) =>
                field.onChange(date ? date.toISOString().slice(0, 10) : "")
              }
              className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
              wrapperClassName="w-full"
              placeholderText="dd/mm/aaaa"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="purchase-type" className="text-sm font-semibold text-cafe">
          Tipo de compra o gasto
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Elegí si es un insumo de producción, un gasto del negocio (luz, gas,
          etc.) o una inversión (equipamiento, herramientas).
        </p>
        <select
          id="purchase-type"
          {...register("type")}
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
        >
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {isIngredient ? (
        <div className="space-y-2">
          <label htmlFor="purchase-ingredient" className="text-sm font-semibold text-cafe">
            Ingrediente
          </label>
          <p className="text-xs leading-5 text-cafe/70">
            Seleccioná el ingrediente que compraste. Al elegirlo, se completarán
            automáticamente la unidad y el precio de referencia.
          </p>
          <select
            id="purchase-ingredient"
            value={ingredientId || ""}
            onChange={(e) => handleIngredientChange(e.target.value)}
            className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
          >
            <option value="">Seleccionar ingrediente</option>
            {ingredients?.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="purchase-name" className="text-sm font-semibold text-cafe">
            Descripción del gasto
          </label>
          <p className="text-xs leading-5 text-cafe/70">
            Describí el gasto o inversión brevemente. Este texto quedará
            registrado en el libro de cuentas.
          </p>
          <input
            id="purchase-name"
            {...register("nameSnapshot")}
            placeholder="Ej: Factura de gas de marzo"
            className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition placeholder:text-cafe/45 focus:border-bordo"
          />
        </div>
      )}

      {isIngredient ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="purchase-quantity" className="text-sm font-semibold text-cafe">
              Cantidad
            </label>
            <p className="text-xs leading-5 text-cafe/70">
              Cantidad comprada en la unidad seleccionada.
            </p>
            <input
              id="purchase-quantity"
              type="number"
              step="0.01"
              min="0"
              {...register("quantity", { valueAsNumber: true })}
              onChange={(e) => {
                const value = Number(e.target.value);
                setValue("quantity", value);
                handleQuantityOrPriceChange(value, undefined);
              }}
              placeholder="Ej: 25"
              className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="purchase-unit" className="text-sm font-semibold text-cafe">
              Unidad de medida
            </label>
            <p className="text-xs leading-5 text-cafe/70">
              Unidad en que se mide la cantidad comprada.
            </p>
            <select
              id="purchase-unit"
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
            <label htmlFor="purchase-unit-price" className="text-sm font-semibold text-cafe">
              Precio por unidad
            </label>
            <p className="text-xs leading-5 text-cafe/70">
              Precio pagado por cada unidad. El total se calcula automáticamente.
            </p>
            <input
              id="purchase-unit-price"
              type="number"
              step="0.01"
              min="0"
              {...register("unitPrice", { valueAsNumber: true })}
              onChange={(e) => {
                const value = Number(e.target.value);
                setValue("unitPrice", value);
                handleQuantityOrPriceChange(undefined, value);
              }}
              placeholder="Ej: 850"
              className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="purchase-total" className="text-sm font-semibold text-cafe">
          Total pagado
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          {isIngredient
            ? "Se calcula automáticamente a partir de cantidad × precio unitario. Podés ajustarlo si el monto final difiere."
            : "Monto total de este gasto o inversión."}
        </p>
        <input
          id="purchase-total"
          type="number"
          step="0.01"
          min="0"
          {...register("totalAmount", { valueAsNumber: true })}
          placeholder="Ej: 21250"
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="purchase-supplier" className="text-sm font-semibold text-cafe">
          Proveedor <span className="font-normal text-cafe/50">(opcional)</span>
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Nombre del proveedor o comercio donde realizaste la compra.
        </p>
        <input
          id="purchase-supplier"
          {...register("supplier")}
          placeholder="Ej: Distribuidora El Trigal"
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition placeholder:text-cafe/45 focus:border-bordo"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="purchase-notes" className="text-sm font-semibold text-cafe">
          Notas <span className="font-normal text-cafe/50">(opcional)</span>
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Cualquier observación adicional sobre esta compra o gasto.
        </p>
        <textarea
          id="purchase-notes"
          {...register("notes")}
          rows={2}
          placeholder="Ej: Precio por flete incluido"
          className="w-full resize-none rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition placeholder:text-cafe/45 focus:border-bordo"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-bordo px-4 py-3 text-sm font-semibold text-crema transition hover:bg-cafe disabled:cursor-not-allowed disabled:opacity-60"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Guardando compra..." : "Guardar compra"}
      </button>

      {mutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Ocurrió un error al guardar la compra"}
        </div>
      ) : null}

      {mutation.isSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Compra registrada correctamente.
        </div>
      ) : null}
    </form>
  );
}
