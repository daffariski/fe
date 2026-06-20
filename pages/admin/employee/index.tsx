import React, { useState } from "react";

import Layout from "../_layout";
import { TableSupervisionComponent } from "@/components/base.components";
import { cn, api } from "@/utils";

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "relative inline-flex items-center cursor-pointer",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div
        className={cn(
          "w-9 h-5 rounded-full peer dark:bg-gray-300",
          "peer-checked:after:translate-x-full peer-checked:after:border-white",
          "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
          "after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4",
          "after:transition-all dark:border-gray-600 peer-checked:bg-primary",
          disabled && "animate-pulse"
        )}
      ></div>
      <span className="ml-2 text-sm text-foreground select-none">
        {checked ? "Aktif" : "Tidak Aktif"}
      </span>
    </label>
  );
}

export default function Index() {
  const [refresh, setRefresh] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    setLoadingId(id);
    try {
      const response = await api({
        path: `admin/users/${id}`,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        payload: {
          is_active: !currentStatus,
        },
      });
      if (response && response.status === 200) {
        setRefresh((prev) => !prev);
      } else {
        console.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <TableSupervisionComponent
      title={"Pegawai"}
      setToRefresh={refresh}
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
        {
          selector: "is_active",
          label: "Status",
          sortable: true,
          item: (item) => (
            <ToggleSwitch
              checked={!!item.is_active}
              disabled={loadingId === item.id}
              onChange={() => handleToggleActive(item.id, !!item.is_active)}
            />
          ),
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
