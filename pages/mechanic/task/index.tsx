import React, { useState } from "react";
import Layout from "../_layout";
import {
  ButtonComponent,
  CardComponent,
  FormSupervisionComponent,
  ModalComponent,
  ModalConfirmComponent,
} from "@/components/base.components";
import { conversion, useGetApi, api } from "@/utils";
import {
  faRefresh,
  faPlus,
  faTrash,
  faCheckCircle,
  faXmark,
  faSave,
  faClock,
  faMotorcycle,
  faUser,
  faClipboardList,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceDetail {
  id: string;
  product: { id: string; name: string; uom: string };
  quantity: number;
  price: number;
  total: number;
}

interface ServiceItem {
  id: string;
  status: string;
  description: string;
  customer_name: string;
  customer: { user: { name: string } } | null;
  vehicle: {
    plate_number: string;
    brand: string;
    series: string;
    color: string;
  };
  queue: { queue_number: number } | null;
  details: ServiceDetail[];
  price: number;
  updated_at: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function customerName(service: ServiceItem) {
  return service.customer?.user?.name || service.customer_name || "Umum";
}

function elapsedTime(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (diff < 60) return `${diff} mnt`;
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  return mins > 0 ? `${hrs} jam ${mins} mnt` : `${hrs} jam`;
}

function partsTotal(details: ServiceDetail[]) {
  return details.reduce((sum, d) => sum + d.total, 0);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <FontAwesomeIcon icon={faClipboardList} className="text-5xl mb-4" />
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}

function PartsList({
  details,
  canDelete,
  onDelete,
}: {
  details: ServiceDetail[];
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}) {
  if (details.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-2">
        Belum ada suku cadang yang ditambahkan
      </p>
    );
  }
  return (
    <table className="w-full text-sm mt-1">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          <th className="pb-1 font-medium" style={{ width: "80px" }}>Produk</th>
          <th className="pb-1 font-medium text-right">Qty</th>
          <th className="pb-1 font-medium text-right">Satuan</th>
          <th className="pb-1 font-medium text-right">Total</th>
          {canDelete && <th className="pb-1 w-8" />}
        </tr>
      </thead>
      <tbody>
        {details.map((d) => (
          <tr key={d.id} className="border-b last:border-0">
            <td className="py-1">
              {d.product?.name || "-"}
              <span className="text-gray-400 ml-1 text-xs">/ {d.product?.uom}</span>
            </td>
            <td className="py-1 text-right">{d.quantity}</td>
            {/* <td className="py-1 text-right">{conversion.currency(d.price)}</td> */}
            <td className="py-1 text-right">{d.price}</td>
            <td className="py-1 text-right font-semibold">{conversion.currency(d.total)}</td>
            {canDelete && (
              <td className="py-1 pl-2">
                <ButtonComponent
                  label=""
                  icon={faTrash}
                  size="xs"
                  paint="danger"
                  variant="simple"
                  onClick={() => onDelete?.(d.id)}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Index() {
  const [activeTab, setActiveTab] = useState<"working" | "history">("working");
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [addPartOpen, setAddPartOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const {
    loading: workLoading,
    data: workData,
    reset: refreshWork,
  } = useGetApi({ path: "mechanic/services", method: "GET" }, false);

  const {
    loading: histLoading,
    data: histData,
    reset: refreshHistory,
  } = useGetApi(
    { path: "mechanic/services/history", method: "GET" },
    activeTab !== "history"
  );

  const { data: productOptionsRaw } = useGetApi({
    path: "options/product",
    method: "GET",
  });

  const services: ServiceItem[] = workData?.data ?? [];
  const historyServices: ServiceItem[] = histData?.data ?? [];
  const productOptions = Array.isArray(productOptionsRaw) ? productOptionsRaw : [];

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleRefresh = () => {
    refreshWork();
    if (activeTab === "history") refreshHistory();
  };

  const handleDeletePart = async (serviceId: string, detailId: string) => {
    await api({
      path: `mechanic/services/${serviceId}/details/${detailId}`,
      method: "DELETE",
    });
    refreshWork();
    if (selected?.id === serviceId) {
      setSelected((prev) =>
        prev
          ? { ...prev, details: prev.details.filter((d) => d.id !== detailId) }
          : null
      );
    }
  };

  const handleFinish = async () => {
    if (!selected) return;
    setFinishLoading(true);
    await api({
      path: `mechanic/services/${selected.id}/finish`,
      method: "POST",
    });
    setFinishLoading(false);
    setFinishOpen(false);
    setSelected(null);
    refreshWork();
  };

  const openAddPart = (service: ServiceItem) => {
    setSelected(service);
    setAddPartOpen(true);
  };

  const openFinish = (service: ServiceItem) => {
    setSelected(service);
    setFinishOpen(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Tugas Saya</h1>
          <p className="text-sm text-gray-500">
            Kelola servis yang sedang Anda kerjakan
          </p>
        </div>
        <ButtonComponent
          label="Refresh"
          icon={faRefresh}
          size="sm"
          variant="outline"
          onClick={handleRefresh}
        />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-4 border-b">
        {(
          [
            { key: "working", label: "Sedang Dikerjakan" },
            { key: "history", label: "Riwayat Selesai" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === "history") refreshHistory();
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
            {tab.key === "working" && services.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {services.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Working Tab ── */}
      {activeTab === "working" && (
        <>
          {workLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : services.length === 0 ? (
            <EmptyState message="Tidak ada servis yang sedang dikerjakan" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onAddPart={() => openAddPart(service)}
                  onFinish={() => openFinish(service)}
                  onDeletePart={(detailId) =>
                    handleDeletePart(service.id, detailId)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── History Tab ── */}
      {activeTab === "history" && (
        <>
          {histLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-40 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : historyServices.length === 0 ? (
            <EmptyState message="Belum ada servis yang diselesaikan" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {historyServices.map((service) => (
                <ServiceCard key={service.id} service={service} readOnly />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Modal: Tambah Suku Cadang ── */}
      <ModalComponent
        title={`Tambah Suku Cadang — ${selected?.vehicle?.plate_number ?? ""}`}
        show={addPartOpen}
        onClose={() => setAddPartOpen(false)}
        className="base::max-w-lg"
      >
        <FormSupervisionComponent
          className="p-5"
          submitControl={{
            path: `mechanic/services/${selected?.id}/details`,
            method: "POST",
          }}
          onSuccess={() => {
            setAddPartOpen(false);
            refreshWork();
          }}
          forms={[
            {
              type: "select",
              construction: {
                name: "product_id",
                label: "Produk / Suku Cadang",
                placeholder: "Cari dan pilih produk...",
                options: productOptions,
                required: true,
                searchable: true,
              },
            },
            {
              // col: 6,
              type: "number",
              construction: {
                name: "quantity",
                label: "Jumlah",
                placeholder: "Qty",
                required: true,
                min: 1,
              },
            },
            // {
            //   col: 6,
            //   type: "currency",
            //   construction: {
            //     name: "price",
            //     label: "Harga Satuan (Rp)",
            //     placeholder: "0",
            //     required: true,
            //   },
            // },
          ]}
          footerControl={({ loading }) => (
            <div className="flex justify-end gap-2 mt-4">
              <ButtonComponent
                type="button"
                label="Batal"
                icon={faXmark}
                variant="outline"
                paint="danger"
                onClick={() => setAddPartOpen(false)}
              />
              <ButtonComponent
                type="submit"
                label="Tambahkan"
                icon={faSave}
                loading={loading}
                paint="primary"
              />
            </div>
          )}
        />
      </ModalComponent>

      {/* ── Modal: Konfirmasi Selesai ── */}
      <ModalConfirmComponent
        show={finishOpen}
        onClose={() => setFinishOpen(false)}
        title="Selesaikan Servis?"
        icon={faCheckCircle}
        submitControl={{
          label: "Ya, Selesaikan",
          paint: "success",
          loading: finishLoading,
          onSubmit: handleFinish,
          onSuccess: () => {},
        }}
      >
        {selected && (
          <div className="px-4 pb-2 text-sm">
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="font-semibold text-base">
                {selected.vehicle.plate_number}
              </p>
              <p className="text-gray-500">
                {selected.vehicle.brand} {selected.vehicle.series}
              </p>
              <p className="text-gray-500 mt-1">
                Pelanggan: {customerName(selected)}
              </p>
            </div>

            {selected.details.length > 0 ? (
              <>
                <p className="font-medium mb-2">Suku cadang yang tercatat:</p>
                <PartsList details={selected.details} />
                <div className="flex justify-between font-bold mt-2 pt-2 border-t text-base">
                  <span>Total Suku Cadang</span>
                  <span>{conversion.currency(partsTotal(selected.details))}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-400 italic">Tidak ada suku cadang.</p>
            )}

            <p className="text-xs text-gray-400 mt-3">
              * Biaya jasa akan ditentukan oleh admin setelah servis ini selesai.
            </p>
          </div>
        )}
      </ModalConfirmComponent>
    </>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: ServiceItem;
  readOnly?: boolean;
  onAddPart?: () => void;
  onFinish?: () => void;
  onDeletePart?: (detailId: string) => void;
}

function ServiceCard({
  service,
  readOnly = false,
  onAddPart,
  onFinish,
  onDeletePart,
}: ServiceCardProps) {
  const [expanded, setExpanded] = useState(true);
  const total = partsTotal(service.details);

  return (
    <CardComponent className="flex flex-col overflow-hidden">
      {/* ── Card Header ── */}
      <div className="flex items-start justify-between p-4 pb-3 border-b bg-gray-50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {service.queue && (
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                Antrian #{service.queue.queue_number}
              </span>
            )}
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                service.status === "process"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {service.status === "process" ? "Dikerjakan" : "Selesai"}
            </span>
          </div>
          <p className="text-lg font-bold mt-1 truncate">
            {service.vehicle.plate_number}
          </p>
          <p className="text-sm text-gray-500">
            {service.vehicle.brand} {service.vehicle.series} ·{" "}
            {service.vehicle.color}
          </p>
        </div>

        {service.status === "process" && (
          <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0 mt-1">
            <FontAwesomeIcon icon={faClock} />
            <span>{elapsedTime(service.updated_at)}</span>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <FontAwesomeIcon icon={faUser} className="text-gray-400 w-4" />
          <span className="text-gray-700">{customerName(service)}</span>
        </div>

        {service.description && (
          <div className="flex items-start gap-2 text-sm">
            <FontAwesomeIcon
              icon={faMotorcycle}
              className="text-gray-400 w-4 mt-0.5"
            />
            <pre className="text-gray-700 whitespace-pre-wrap text-xs bg-gray-50 rounded p-2 flex-1 max-h-20 overflow-y-auto">
              {service.description}
            </pre>
          </div>
        )}

        <div>
          <button
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setExpanded((e) => !e)}
          >
            <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400 w-4" />
            <span>Suku Cadang ({service.details.length})</span>
            <span className="text-xs text-gray-400 ml-1">
              {expanded ? "▲" : "▼"}
            </span>
          </button>

          {expanded && (
            <div className="mt-2 ml-6">
              <PartsList
                details={service.details}
                canDelete={!readOnly && service.status === "process"}
                onDelete={onDeletePart}
              />
              {service.details.length > 0 && (
                <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t">
                  <span>Subtotal Suku Cadang</span>
                  <span>{conversion.currency(total)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Card Footer ── */}
      {!readOnly && service.status === "process" && (
        <div className="flex gap-2 p-4 pt-3 border-t bg-gray-50">
          <ButtonComponent
            label="+ Suku Cadang"
            icon={faPlus}
            size="sm"
            variant="outline"
            paint="secondary"
            className="flex-1"
            onClick={onAddPart}
          />
          <ButtonComponent
            label="Selesaikan"
            icon={faCheckCircle}
            size="sm"
            paint="success"
            className="flex-1"
            onClick={onFinish}
          />
        </div>
      )}

      {readOnly && service.details.length > 0 && (
        <div className="flex justify-between items-center px-4 py-3 border-t bg-green-50 text-sm">
          <span className="text-gray-600">Total Suku Cadang</span>
          <span className="font-bold text-green-700">
            {conversion.currency(total)}
          </span>
        </div>
      )}
    </CardComponent>
  );
}

Index.getLayout = function getLayout(
  page: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
) {
  return <Layout>{page}</Layout>;
};