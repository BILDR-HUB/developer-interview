import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@client/components/ui/button";
import { Input } from "@client/components/ui/input";
import { Textarea } from "@client/components/ui/textarea";
import { Modal } from "@client/components/ui/modal";
import { Field, FieldGroup, FieldLabel } from "@client/components/ui/field";
import {
  useSaveProduct,
  useSaveVariant,
  type Product,
  type Variant,
} from "@client/hooks/use-data";
import {
  Panel,
  DataTable,
  ListToolbar,
  BackLink,
  InteractiveRow,
  FormFooter,
  number,
} from "./common";
function ProductForm({
  product,
  close,
}: {
  product?: Product;
  close: () => void;
}) {
  const save = useSaveProduct();
  return (
    <Modal
      open
      title={product ? "Termék szerkesztése" : "Új termék"}
      description="A termék alapadatai. A kiszereléseket külön adhatod hozzá."
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
              id: product?.id,
              name: String(d.get("name")),
              category: String(d.get("category")),
              description: String(d.get("description")),
            },
            { onSuccess: close },
          );
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="product-name">Terméknév</FieldLabel>
            <Input
              id="product-name"
              name="name"
              defaultValue={product?.name}
              required
              maxLength={100}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="category">Kategória</FieldLabel>
            <Input
              id="category"
              name="category"
              defaultValue={product?.category}
              required
              maxLength={60}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Leírás</FieldLabel>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description}
              maxLength={2000}
            />
          </Field>
        </FieldGroup>
        <FormFooter error={save.error} pending={save.isPending} close={close} />
      </form>
    </Modal>
  );
}
function VariantForm({
  productId,
  variant,
  close,
}: {
  productId: number;
  variant?: Variant;
  close: () => void;
}) {
  const save = useSaveVariant();
  return (
    <Modal
      open
      title={variant ? "Kiszerelés szerkesztése" : "Új kiszerelés"}
      description="Egyedi cikkszám és kiszerelés a kiválasztott termékhez."
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
              id: variant?.id,
              productId,
              sku: String(d.get("sku")),
              size: String(d.get("size")),
              unitPriceHuf: Number(d.get("price")),
            },
            { onSuccess: close },
          );
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="sku">Cikkszám</FieldLabel>
            <Input
              id="sku"
              name="sku"
              defaultValue={variant?.sku}
              required
              maxLength={40}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="size">Kiszerelés</FieldLabel>
            <Input
              id="size"
              name="size"
              defaultValue={variant?.size}
              placeholder="Például 100 ml"
              required
              maxLength={40}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="price">Listaár (Ft/db)</FieldLabel>
            <Input
              id="price"
              name="price"
              type="number"
              defaultValue={variant?.unitPriceHuf ?? 0}
              required
              min={0}
              max={1000000}
            />
          </Field>
        </FieldGroup>
        <FormFooter error={save.error} pending={save.isPending} close={close} />
      </form>
    </Modal>
  );
}
export function ProductsPage({
  products,
  variants,
  detailId,
}: {
  products: Product[];
  variants: Variant[];
  detailId?: number;
}) {
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState<Product | "new" | null>(null);
  const [editVariant, setEditVariant] = useState<Variant | "new" | null>(null);
  const product = products.find((p) => p.id === detailId);
  const filtered = products.filter((p) =>
    `${p.name} ${p.category}`
      .toLocaleLowerCase("hu")
      .includes(search.toLocaleLowerCase("hu")),
  );
  const own = variants.filter((v) => v.productId === detailId);
  return (
    <>
      {detailId && !product ? (
        <p className="empty">
          A termék nem található. <a href="#products">Vissza a listához</a>
        </p>
      ) : product ? (
        <>
          <div className="detail-heading">
            <BackLink href="products" label="Termékek" />
            <Button onClick={() => setEdit(product)}>
              <Pencil data-icon="inline-start" />
              Termék szerkesztése
            </Button>
          </div>
          <Panel title="Termékleírás">
            <div className="detail-copy">
              <p>{product.description || "Nincs leírás."}</p>
            </div>
          </Panel>
          <div className="mt-6">
            <Panel
              title="Kiszerelések"
              count={own.length}
              action={
                <Button onClick={() => setEditVariant("new")}>
                  <Plus data-icon="inline-start" />
                  Új kiszerelés
                </Button>
              }
            >
              <DataTable
                headings={[
                  "Cikkszám",
                  "Kiszerelés",
                  { label: "Listaár", numeric: true },
                ]}
                empty={!own.length}
                emptyMessage="Ehhez a termékhez még nincs kiszerelés."
              >
                {own.map((v) => (
                  <InteractiveRow key={v.id}>
                    <td>
                      <button
                        type="button"
                        data-row-primary
                        className="batch-link inline-action"
                        aria-label={`${v.sku} szerkesztése`}
                        onClick={() => setEditVariant(v)}
                      >
                        {v.sku}
                        <Pencil aria-hidden="true" />
                      </button>
                    </td>
                    <td>{v.size}</td>
                    <td className="number">
                      {number.format(v.unitPriceHuf)} Ft
                    </td>
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
            unit="termék"
            action={
              <Button onClick={() => setEdit("new")}>
                <Plus data-icon="inline-start" />
                Új termék
              </Button>
            }
          >
            <Input
              aria-label="Termékek keresése"
              placeholder="Terméknév vagy kategória…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </ListToolbar>
          <DataTable
            headings={[
              "Termék",
              "Kategória",
              { label: "Kiszerelések", numeric: true },
            ]}
            empty={!filtered.length}
          >
            {filtered.map((p) => (
              <InteractiveRow key={p.id}>
                <td>
                  <a
                    data-row-primary
                    className="batch-link"
                    href={`#products/${p.id}`}
                  >
                    {p.name}
                  </a>
                </td>
                <td>{p.category}</td>
                <td className="number">
                  {variants.filter((v) => v.productId === p.id).length}{" "}
                  kiszerelés
                </td>
              </InteractiveRow>
            ))}
          </DataTable>
        </Panel>
      )}
      {edit ? (
        <ProductForm
          product={edit === "new" ? undefined : edit}
          close={() => setEdit(null)}
        />
      ) : null}
      {editVariant && product ? (
        <VariantForm
          productId={product.id}
          variant={editVariant === "new" ? undefined : editVariant}
          close={() => setEditVariant(null)}
        />
      ) : null}
    </>
  );
}
