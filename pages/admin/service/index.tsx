import React, { useMemo, useState } from "react";
import Layout from "../_layout";
import { useAuthContext } from "@/contexts";
import {
  ButtonComponent,
  FormSupervisionComponent,
  ModalComponent,
  TableSupervisionComponent,
} from "@/components/base.components";
import { conversion, useGetApi } from "@/utils";
import { faSave, faUserGear, faXmark } from "@fortawesome/free-solid-svg-icons";
import { title } from "process";

export default function Index() {
  const { user } = useAuthContext();
  const [modal, setModal] = useState({ title: "", id: "" });
  const [refresh, setRefresh] = useState(false);



  const { loading, code, data, reset } = useGetApi({
    path: "options/vehicle",
    method: "GET",
  });
  const {
    loading: mechanicLoading,
    code: mechanicCode,
    data: mechanicData,
    reset: mecanicReset,
  } = useGetApi({
    path: "options/mechanic",
    method: "GET",
  });

  console.log(modal);
  return (
    <>
      <TableSupervisionComponent
        title={"Servis"}
        setToRefresh={refresh}
        fetchControl={{
          path: "services",
        }}
        columnControl={[
          {
            selector: "queue_number",
            label: "ID Antrian",
            sortable: true,
            item: (data) => data?.queue?.queue_number || "-",
          },
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
            selector: "mechanic.user",
            label: "Teknisi",
            sortable: true,
            item: (data) => data?.mechanic?.user?.name || "-",
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
            admin_id: user?.id,
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
              onHide: (values) => {
                return (
                  values.find((val) => val.name == "type")?.value == "general"
                );
              },
              type: "select",
              construction: {
                name: "vehicle_id",
                label: "Motor",
                options: data,
                searchable: true,
                placeholder: "cari berdasrkan plat",
                required: true,
              },
            },
            {
              construction: {
                name: "customer_name",
                label: "Atas Nama",
                placeholder: "cnt. Cahyo Gunawan",
                required: true,
              },
            },
            {
              onHide: (values) => {
                return (
                  values.find((val) => val.name == "type")?.value != "general"
                );
              },
              col: 6,
              construction: {
                name: "vehicle_brand",
                label: "Merek",
                placeholder: "cnt. Honda",
                required: true,
              },
            },
            {
              onHide: (values) => {
                return (
                  values.find((val) => val.name == "type")?.value != "general"
                );
              },
              col: 6,
              construction: {
                name: "vehicle_series",
                label: "Series",
                placeholder: "cnt. Supra X 125",
                required: true,
              },
            },
            {
              onHide: (values) => {
                return (
                  values.find((val) => val.name == "type")?.value != "general"
                );
              },
              construction: {
                name: "vehicle_plate_number",
                label: "Plat Nomor",
                placeholder: "cnt. AE 5550 VW",
                required: true,
              },
            },

            {
              onHide: (values) => {
                return (
                  values.find((val) => val.name == "type")?.value != "general"
                );
              },
              type: "number",
              construction: {
                name: "vehicle_year",
                label: "Tahun",
                placeholder: "cnt. Tahun",
                required: true,
              },
            },
            {
              onHide: (values) => {
                return (
                  values.find((val) => val.name == "type")?.value != "general"
                );
              },
              construction: {
                name: "vehicle_color",
                label: "Warna",
                placeholder: "Masukkan Warna",
                required: true,
              },
            },
          ],
        }}
        actionControl={[
          (row) => {
            return (
              <>
                <ButtonComponent
                  label="Pilih Terknisi"
                  variant="outline"
                  paint="secondary"
                  onClick={() => setModal({ title: "approve", id: row?.id })}
                  icon={faUserGear}
                  size="xs"
                  rounded
                  disabled={mechanicLoading}
                />
              </>
            );
          },
          (row) => {
            return (
              <>
                <ButtonComponent
                  label="Batalkan"
                  variant="outline"
                  paint="danger"
                  onClick={() => setModal({ title: "reject", id: row?.id })}
                  icon={faXmark}
                  size="xs"
                  rounded
                  disabled={mechanicLoading}
                />
              </>
            );
          },
          "edit",
        ]}
      />
      <ModalComponent
        title={modal.title == "approve" ? "Setujui Order Online?" : "Tolak Order Online"}
        show={Boolean(modal.title)}
        onClose={() => setModal({ title: "", id: "" })}
      >
        <FormSupervisionComponent
          className="p-4"
          submitControl={
            modal.title == "approve"
              ? {
                  path: `services/${modal?.id}/approve`,
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                }
              : {
                  path: `services/${modal?.id}/reject`,
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                }
          }
          onSuccess={()=>{setModal({title:'',id:''});setRefresh(!refresh)}}
          forms={modal.title=='approve'?[
            {
              type: "select",
              construction: {
                name: "mechanic_id",
                placeholder: "Pilih Teknisi",
                options: mechanicData,
                disabled: mechanicLoading,
              },
            },
          ]:[]}
          footerControl={({ loading }) => (
              <>
                <div className="flex justify-end mt-4 gap-2">
                  <ButtonComponent
                    type="button"
                    onClick={() => setModal("")}
                    label="Batal"
                    icon={faXmark}
                    loading={loading}
                    variant="outline"
                    paint="danger"
                  />
                  <ButtonComponent
                    type="submit"
                    label={modal.title=='aprove'?'Simpan':'Tolak'}
                    icon={faSave}
                    loading={loading}
                    paint="primary"
                  />
                </div>
              </>
            )}
        />
      </ModalComponent>
    </>
  );
}

Index.getLayout = function getLayout(
  page: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
) {
  return <Layout>{page}</Layout>;
};
