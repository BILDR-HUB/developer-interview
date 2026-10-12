import {
  Factory,
  ShoppingBag,
  Clock3,
  Package,
  ArrowRight,
} from "lucide-react";
import { batchStatusSchema, batchStatusLabels } from "@shared/schemas/batch";
import type { Order, Batch, Product, Variant } from "@client/hooks/use-data";
import {
  Panel,
  DataTable,
  InteractiveRow,
  OrderStatusBadge,
  BatchStatusBadge,
  DateLabel,
  isLate,
  number,
} from "./common";
export function OverviewPage({
  orders,
  batches,
  products,
  variants,
}: {
  orders: Order[];
  batches: Batch[];
  products: Product[];
  variants: Variant[];
}) {
  const pending = orders.filter((o) => o.status === "confirmed");
  const upcoming = [...pending]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);
  const active = batches.filter(
    (b) => !["planned", "closed"].includes(b.status),
  );
  const metrics = [
    {
      label: "Nyitott rendelések",
      value: pending.length,
      unit: "rendelés",
      icon: ShoppingBag,
      color: "blue",
    },
    {
      label: "Gyártásban",
      value: active.length,
      unit: "tétel",
      icon: Factory,
      color: "orange",
    },
    {
      label: "Lejárt rendelések",
      value: pending.filter((o) => isLate(o.dueDate, o.status)).length,
      unit: "rendelés",
      icon: Clock3,
      color: "red",
    },
    {
      label: "Termékkatalógus",
      value: products.length,
      unit: `termék / ${variants.length} kiszerelés`,
      icon: Package,
      color: "green",
    },
  ];
  return (
    <>
      <div className="stats">
        {metrics.map((m) => (
          <div className="stat" key={m.label}>
            <span className={`stat-icon ${m.color}`}>
              <m.icon size={21} />
            </span>
            <div>
              <span>{m.label}</span>
              <strong>
                {m.value}
                <small>{m.unit}</small>
              </strong>
            </div>
          </div>
        ))}
      </div>
      <div className="overview-grid">
        <Panel
          title="Közelgő szállítások"
          count={pending.length}
          action={
            <a className="section-link" href="#orders">
              Összes rendelés
              <ArrowRight aria-hidden="true" />
            </a>
          }
        >
          <DataTable
            headings={["Rendelés / ügyfél", "Határidő", "Állapot"]}
            empty={!upcoming.length}
            emptyMessage="Nincs visszaigazolt, szállításra váró rendelés."
          >
            {upcoming.map((o) => (
              <InteractiveRow key={o.id}>
                <td>
                  <a
                    data-row-primary
                    className="batch-link"
                    href={`#orders/${o.id}`}
                  >
                    {o.orderCode}
                  </a>
                  <span className="cell-secondary">{o.customerName}</span>
                </td>
                <td>
                  <DateLabel
                    date={o.dueDate}
                    late={isLate(o.dueDate, o.status)}
                  />
                </td>
                <td>
                  <OrderStatusBadge status={o.status} />
                </td>
              </InteractiveRow>
            ))}
          </DataTable>
        </Panel>
        <Panel
          title="Gyártási áttekintő"
          action={
            <a className="section-link" href="#batches">
              Gyártások
              <ArrowRight aria-hidden="true" />
            </a>
          }
        >
          <ol className="production-pipeline" aria-label="Gyártási folyamat">
            {batchStatusSchema.options.map((status) => {
              const count = batches.filter(
                (batch) => batch.status === status,
              ).length;
              return (
                <li key={status} className={`pipeline-step pipeline-${status}`}>
                  <a
                    href={`#batches?status=${status}`}
                    aria-label={`${batchStatusLabels[status]}: ${count} tétel`}
                  >
                    <span className="pipeline-dot" aria-hidden="true" />
                    <strong>{count}</strong>
                    <span>
                      {status === "qc"
                        ? "Minőség\u00adellenőrzés"
                        : batchStatusLabels[status]}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
          <div className="production-next">
            <h3>Következő gyártások</h3>
            <ul>
              {[...batches]
                .filter((batch) => batch.status === "planned")
                .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
                .slice(0, 3)
                .map((batch) => (
                  <li key={batch.id}>
                    <a href={`#batches/${batch.id}`}>
                      <span className="next-date">
                        {batch.plannedDate.slice(5).replace("-", ". ")}
                      </span>
                      <span className="next-product">
                        <strong>{batch.productName}</strong>
                        <span>
                          {batch.batchCode} · {batch.size}
                        </span>
                      </span>
                      <span className="next-quantity">
                        {number.format(batch.quantity)} db
                      </span>
                      <ArrowRight aria-hidden="true" />
                    </a>
                  </li>
                ))}
            </ul>
            {!batches.some((batch) => batch.status === "planned") ? (
              <p className="pipeline-empty">Nincs tervezett gyártás.</p>
            ) : null}
          </div>
          <p className="panel-footnote">
            <strong>
              {number.format(
                batches.reduce((sum, batch) => sum + batch.quantity, 0),
              )}{" "}
              db
            </strong>
            <span>összesen · {batches.length} gyártási tétel</span>
          </p>
        </Panel>
      </div>
      <div className="mt-6">
        <Panel
          title="Folyamatban lévő gyártások"
          count={active.length}
          action={
            <a className="section-link" href="#batches">
              Összes tétel
              <ArrowRight aria-hidden="true" />
            </a>
          }
        >
          <DataTable
            headings={[
              "Tétel",
              "Termék",
              "Felelős",
              "Állapot",
              "Kapcsolódó rendelés",
            ]}
            empty={!active.length}
            emptyMessage="Jelenleg nincs folyamatban lévő gyártás."
          >
            {active.slice(0, 6).map((b) => (
              <InteractiveRow key={b.id}>
                <td>
                  <a
                    data-row-primary
                    className="batch-link"
                    href={`#batches/${b.id}`}
                  >
                    {b.batchCode}
                  </a>
                </td>
                <td>
                  {b.productName}
                  <span className="cell-secondary">
                    {b.size} · {number.format(b.quantity)} db
                  </span>
                </td>
                <td>{b.ownerName}</td>
                <td>
                  <BatchStatusBadge status={b.status} />
                </td>
                <td>
                  {b.orderId ? (
                    <a className="batch-link" href={`#orders/${b.orderId}`}>
                      {b.orderCode}
                    </a>
                  ) : (
                    "Saját készletre"
                  )}
                </td>
              </InteractiveRow>
            ))}
          </DataTable>
        </Panel>
      </div>
    </>
  );
}
