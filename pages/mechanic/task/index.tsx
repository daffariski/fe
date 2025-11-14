import { TableSupervisionComponent } from "@/components";
import { conversion } from "@/utils";
import React from "react";
import Layout from "../_layout";

export default function Index() {
  return (
    <>
      <TableSupervisionComponent
        title={"Tugas Saya"}
        fetchControl={{
          path: "mechanic/assignments",
        }}
        columnControl={[
          {
            selector: "plate_number",
            label: "Nomor Plat",
            sortable: true,
            width: "300px",
            item: (data) => (
              <>
                <p className="w-full border-b mb-2 font-bold text-lg">
                  {data.vehicle.plate_number}
                </p>
                <p className="w-full text-sm">{data.vehicle.series || "-"}</p>
                <p className="w-full text-sm">
                  warna: {data.vehicle.color || "-"}
                </p>
              </>
            ),
          },
          {
            selector: "description",
            label: "Deskripsi",
            sortable: true,
            width: "400px",
            item: (data) => (
              <pre className="border max-h-20 overflow-y-scroll scroll p-2 rounded whitespace-pre-wrap">
                {data?.description || "-"}
              </pre>
            ),
          },
          {
            selector: "created_at",
            label: "Tanggal",
            sortable: true,
            item: (data) => conversion.date(data?.created_at) || "-",
          },
        ]}
        formControl={{
          customDefaultValue: {
            type: "general",
          },

          forms: [
            {
              type: "radio",
              construction: {
                name: "type",
                label: "",
                options: [
                  { label: "Umum", value: "general" },
                  { label: "Pelanggan", value: "on-account" },
                ],
                required: true,
              },
            },
            {
              type: "text",
              construction: {
                name: "description",
                label: "Deskripsi",
                placeholder: "Masukkan Deskripsi",
                required: true,
              },
            },
            {
              type: "select",
              construction: {
                name: "status",
                label: "Status",
                placeholder: "Pilih Status",
                required: true,
                options: [
                  { label: "Menunggu", value: "waiting" },
                  { label: "Dalam Proses", value: "process" },
                  { label: "Selesai", value: "done" },
                  { label: "Batal", value: "cancelled" },
                ],
              },
            },

            {
              type: "cluster",
              construction: {
                name: "sukucadang",
                label: "Sukucadang",
                forms: [
                  {
                    type: "select",
                    construction: {
                      name: "product_id",
                      label: "",
                      placeholder:'pilih Sukucadang',
                      options: [
                        { label: "Menunggu", value: "waiting" },
                        { label: "Dalam Proses", value: "process" },
                        { label: "Selesai", value: "done" },
                        { label: "Batal", value: "cancelled" },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        }}
      />
    </>
  );
}

Index.getLayout = function getLayout(
  page: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
) {
  return <Layout>{page}</Layout>;
};