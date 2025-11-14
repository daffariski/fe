import React from "react";


import Layout from "../_layout";
import { TableSupervisionComponent } from "@/components/base.components";
export default function Index() {
  return (
    <TableSupervisionComponent
      title={"Data Motor"}
      fetchControl={{
        path: "vehicles",
      }}
      columnControl={[
        {
          selector: "plate_number",
          label: "Plat Nomor",
          sortable: true,
          width: "150px",
          item: (item) => item.plate_number,
        },
        {
          selector: "series",
          label: "Motor",
          sortable: true,
          width: "300px",
          item: (item) => (
            <div>
              <strong>{item.brand + "-" + item.series}</strong>
              <p>{item.year + "-" + item.color}</p>
            </div>
          ),
        },
      ]}
      formControl={{
        // contentType: "application/json",
        payload: (values) => {
          const price = values.price;
          values["price"] = parseInt(price.replace(/[^\d]/g, ""));
          return values;
        },
        forms: [
          {
            construction: {
              name: "name",
              label: "Nama",
              placeholder: "Ketikan nama suku cadang...",
              required: true,
            },
          },
          {
            type: "currency",
            construction: {
              name: "price",
              label: "Harga",
              placeholder: "Ketikan nama suku cadang...",
              required: true,
            },
          },
          {
            type: "number",
            construction: {
              name: "stock",
              label: "Stok",
              placeholder: "jumlah suku cadang...",
              required: true,
            },
          },
          {
            type: "select",
            construction: {
              name: "uom",
              label: "Satuan",
              placeholder: "Satuan suku cadang...",
              required: true,
              options: [
                { label: "pcs", value: "pcs" },
                { label: "set", value: "set" },
                { label: "unit", value: "unit" },
              ],
            },
          },
          {
            construction: {
              name: "series",
              label: "Seris",
              placeholder: "cont. Supra X 125",
              required: true,
            },
          },
        ],
      }}
    />
  );
}

Index.getLayout = function getLayout(
  page: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
) {
  return <Layout>{page}</Layout>;
};
