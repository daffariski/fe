import React from "react";

import Layout from "../_layout";
import { TableSupervisionComponent } from "@/components/base.components";

export default function Index() {
  return (
    <TableSupervisionComponent
      title={"Pelanggan"}
      fetchControl={{
        path: "admin/users",
        params: {
          filter: [{
            type: 'eq',
            column: 'role',
            value: ['customer'],
          }]
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
          selector: "phone",
          label: "No. Telp",
          sortable: true,
          item: (item) => item.customer.phone,
        },
        {
          selector: "address",
          label: "Alamat",
          sortable: true,
          item: (item) => item.customer.address,
        },
      ]}
      formControl={{
        customDefaultValue: (data) => {
          return {
            name: data.name,
            email: data.email,
            phone: data.customer?.phone || '',
            address: data.customer?.address || '',
          }
        },
        payload: (values) => {
          return {
            name: values.name,
            email: values.email,
            phone: values.phone,
            address: values.address,
            role: 'customer',
            password: values.password,
          }
        },
        contentType: 'application/json',
        forms: [
          {
            construction: {
              name: "name",
              label: "Nama",
              placeholder: "Nama pelanggan...",
              required: true,
            },
          },
          {
            construction: {
              type: "email",
              name: "email",
              label: "Email",
              placeholder: "Email pelanggan...",
              required: true,
            },
          },
          {
            construction: {
              name: "phone",
              label: "No. Telp",
              placeholder: "No. Telp pelanggan...",
              required: true,
            },
          },
          {
            construction: {
              type: "textarea",
              name: "address",
              label: "Alamat",
              placeholder: "Alamat pelanggan...",
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
            visibility: "create",
          },
          {
            construction: {
              type: "password",
              name: "password",
              label: "Password (opsional, isi untuk mengubah password lama)",
              placeholder: "Password baru...",
              required: false,
            },
            visibility: "update",
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
