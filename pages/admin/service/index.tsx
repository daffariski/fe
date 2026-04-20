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
import { conversion, useGetApi, api, ApiFilterType } from "@/utils";
import { faSave, faUserGear, faXmark, faEye, faPlus, faUser, faUsers, faClipboardCheck, faArrowLeft, faMoneyBill, faPrint, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ServiceType = "walk_in" | "on_behalf" | "historical";

export default function Index() {
  const { user } = useAuthContext();
  const [modal, setModal] = useState({ title: "", id: "" });
  const [refresh, setRefresh] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{ show: boolean; service: any }>({ show: false, service: null });
  const [statusFilter, setStatusFilter] = useState<string>("");

  const STATUS_FILTER_OPTIONS = [
    { value: "", label: "Semua Status" },
    { value: "waiting", label: "Menunggu" },
    { value: "process", label: "Dikerjakan" },
    { value: "done_paid", label: "Selesai (Lunas)" },
    { value: "done_unpaid", label: "Selesai (Belum Dibayar)" },
    { value: "cancelled", label: "Dibatalkan" },
  ];

  const buildFilterParam = (key: string): ApiFilterType[] | undefined => {
    if (!key) return undefined;
    if (key === "done_paid")
      return [{ type: "eq", column: "status", value: "done" }, { type: "eq", column: "payment_status", value: "paid" }];
    if (key === "done_unpaid")
      return [{ type: "eq", column: "status", value: "done" }, { type: "eq", column: "payment_status", value: "unpaid" }];
    return [{ type: "eq", column: "status", value: key }];
  };

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

  const printReceipt = async (serviceId: string) => {
    try {
      const result = await api({ path: `admin/services/${serviceId}/receipt`, method: "GET" });
      const s = result?.data.data;
      if (!s) return;

      const partsRows = (s.details || [])
        .map((d: any) => `
          <tr>
            <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${d.product?.name || d.description || "-"}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${d.qty ?? 1}x</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${conversion.currency(d.price || 0)}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${conversion.currency(d.total || d.total_price || 0)}</td>
          </tr>`)
        .join("");

      const methodLabel: Record<string, string> = {
        cash: "Tunai", transfer: "Transfer Bank / QRIS",
      };

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <title>Struk Servis #${s.queue?.queue_number || s.id}</title>
        <style>
          body{font-family:Arial,sans-serif;margin:0;padding:24px;color:#111;font-size:14px}
          h1{text-align:center;font-size:20px;margin:0 0 4px}
          .subtitle{text-align:center;color:#6b7280;font-size:12px;margin-bottom:16px}
          .divider{border:none;border-top:1px dashed #9ca3af;margin:12px 0}
          table{width:100%;border-collapse:collapse}
          th{background:#f3f4f6;text-align:left;padding:6px 8px;font-size:12px;text-transform:uppercase;letter-spacing:.05em}
          .total-row td{font-weight:bold;padding:8px;border-top:2px solid #111}
          .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;margin-bottom:12px}
          .info-label{color:#6b7280;font-size:12px}
          .info-val{font-size:13px;font-weight:600}
          @media print{body{padding:8px}}
        </style></head><body>
        <h1>Yudha Motor</h1>
        <p class="subtitle">Struk Servis Kendaraan</p>
        <hr class="divider"/>
        <div class="info-grid">
          <div><div class="info-label">No. Antrian</div><div class="info-val">${s.queue?.queue_number || "-"}</div></div>
          <div><div class="info-label">Tanggal</div><div class="info-val">${new Date(s.updated_at || s.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</div></div>
          <div><div class="info-label">Pelanggan</div><div class="info-val">${s.customer?.user?.name || s.customer_name || "-"}</div></div>
          <div><div class="info-label">Teknisi</div><div class="info-val">${s.mechanic?.user?.name || "-"}</div></div>
          <div><div class="info-label">Kendaraan</div><div class="info-val">${s.vehicle?.plate_number || "-"}</div></div>
          <div><div class="info-label">Tipe</div><div class="info-val">${s.vehicle?.brand || ""} ${s.vehicle?.series || ""}</div></div>
        </div>
        ${s.description ? `<p style="margin:4px 0 12px;font-size:13px;color:#374151"><b>Keluhan:</b> ${s.description}</p>` : ""}
        <hr class="divider"/>
        <table>
          <thead><tr>
            <th>Item/Sparepart</th><th style="text-align:right">Qty</th>
            <th style="text-align:right">Harga</th><th style="text-align:right">Total</th>
          </tr></thead>
          <tbody>${partsRows || '<tr><td colspan="4" style="padding:8px;color:#9ca3af;text-align:center">Tidak ada sparepart</td></tr>'}</tbody>
        </table>
        <hr class="divider"/>
        <table>
          <tbody>
            <tr><td style="padding:4px 8px;color:#6b7280">Total Sparepart</td><td style="padding:4px 8px;text-align:right">${conversion.currency((s.product_fee || 0))}</td></tr>
            <tr><td style="padding:4px 8px;color:#6b7280">Biaya Jasa</td><td style="padding:4px 8px;text-align:right">${conversion.currency(s.service_fee || 0)}</td></tr>
            <tr class="total-row"><td>TOTAL</td><td style="text-align:right">${conversion.currency((s.total_price || 0))}</td></tr>
          </tbody>
        </table>
        <hr class="divider"/>
        <p style="margin:4px 0;font-size:13px"><b>Metode Pembayaran:</b> ${methodLabel[s.payment_method] || s.payment_method || "-"}</p>
        <p style="text-align:center;margin-top:24px;color:#9ca3af;font-size:11px">Terima kasih atas kepercayaan Anda!</p>
        <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}</script>
        </body></html>`;

      const w = window.open("", "_blank", "width=600,height=800");
      if (w) { w.document.write(html); w.document.close(); }
    } catch {
      // error silently
    }
  };

  const filterParam = useMemo(() => buildFilterParam(statusFilter), [statusFilter]);

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
    blue: "border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700",
    purple: "border-purple-400 bg-purple-50 hover:bg-purple-100 text-purple-700",
    orange: "border-orange-400 bg-orange-50 hover:bg-orange-100 text-orange-700",
  };
  const iconColor: Record<string, string> = {
    blue: "bg-blue-100 text-blue-500",
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
      {/* ── Tambah Servis button + filter ── */}
      <div className="flex justify-between items-center mb-2 gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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
          params: { filter: filterParam },
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
          {
            selector: "status",
            label: "Status",
            sortable: false,
            item: (data: any) => {
              const s = data?.status;
              const p = data?.payment_status;
              if (s === "waiting") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Menunggu</span>;
              if (s === "process") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Dikerjakan</span>;
              if (s === "cancelled") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Dibatalkan</span>;
              if (s === "done" && p === "paid") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Selesai</span>;
              if (s === "done") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Belum Dibayar</span>;
              return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{s || "-"}</span>;
            },
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
          (row: any) => (
            <ButtonComponent
              label="Detail"
              variant="outline"
              paint="secondary"
              onClick={() => {
                setSelectedServiceId(row?.id);
                setShowDetailModal(true);
              }}
              icon={faEye}
              size="xs"
              rounded
            />
          ) as any,
          // (row: any) => row?.mechanic_id ? null : (
          //   <ButtonComponent
          //     label="Pilih Terknisi"
          //     variant="outline"
          //     paint="secondary"
          //     onClick={() => setModal({ title: "approve", id: row?.id })}
          //     icon={faUserGear}
          //     size="xs"
          //     rounded
          //     disabled={mechanicLoading}
          //   />
          // ) as any,
          (row: any) => (row?.mechanic_id || row?.status == "cancelled") ? null : (
            <ButtonComponent
              label="Batalkan"
              variant="outline"
              paint="danger"
              onClick={() => setModal({ title: "reject", id: row?.id })}
              icon={faXmark}
              size="xs"
              rounded
            />
          ) as any,
          ((row: any, setModalFn: any, setDataFn: any) => (row?.mechanic_id || row?.status == "cancelled") ? null : (
            <ButtonComponent
              label="Ubah"
              variant="outline"
              paint="warning"
              onClick={() => { setModalFn("form"); setDataFn(); }}
              icon={faEdit}
              size="xs"
              rounded
            />
          )) as any,
          (row: any) => (row?.status === "done" && row?.payment_status !== "paid") ? (
            <ButtonComponent
              label="Bayar"
              variant="outline"
              paint="success"
              onClick={() => setPayModal({ show: true, service: row })}
              icon={faMoneyBill}
              size="xs"
              rounded
            />
          ) : null as any,
          (row: any) => row?.payment_status === "paid" ? (
            <ButtonComponent
              label="Cetak Struk"
              variant="outline"
              paint="primary"
              onClick={() => printReceipt(row?.id)}
              icon={faPrint}
              size="xs"
              rounded
            />
          ) : null as any,
        ] as any[]}
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
                path: `admin/services/${modal?.id}/approve`,
                method: "POST",
                headers: { "Content-Type": "application/json" },
              }
              : {
                path: `admin/services/${modal?.id}/cancel`,
                method: "POST",
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
      {/* Payment Modal                                      */}
      {/* ══════════════════════════════════════════════════ */}
      <ModalComponent
        title="Finalisasi Pembayaran"
        show={payModal.show}
        onClose={() => setPayModal({ show: false, service: null })}
      >
        {payModal.service && (
          <>
            {/* Parts summary */}
            <div className="px-5 pt-4 pb-2 bg-gray-50 border-b max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-gray-500 mb-1">
                Kendaraan:{" "}
                <span className="font-semibold text-gray-800">
                  {payModal.service?.vehicle?.plate_number || "-"}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Total Sparepart (saat ini):{" "}
                <span className="font-semibold text-gray-800">
                  {conversion.currency(payModal.service?.product_fee || 0)}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1 mb-2">
                * Grand total = total sparepart + biaya jasa yang Anda masukkan
              </p>
              <FormSupervisionComponent
                key={payModal.service?.id}
                submitControl={{
                  path: `admin/services/${payModal.service?.id}/complete`,
                  method: "POST",
                }}
                onSuccess={() => {
                  setPayModal({ show: false, service: null });
                  setRefresh((r) => !r);
                }}
                forms={[
                  {
                    type: "currency",
                    construction: {
                      name: "service_fee",
                      label: "Biaya Jasa",
                      placeholder: "Masukkan biaya jasa",
                      required: true,
                    },
                  },
                  {
                    type: "select",
                    construction: {
                      name: "payment_method",
                      label: "Metode Pembayaran",
                      required: true,
                      options: [
                        { label: "Tunai (Cash)", value: "cash" },
                        { label: "Transfer Bank/QRIS", value: "transfer" },
                      ],
                    },
                  },
                  {
                    onHide: (values) => {
                      const method = values.find((v: any) => v.name === "payment_method")?.value;
                      return method === "cash" || !method;
                    },
                    type: "image",
                    construction: {
                      name: "payment_proof",
                      label: "Bukti Pembayaran",
                    },
                  },
                ]}
                footerControl={({ loading }) => (
                  <div className="flex justify-end gap-2 mt-4">
                    <ButtonComponent
                      type="button"
                      label="Batal"
                      icon={faXmark}
                      variant="outline"
                      paint="danger"
                      onClick={() => setPayModal({ show: false, service: null })}
                    />
                    <ButtonComponent
                      type="submit"
                      label="Bayar & Selesaikan"
                      icon={faMoneyBill}
                      loading={loading}
                      paint="success"
                    />
                  </div>
                )}
              />
            </div>
          </>
        )}
      </ModalComponent>

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
          <div className="max-h-[70vh] overflow-y-auto">
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
              defaultValue={{ add_to_queue: 1, status: "waiting", admin_id: user?.id }}
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
          </div>
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
          <div className="max-h-[70vh] overflow-y-auto">
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
                  add_to_queue: 1,
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
          </div>
        )}

        {/* ── Step 2d: Historical / unrecorded ── */}
        {addModal.step === 2 && addModal.type === "historical" && (
          <div className="max-h-[70vh] overflow-y-auto">
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
              defaultValue={{ add_to_queue: 0, status: "done", admin_id: user?.id }}
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
          </div>
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
