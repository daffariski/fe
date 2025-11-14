import React from "react";

import Layout from "../_layout";
import { TableSupervisionComponent } from "@/components/base.components";

export default function Index() {
  return (
    <>
      <div className="">Pelanggan</div>
      <TableSupervisionComponent
        title={"Pegawai"}
        fetchControl={{
          path: "customers",
        }}
        columnControl={[
          {
            selector: "name",
            label: "Nama",
            sortable: true,
            item: (item) => item.name,
          },
          {
            selector: "email",
            label: "Email",
            sortable: true,
            item: (item) => item.email,
          },
        ]}
        formControl={{
          forms: [
            {
              construction: {
                name: "name",
                label: "Nama",
                placeholder: "Ketikan nama pengguna...",
                required: true,
              },
            },
            {
              construction: {
                type: "email",
                name: "email",
                label: "Email",
                placeholder: "Ketikan Email pengguna...",
                required: true,
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
