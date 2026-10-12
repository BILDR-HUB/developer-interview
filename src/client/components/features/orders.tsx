import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@client/components/ui/button";
import { Input } from "@client/components/ui/input";
import { Textarea } from "@client/components/ui/textarea";
import { Modal } from "@client/components/ui/modal";
import { Field, FieldGroup, FieldLabel } from "@client/components/ui/field";
import {
  useCreateOrder,
  useOrderStatus,
  type Order,
  type Batch,
  type Customer,
  type Variant,
} from "@client/hooks/use-data";
import { orderStatusLabels, todayInBudapest } from "@shared/schemas/operations";
import {
  Panel,
  DataTable,
  ListToolbar,
  BackLink,
  InteractiveRow,
  FormFooter,
  OrderStatusBadge,
  BatchStatusBadge,
  DateLabel,
  isLate,
  go,
  number,
} from "./common";
function OrderForm({
  customers,
  variants,
  close,
}: {
  customers: Customer[];
  variants: Variant[];
  close: () => void;
}) {
  const save = useCreateOrder();
  return (
    <Modal
      open
      title="Új vevői rendelés"
      description="Egy rendelés egy kiszerelést tartalmaz. Mentés után visszaigazolható."
      onOpenChange={(v) => {
        if (!v) close();
      }}
    >
      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          save.mutate(
            {
              customerId: Number(d.get("customerId")),
              variantId: Number(d.get("variantId")),
              quantity: Number(d.get("quantity")),
              dueDate: String(d.get("date")),
              notes: String(d.get("notes")),
            },
            { onSuccess: close },
          );
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="customer">Ügyfél</FieldLabel>
            <select id="customer" name="customerId" required defaultValue="">
              <option value="" disabled>
                Válassz ügyfelet
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="variant">Termék és kiszerelés</FieldLabel>
            <select id="variant" name="variantId" required defaultValue="">
              <option value="" disabled>
                Válassz kiszerelést
              </option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.productName} · {v.size} · {v.sku}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="quantity">Mennyiség (db)</FieldLabel>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              max={1000000}
              required
              defaultValue={500}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="date">Szállítási határidő</FieldLabel>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={todayInBudapest()}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="notes">Megjegyzés</FieldLabel>
            <Textarea id="notes" name="notes" maxLength={2000} />
          </Field>
        </FieldGroup>
        <FormFooter
          error={save.error}
          pending={save.isPending}
          close={close}
          label="Rendelés létrehozása"
        />
      </form>
    </Modal>
  );
}
export function OrdersPage({
  orders,
  batches,
  customers,
  variants,
  detailId,
}: {
  orders: Order[];
  batches: Batch[];
  customers: Customer[];
  variants: Variant[];
  detailId?: number;
}) {
  const [create, setCreate] = useState(false),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("");
  const change = useOrderStatus();
  const order = orders.find((o) => o.id === detailId);
  const filtered = orders.filter(
    (o) =>
      (!status || o.status === status) &&
      `${o.orderCode} ${o.customerName} ${o.productName}`
        .toLocaleLowerCase("hu")
        .includes(search.toLocaleLowerCase("hu")),
  );
  const linked = batches.filter((b) => b.orderId === detailId);
  const closed = linked
    .filter((b) => b.status === "closed")
    .reduce((sum, b) => sum + b.quantity, 0);
  return (
    <>
      {detailId && !order ? (
        <p className="empty">
          A rendelés nem található. <a href="#orders">Vissza a listához</a>
        </p>
      ) : order ? (
        <>
          <div className="detail-heading">
            <BackLink href="orders" label="Rendelések" />
            <OrderStatusBadge status={order.status} />
          </div>
          <Panel title="Rendelés adatai">
            <div className="detail-copy">
              <dl className="detail-grid">
                <div>
                  <dt>Termék és kiszerelés</dt>
                  <dd>
                    {order.productName} · {order.size}
                  </dd>
                </div>
                <div>
                  <dt>Szállítási határidő</dt>
                  <dd>
                    <DateLabel
                      date={order.dueDate}
                      late={isLate(order.dueDate, order.status)}
                    />
                  </dd>
                </div>
                <div>
                  <dt>Rendelt / legyártott</dt>
                  <dd>
                    {number.format(order.quantity)} / {number.format(closed)} db
                  </dd>
                </div>
                <div>
                  <dt>Cikkszám</dt>
                  <dd>{order.sku}</dd>
                </div>
              </dl>
              <p>{order.notes || "Nincs megjegyzés."}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {order.status === "draft" ? (
                  <Button
                    disabled={change.isPending}
                    onClick={() =>
                      change.mutate({ id: order.id, status: "confirmed" })
                    }
                  >
                    Rendelés visszaigazolása
                  </Button>
                ) : null}
                {order.status === "confirmed" ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => go(`batches/new/${order.id}`)}
                    >
                      Gyártás indítása
                    </Button>
                    <Button
                      disabled={change.isPending || closed < order.quantity}
                      onClick={() =>
                        change.mutate({ id: order.id, status: "fulfilled" })
                      }
                    >
                      Teljesítés lezárása
                    </Button>
                  </>
                ) : null}
                {["draft", "confirmed"].includes(order.status) &&
                linked.length === 0 ? (
                  <Button
                    variant="outline"
                    disabled={change.isPending}
                    onClick={() =>
                      change.mutate({ id: order.id, status: "cancelled" })
                    }
                  >
                    Rendelés lemondása
                  </Button>
                ) : null}
              </div>
              {order.status === "confirmed" && closed < order.quantity ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  A teljesítéshez még {number.format(order.quantity - closed)}{" "}
                  db lezárt gyártás szükséges.
                </p>
              ) : null}
              {change.error ? (
                <p role="alert" className="form-error">
                  {change.error.message}
                </p>
              ) : null}
            </div>
          </Panel>
          <div className="mt-6">
            <Panel title="Kapcsolódó gyártási tételek" count={linked.length}>
              <DataTable
                headings={[
                  "Gyártási tétel",
                  "Felelős",
                  "Állapot",
                  { label: "Mennyiség", numeric: true },
                ]}
                empty={!linked.length}
                emptyMessage="Ehhez a rendeléshez még nem indult gyártás."
              >
                {linked.map((b) => (
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
                    <td>{b.ownerName}</td>
                    <td>
                      <BatchStatusBadge status={b.status} />
                    </td>
                    <td className="number">{number.format(b.quantity)} db</td>
                  </InteractiveRow>
                ))}
              </DataTable>
            </Panel>
          </div>
        </>
      ) : (
        <Panel>
          <ListToolbar
            count={filtered.length}
            unit="rendelés"
            action={
              <Button onClick={() => setCreate(true)}>
                <Plus data-icon="inline-start" />
                Új rendelés
              </Button>
            }
          >
            <Input
              aria-label="Rendelések keresése"
              placeholder="Rendelés, ügyfél vagy termék…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Rendelés állapota"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Minden állapot</option>
              {Object.entries(orderStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </ListToolbar>
          <DataTable
            headings={[
              "Rendelés",
              "Ügyfél",
              "Termék",
              { label: "Mennyiség", numeric: true },
              "Határidő",
              "Állapot",
            ]}
            empty={!filtered.length}
          >
            {filtered.map((o) => (
              <InteractiveRow key={o.id}>
                <td>
                  <a
                    data-row-primary
                    className="batch-link"
                    href={`#orders/${o.id}`}
                  >
                    {o.orderCode}
                  </a>
                </td>
                <td>{o.customerName}</td>
                <td>
                  {o.productName}
                  <span className="cell-secondary">{o.size}</span>
                </td>
                <td className="number">{number.format(o.quantity)} db</td>
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
      )}
      {create ? (
        <OrderForm
          customers={customers}
          variants={variants}
          close={() => setCreate(false)}
        />
      ) : null}
    </>
  );
}
