import React from "react";

import Layout from "../_layout";
import { TableSupervisionComponent } from "@/components/base.components";

export default function Index() {
  return (
    <TableSupervisionComponent
      title={"Pegawai"}
      fetchControl={{
        path: "admin/users",
        params: {
          filter: [{
            type: 'ne',
            column: 'role',
            value: 'customer',
          }],
          sortBy: 'role',
          sortDirection: 'asc',
        }
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
        {
          selector: "role",
          label: "Role",
          sortable: true,
          item: (item) => item.role,
        },
      ]}
      formControl={{
        payload: (values) => {
          return {
            name: values.name,
            email: values.email,
            role: values.role,
            password: values.password,
          }
        },
        contentType: 'application/json',
        forms: [
          {
            construction: {
              name: "name",
              label: "Nama",
              placeholder: "Nama pegawai...",
              required: true,
            },
          },
          {
            construction: {
              type: "email",
              name: "email",
              label: "Email",
              placeholder: "Email pegawai...",
              required: true,
            },
          },
          {
            construction: {
              type: "password",
              name: "password",
              label: "Password",
              placeholder: "Password baru...",
              required: true,
            },
            visibility: "create", // required only when creating new employee
          },
          {
            construction: {
              type: "password",
              name: "password",
              label: "Password (opsional, isi untuk mengubah password lama)",
              placeholder: "Password baru...",
              required: false,
            },
            visibility: "update", // optional when updating
          },
          {
            type: 'select',
            construction: {
              name: "role",
              label: "Role",
              placeholder: "Pilih Role...",
              options: [{ label: 'Admin', value: 'admin' }, { label: 'Teknisi', value: 'mechanic' }],
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
