import React from "react";


import Layout from "../_layout";
import { TableSupervisionComponent } from "@/components/base.components";
import { conversion } from "@/utils";
export default function Index() {
  return (
    <TableSupervisionComponent
      title={"Suku Cadang"}
      fetchControl={{
        path: "products",
      }}
      columnControl={[
        {
          selector: "name",
          label: "Nama",
          sortable: true,
          width:'400px',
          item: (item) => item.name,
        },
        {
          selector: "stock",
          label: "Stock",
          sortable: true,
          width: "100px",
          item: (item) => item.stock,
        },
        {
          selector: "price",
          label: "Harga",
          sortable: true,
          item: (item) => <p>
            {conversion.currency(item?.price)}
            /{item.uom||'-'}
          </p> 
        },
        {
          selector: "series",
          label: "Deskripsi",
          
          item: (item) => <p className="text-sm w-full text-ellipsis">{item.series}</p>,
        },
      ]}
      formControl={{ 
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
