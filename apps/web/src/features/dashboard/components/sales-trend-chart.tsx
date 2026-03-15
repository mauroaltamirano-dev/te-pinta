import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesTrendItem } from "../../../services/api/dashboard.api";

type Props = {
  data: SalesTrendItem[];
};

export function SalesTrendChart({ data }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
      <div className="border-b border-sombra px-5 py-4">
        <h3 className="text-lg font-bold text-bordo">Ventas por día</h3>
        <p className="mt-1 text-sm text-cafe/75">
          Evolución de ventas del período seleccionado.
        </p>
      </div>

      <div className="h-[320px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cdbba7" />
            <XAxis dataKey="date" stroke="#4d3227" tick={{ fontSize: 12 }} />
            <YAxis stroke="#4d3227" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#e9dcc9",
                border: "1px solid #cdbba7",
                borderRadius: 16,
                color: "#4d3227",
              }}
            />
            <Line
              type="monotone"
              dataKey="grossSales"
              stroke="#702a1d"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
