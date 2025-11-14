import React from "react";

import Layout from "../_layout";
import { TableSupervisionComponent } from "@/components/base.components";

export default function Index() {
  return (
    <TableSupervisionComponent
      title={"Pegawai"}
      fetchControl={{
        path: "users",
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
        payload:(values)=>{return{
          name:values.name,
          email:values.email,
          role:values.role,
        }},
        contentType:'application/json',
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
          {
            type:'select',
            construction: {
              name: "role",
              label: "Role",
              placeholder: "Pilih Role...",
              options:[{label:'Admin',value:'admin'},{label:'Teknisi',value:'mechanic'}],
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
