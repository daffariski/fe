import React, { useState, useEffect } from "react";
import Layout from "../_layout";
import { TableSupervisionComponent } from "@/components/base.components";
import { authBearer } from '../../../utils/api.util';

export default function Index() {
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  // Fetch customer options once on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setCustomerLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/admin/users?filter=${encodeURIComponent(
            JSON.stringify([
              {
                type: "eq",
                column: "role",
                value: ["customer"],
              },
            ])
          )}&paginate=100`,
          {
            method: "GET",
            headers: {
              // Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              Authorization: authBearer() || "",
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const options =
            data?.data?.map((customer: any) => ({
              label: `${customer.name} (${customer.email})`,
              value: customer.id,
            })) || [];
          setCustomerOptions(options);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setCustomerLoading(false);
      }
    };

    fetchCustomers();
  }, []); // Empty dependency array - fetch only once

  return (
    <TableSupervisionComponent
      title={"Data Motor"}
      fetchControl={{
        path: "admin/vehicles",
      }}
      columnControl={[
        {
          selector: "owner_name",
          label: "Pemilik",
          sortable: true,
          width: "200px",
          item: (item) => item.user?.name || "-",
        },
        {
          selector: "plate_number",
          label: "Plat Nomor",
          sortable: true,
          width: "150px",
          item: (item) => item.plate_number,
        },
        {
          selector: "brand",
          label: "Merk",
          sortable: true,
          width: "150px",
          item: (item) => item.brand,
        },
        {
          selector: "year",
          label: "Tahun",
          sortable: true,
          width: "100px",
          item: (item) => item.year,
        },
        {
          selector: "series",
          label: "Seri & Warna",
          sortable: true,
          width: "300px",
          item: (item) => (
            <div>
              <p className="font-medium">{item.series}</p>
              <p className="text-sm text-gray-600">{item.color}</p>
            </div>
          ),
        },
      ]}
      formControl={{
        contentType: "application/json",
        customDefaultValue: (data) => {
          return {
            user_id: data.user_id || null,
            plate_number: data.plate_number,
            brand: data.brand,
            series: data.series,
            year: data.year,
            color: data.color,
            // _method: data.id ? "PUT" : "POST",
          };
        },
        forms: [
          {
            type: "select",
            construction: {
              name: "user_id",
              label: "Pemilik (Opsional)",
              placeholder: "Pilih pemilik kendaraan...",
              options: customerOptions,
              searchable: true,
              required: false,
              disabled: customerLoading,
            },
          },
          {
            construction: {
              name: "plate_number",
              label: "Nomor Plat",
              placeholder: "contoh: AE 5550 VW",
              required: true,
            },
          },
          {
            col: 6,
            construction: {
              name: "brand",
              label: "Merek",
              placeholder: "contoh: Honda",
              required: true,
            },
          },
          {
            col: 6,
            construction: {
              name: "series",
              label: "Seri Motor",
              placeholder: "contoh: Supra X 125",
              required: true,
            },
          },
          {
            col: 6,
            type: "number",
            construction: {
              name: "year",
              label: "Tahun",
              placeholder: "contoh: 2020",
              required: true,
              min: 1900,
              max: new Date().getFullYear() + 1,
            },
          },
          {
            col: 6,
            construction: {
              name: "color",
              label: "Warna",
              placeholder: "contoh: Merah",
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
