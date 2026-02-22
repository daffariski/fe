import React, { useMemo, useState } from "react";
import Layout from "../_layout";
import { useAuthContext } from "@/contexts";
import {
  ButtonComponent,
  FormSupervisionComponent,
  ModalComponent,
  TableSupervisionComponent,
} from "@/components/base.components";
import { ServiceDetailModal } from "@/components/construct.components";
import { conversion, useGetApi, api } from "@/utils";
import { faSave, faUserGear, faXmark, faEye, faPlus, faUser, faUsers, faClipboardCheck, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ServiceType = "walk_in" | "on_behalf" | "historical";

export default function Index() {
  const { user } = useAuthContext();
  const [modal, setModal] = useState({ title: "", id: "" });
  const [refresh, setRefresh] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Add Service modal state
  const [addModal, setAddModal] = useState<{ show: boolean; step: 1 | 2; type: ServiceType | null }>(
    { show: false, step: 1, type: null }
  );
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; label: string } | null>(null);
  const [customerVehicles, setCustomerVehicles] = useState<{ label: string; value: string }[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  const { data: vehicleData } = useGetApi({
    path: "options/vehicle",
    method: "GET",
  });
  const {
    loading: mechanicLoading,
    data: mechanicData,
  } = useGetApi({
    path: "options/mechanic",
    method: "GET",
  });
  const { data: customerOptions } = useGetApi({
    path: "options/customer",
    method: "GET",
  });

  const handleSelectCustomer = async (customerId: string, label: string) => {
    setSelectedCustomer({ id: customerId, label });
    setVehiclesLoading(true);
    try {
      const result = await api({ path: `options/vehicle?customer_id=${customerId}`, method: "GET" });
      setCustomerVehicles(Array.isArray(result?.data) ? result.data : []);
    } catch {
      setCustomerVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const closeAddModal = () => {
    setAddModal({ show: false, step: 1, type: null });
    setSelectedCustomer(null);
    setCustomerVehicles([]);
  };

  const handleAddSuccess = () => {
    closeAddModal();
    setRefresh((r) => !r);
  };

  const TYPE_CONFIG: { key: ServiceType; color: string; icon: any; label: string; subtitle: string; description: string }[] = [
    {
      key: "walk_in",
      icon: faUser,
      color: "blue",
      label: "Tamu (Walk-in)",
      subtitle: "Pelanggan tanpa akun",
      description: "Masukkan nama dan data kendaraan secara manual. Servis langsung masuk antrian hari ini.",
    },
    {
      key: "on_behalf",
      icon: faUsers,
      color: "purple",
      label: "Atas Nama Pelanggan",
      subtitle: "Pelanggan punya akun",
      description: "Pilih pelanggan terdaftar dan kendaraan mereka. Admin menambahkan ke antrian.",
    },
    {
      key: "historical",
      icon: faClipboardCheck,
      color: "orange",
      label: "Kunjungan Belum Tercatat",
      subtitle: "Servis yang sudah terjadi",
      description: "Catat servis yang sudah selesai tapi belum masuk sistem. Tidak akan masuk antrian.",
    },
  ];

  const cardColor: Record<string, string> = {
    blue:   "border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700",
    purple: "border-purple-400 bg-purple-50 hover:bg-purple-100 text-purple-700",
    orange: "border-orange-400 bg-orange-50 hover:bg-orange-100 text-orange-700",
  };
  const iconColor: Record<string, string> = {
    blue:   "bg-blue-100 text-blue-500",
    purple: "bg-purple-100 text-purple-500",
    orange: "bg-orange-100 text-orange-500",
  };

  const formFooter = (loading: boolean, onCancel?: () => void) => (
    <div className="flex justify-end gap-2 mt-4">
      <ButtonComponent
        type="button"
        label="Batal"
        icon={faXmark}
        variant="outline"
        paint="danger"
        onClick={onCancel ?? closeAddModal}
      />
      <ButtonComponent
        type="submit"
        label="Simpan"
        icon={faSave}
        loading={loading}
        paint="primary"
      />
    </div>
  );

  return (
    <>
      {/* ── Tambah Servis button ── */}
      <div className="flex justify-end mb-2">
        <ButtonComponent
          label="Tambah Servis"
          icon={faPlus}
          paint="primary"
          onClick={() => setAddModal({ show: true, step: 1, type: null })}
        />
      </div>

      <TableSupervisionComponent
        title={"Servis"}
        showAddButton={false}
        setToRefresh={refresh}
        fetchControl={{
          path: "admin/services",
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
                options: vehicleData,
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
                  label="Detail"
                  variant="outline"
                  paint="info"
                  onClick={() => {
                    setSelectedServiceId(row?.id);
                    setShowDetailModal(true);
                  }}
                  icon={faEye}
                  size="xs"
                  rounded
                />
              </>
            );
          },
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
        title={modal.title == "approve" ? "Setujui Service?" : "Tolak Service?"}
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
          onSuccess={() => { setModal({ title: '', id: '' }); setRefresh(!refresh) }}
          forms={modal.title == 'approve' ? [
            {
              type: "select",
              construction: {
                name: "mechanic_id",
                placeholder: "Pilih Teknisi",
                options: mechanicData,
                disabled: mechanicLoading,
              },
            },
          ] : []}
          footerControl={({ loading }) => (
            <>
              <div className="flex justify-end mt-4 gap-2">
                <ButtonComponent
                  type="button"
                  onClick={() => setModal({ title: '', id: '' })}
                  label="Batal"
                  icon={faXmark}
                  loading={loading}
                  variant="outline"
                  paint="danger"
                />
                <ButtonComponent
                  type="submit"
                  label={modal.title == 'aprove' ? 'Simpan' : 'Tolak'}
                  icon={faSave}
                  loading={loading}
                  paint="primary"
                />
              </div>
            </>
          )}
        />
      </ModalComponent>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        show={showDetailModal}
        serviceId={selectedServiceId}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedServiceId(null);
        }}
        onRefresh={() => setRefresh(!refresh)}
      />

      {/* ══════════════════════════════════════════════════ */}
      {/* Add Service Modal                                  */}
      {/* ══════════════════════════════════════════════════ */}
      <ModalComponent
        title={
          addModal.step === 1
            ? "Tambah Servis — Pilih Tipe"
            : addModal.type === "walk_in"
            ? "Tambah Servis — Tamu (Walk-in)"
            : addModal.type === "on_behalf"
            ? "Tambah Servis — Atas Nama Pelanggan"
            : "Tambah Servis — Kunjungan Belum Tercatat"
        }
        show={addModal.show}
        onClose={closeAddModal}
        className="base::max-w-2xl"
      >
        {/* ── Step 1: Type picker ── */}
        {addModal.step === 1 && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TYPE_CONFIG.map((t) => (
              <button
                key={t.key}
                onClick={() => setAddModal({ show: true, step: 2, type: t.key })}
                className={`border-2 rounded-xl p-4 text-left transition-all ${cardColor[t.color]}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${iconColor[t.color]}`}>
                  <FontAwesomeIcon icon={t.icon} />
                </div>
                <p className="font-bold text-gray-800">{t.label}</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5 mb-2">{t.subtitle}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{t.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2a: Walk-in form ── */}
        {addModal.step === 2 && addModal.type === "walk_in" && (
          <>
            <div className="flex items-center gap-2 px-5 pt-4">
              <button
                className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
                onClick={() => setAddModal({ show: true, step: 1, type: null })}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Kembali
              </button>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-blue-600 font-medium">Tamu — antrian masuk hari ini</span>
            </div>
            <FormSupervisionComponent
              className="p-5"
              submitControl={{ path: "admin/services", method: "POST" }}
              onSuccess={handleAddSuccess}
              defaultValue={{ add_to_queue: true, status: "waiting", admin_id: user?.id }}
              forms={[
                {
                  construction: {
                    name: "customer_name",
                    label: "Nama Pelanggan",
                    placeholder: "cth. Budi Santoso",
                    required: true,
                  },
                },
                {
                  type: "text",
                  construction: {
                    name: "description",
                    label: "Keluhan / Deskripsi",
                    placeholder: "cth. Ganti oli, ban bocor...",
                  },
                },
                {
                  col: 6,
                  construction: {
                    name: "vehicle_brand",
                    label: "Merek Motor",
                    placeholder: "cth. Honda",
                    required: true,
                  },
                },
                {
                  col: 6,
                  construction: {
                    name: "vehicle_series",
                    label: "Tipe Motor",
                    placeholder: "cth. Beat FI",
                    required: true,
                  },
                },
                {
                  col: 6,
                  construction: {
                    name: "vehicle_plate_number",
                    label: "Nomor Plat",
                    placeholder: "cth. AE 1234 AB",
                    required: true,
                  },
                },
                {
                  col: 6,
                  type: "number",
                  construction: {
                    name: "vehicle_year",
                    label: "Tahun",
                    placeholder: "cth. 2020",
                    required: true,
                  },
                },
                {
                  construction: {
                    name: "vehicle_color",
                    label: "Warna",
                    placeholder: "cth. Merah",
                    required: true,
                  },
                },
              ]}
              footerControl={({ loading }) => formFooter(loading)}
            />
          </>
        )}

        {/* ── Step 2b: On-behalf — pick customer first ── */}
        {addModal.step === 2 && addModal.type === "on_behalf" && !selectedCustomer && (
          <>
            <div className="flex items-center gap-2 px-5 pt-4 pb-2">
              <button
                className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
                onClick={() => setAddModal({ show: true, step: 1, type: null })}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Kembali
              </button>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-purple-600 font-medium">Pilih pelanggan terdaftar</span>
            </div>
            <div className="px-5 pb-5">
              <p className="text-sm text-gray-500 mb-3">
                Cari dan klik nama pelanggan yang ingin dibuatkan servis:
              </p>
              <div className="border rounded-lg divide-y max-h-72 overflow-y-auto">
                {(Array.isArray(customerOptions) ? customerOptions : []).length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">Tidak ada pelanggan terdaftar</p>
                ) : (
                  (Array.isArray(customerOptions) ? customerOptions : []).map((c: any) => (
                    <button
                      key={c.value}
                      onClick={() => handleSelectCustomer(c.value, c.label)}
                      className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors"
                    >
                      <p className="font-medium text-gray-800">{c.label}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Step 2c: On-behalf — vehicle + description after customer picked ── */}
        {addModal.step === 2 && addModal.type === "on_behalf" && selectedCustomer && (
          <>
            <div className="flex items-center gap-2 px-5 pt-4">
              <button
                className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
                onClick={() => setSelectedCustomer(null)}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Ganti pelanggan
              </button>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-purple-600 font-medium">{selectedCustomer.label}</span>
            </div>
            {vehiclesLoading ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">Memuat kendaraan...</div>
            ) : customerVehicles.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                Pelanggan ini belum memiliki kendaraan terdaftar.
              </div>
            ) : (
              <FormSupervisionComponent
                className="p-5"
                submitControl={{ path: "admin/services", method: "POST" }}
                onSuccess={handleAddSuccess}
                defaultValue={{
                  customer_id: selectedCustomer.id,
                  add_to_queue: true,
                  status: "waiting",
                  admin_id: user?.id,
                }}
                forms={[
                  {
                    type: "select",
                    construction: {
                      name: "vehicle_id",
                      label: "Kendaraan",
                      options: customerVehicles,
                      searchable: true,
                      required: true,
                    },
                  },
                  {
                    type: "text",
                    construction: {
                      name: "description",
                      label: "Keluhan / Deskripsi",
                      placeholder: "cth. Ganti oli, rem blong...",
                    },
                  },
                ]}
                footerControl={({ loading }) => formFooter(loading, () => setSelectedCustomer(null))}
              />
            )}
          </>
        )}

        {/* ── Step 2d: Historical / unrecorded ── */}
        {addModal.step === 2 && addModal.type === "historical" && (
          <>
            <div className="flex items-center gap-2 px-5 pt-4">
              <button
                className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
                onClick={() => setAddModal({ show: true, step: 1, type: null })}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Kembali
              </button>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-orange-600 font-medium">Tidak akan ditambah ke antrian</span>
            </div>
            <FormSupervisionComponent
              className="p-5"
              submitControl={{ path: "admin/services", method: "POST" }}
              onSuccess={handleAddSuccess}
              defaultValue={{ add_to_queue: false, status: "done", admin_id: user?.id }}
              forms={[
                {
                  construction: {
                    name: "customer_name",
                    label: "Nama Pelanggan",
                    placeholder: "cth. Budi Santoso",
                    required: true,
                  },
                },
                {
                  type: "text",
                  construction: {
                    name: "description",
                    label: "Keluhan / Deskripsi",
                    placeholder: "cth. Ganti oli, ban bocor...",
                  },
                },
                {
                  col: 6,
                  construction: {
                    name: "vehicle_brand",
                    label: "Merek Motor",
                    placeholder: "cth. Honda",
                    required: true,
                  },
                },
                {
                  col: 6,
                  construction: {
                    name: "vehicle_series",
                    label: "Tipe Motor",
                    placeholder: "cth. Beat FI",
                    required: true,
                  },
                },
                {
                  col: 6,
                  construction: {
                    name: "vehicle_plate_number",
                    label: "Nomor Plat",
                    placeholder: "cth. AE 1234 AB",
                    required: true,
                  },
                },
                {
                  col: 6,
                  type: "number",
                  construction: {
                    name: "vehicle_year",
                    label: "Tahun",
                    placeholder: "cth. 2020",
                    required: true,
                  },
                },
                {
                  construction: {
                    name: "vehicle_color",
                    label: "Warna",
                    placeholder: "cth. Merah",
                    required: true,
                  },
                },
                {
                  type: "select",
                  construction: {
                    name: "mechanic_id",
                    label: "Teknisi yang Mengerjakan (Opsional)",
                    options: mechanicData || [],
                    disabled: mechanicLoading,
                    searchable: true,
                  },
                },
                {
                  type: "select",
                  construction: {
                    name: "status",
                    label: "Status Akhir",
                    required: true,
                    options: [
                      { label: "Selesai", value: "done" },
                      { label: "Dalam Proses", value: "process" },
                      { label: "Dibatalkan", value: "cancelled" },
                    ],
                  },
                },
              ]}
              footerControl={({ loading }) => formFooter(loading)}
            />
          </>
        )}
      </ModalComponent>
    </>
  );
}

Index.getLayout = function getLayout(
  page: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
) {
  return <Layout>{page}</Layout>;
};
