import React, { useState, useEffect } from "react";
import {
  ButtonComponent,
  CardComponent,
  ModalComponent,
  FormSupervisionComponent,
} from "@/components/base.components";
import { conversion, useGetApi } from "@/utils";
import {
  faPlus,
  faTrash,
  faSave,
  faXmark,
  faCreditCard,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ServiceDetailModalProps {
  show: boolean;
  serviceId: string | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function ServiceDetailModal({
  show,
  serviceId,
  onClose,
  onRefresh,
}: ServiceDetailModalProps) {
  const [modal, setModal] = useState<{
    type: "add-detail" | "payment" | "";
    data?: any;
  }>({ type: "" });

  // Fetch service details
  const {
    loading: serviceLoading,
    data: serviceData,
    reset: resetService,
  } = useGetApi(
    {
      path: `admin/services/${serviceId}`,
      method: "GET",
    },
    show && serviceId
  );

  // Fetch product options
  const { data: productData } = useGetApi({
    path: "admin/products",
    method: "GET",
    params: { paginate: 100 },
  });

  useEffect(() => {
    if (show && serviceId) {
      resetService();
    }
  }, [show, serviceId]);

  const service = serviceData?.data?.[0] || {};
  const details = service?.details || [];
  const products = productData?.data || [];

  const productOptions = products.map((p: any) => ({
    label: `${p.name} - ${conversion.currency(p.price)}/${p.uom} (Stok: ${p.stock})`,
    value: p.id,
    price: p.price,
  }));

  // Handle delete service detail
  const handleDeleteDetail = async (detailId: string) => {
    if (!confirm("Hapus detail servis ini?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/services/${serviceId}/details/${detailId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.ok) {
        resetService();
        onRefresh?.();
      }
    } catch (error) {
      console.error("Error deleting detail:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      waiting: { color: "bg-yellow-100 text-yellow-800", label: "Menunggu" },
      process: { color: "bg-blue-100 text-blue-800", label: "Dikerjakan" },
      done: { color: "bg-green-100 text-green-800", label: "Selesai" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Dibatalkan" },
    };
    return badges[status] || badges.waiting;
  };

  const statusBadge = getStatusBadge(service.status);

  if (!show) return null;

  return (
    <>
      <ModalComponent
        title={`Detail Servis - ${service.customer?.user?.name || service.customer_name || "..."}`}
        show={show}
        onClose={onClose}
        size="large">
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {serviceLoading ? (
            <div className="flex justify-center py-8">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="animate-spin text-3xl text-gray-400"
              />
            </div>
          ) : (
            <>
              {/* Service Info */}
              <CardComponent className="p-4">
                <h3 className="font-semibold text-lg mb-4">
                  Informasi Servis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nomor Antrian</p>
                    <p className="font-medium">
                      #{service.queue?.queue_number || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.color}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pelanggan</p>
                    <p className="font-medium">{service.customer?.user?.name || service.customer_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kendaraan</p>
                    <p className="font-medium">
                      {service.vehicle?.plate_number} (
                      {service.vehicle?.brand} {service.vehicle?.series})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teknisi</p>
                    <p className="font-medium">
                      {service.mechanic?.user?.name || "Belum ditugaskan"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-medium">
                      {conversion.date(service.created_at)}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Deskripsi</p>
                    <p className="font-medium">
                      {service.description || "-"}
                    </p>
                  </div>
                </div>
              </CardComponent>

              {/* Service Details (Parts/Products) */}
              <CardComponent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">
                    Suku Cadang / Produk
                  </h3>
                  {service.status === "process" && (
                    <ButtonComponent
                      label="Tambah"
                      icon={faPlus}
                      size="sm"
                      onClick={() => setModal({ type: "add-detail" })}
                    />
                  )}
                </div>

                {details.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Belum ada suku cadang yang ditambahkan
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Produk
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Qty
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Harga
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                          {service.status === "process" && (
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                              Aksi
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {details.map((detail: any) => (
                          <tr key={detail.id}>
                            <td className="px-4 py-3">
                              {detail.product?.name || "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {detail.quantity}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {conversion.currency(detail.price)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold">
                              {conversion.currency(detail.total)}
                            </td>
                            {service.status === "process" && (
                              <td className="px-4 py-3 text-center">
                                <ButtonComponent
                                  label=""
                                  icon={faTrash}
                                  size="xs"
                                  paint="danger"
                                  variant="outline"
                                  onClick={() => handleDeleteDetail(detail.id)}
                                />
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-500">
                            Total Sparepart
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-700">
                            {conversion.currency(service.product_fee || 0)}
                          </td>
                          {service.status === "process" && <td></td>}
                        </tr>
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-500">
                            Biaya Jasa
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-700">
                            {service.service_fee ? conversion.currency(service.service_fee) : <span className="italic text-gray-400">Belum ditetapkan</span>}
                          </td>
                          {service.status === "process" && <td></td>}
                        </tr>
                        <tr className="border-t-2 border-gray-300">
                          <td colSpan={3} className="px-4 py-3 text-right font-bold">
                            GRAND TOTAL
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-lg">
                            {conversion.currency(service.total_price || 0)}
                          </td>
                          {service.status === "process" && <td></td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardComponent>

              {/* Payment Info */}
              {service.status === "done" && (
                <CardComponent className="p-4">
                  <h3 className="font-semibold text-lg mb-4">
                    Informasi Pembayaran
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Metode Pembayaran</p>
                      <p className="font-medium uppercase">
                        {service.payment_method || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status Pembayaran</p>
                      <p className="font-medium">
                        {service.payment_status === "paid" ? (
                          <span className="text-green-600">✓ Lunas</span>
                        ) : (
                          <span className="text-red-600">Belum Lunas</span>
                        )}
                      </p>
                    </div>
                    {service.payment_proof && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 mb-2">
                          Bukti Pembayaran
                        </p>
                        <a
                          href={service.payment_proof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Lihat Bukti
                        </a>
                      </div>
                    )}
                  </div>
                </CardComponent>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                {service.status === "process" && (
                  <ButtonComponent
                    label="Selesaikan & Bayar"
                    icon={faCreditCard}
                    paint="success"
                    onClick={() => setModal({ type: "payment" })}
                  />
                )}
                <ButtonComponent
                  label="Tutup"
                  variant="outline"
                  onClick={onClose}
                />
              </div>
            </>
          )}
        </div>
      </ModalComponent>

      {/* Modal: Add Service Detail */}
      <ModalComponent
        title="Tambah Suku Cadang / Produk"
        show={modal.type === "add-detail"}
        onClose={() => setModal({ type: "" })}
      >
        <FormSupervisionComponent
          className="p-6"
          submitControl={{
            path: `admin/services/${serviceId}/details`,
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }}
          onSuccess={() => {
            setModal({ type: "" });
            resetService();
            onRefresh?.();
          }}
          forms={[
            {
              type: "select",
              construction: {
                name: "product_id",
                label: "Produk",
                placeholder: "Pilih produk...",
                options: productOptions,
                required: true,
                searchable: true,
              },
            },
            {
              type: "number",
              construction: {
                name: "quantity",
                label: "Jumlah",
                placeholder: "Masukkan jumlah...",
                required: true,
                min: 1,
              },
            },
            {
              type: "currency",
              construction: {
                name: "price",
                label: "Harga Satuan",
                placeholder: "Harga akan terisi otomatis...",
                required: true,
              },
            },
          ]}
          footerControl={({ loading }) => (
            <div className="flex justify-end gap-2 mt-4">
              <ButtonComponent
                type="button"
                onClick={() => setModal({ type: "" })}
                label="Batal"
                icon={faXmark}
                variant="outline"
                paint="danger"
              />
              <ButtonComponent
                type="submit"
                label="Tambah"
                icon={faSave}
                loading={loading}
                paint="primary"
              />
            </div>
          )}
        />
      </ModalComponent>

      {/* Modal: Complete Service (Payment) */}
      <ModalComponent
        title="Selesaikan Servis & Pembayaran"
        show={modal.type === "payment"}
        onClose={() => setModal({ type: "" })}
      >
        <FormSupervisionComponent
          className="p-6"
          submitControl={{
            path: `admin/services/${serviceId}/complete`,
            method: "POST",
            contentType: "multipart/form-data",
          }}
          onSuccess={() => {
            setModal({ type: "" });
            resetService();
            onRefresh?.();
            onClose();
          }}
          forms={[
            {
              type: "select",
              construction: {
                name: "payment_method",
                label: "Metode Pembayaran",
                placeholder: "Pilih metode pembayaran...",
                options: [
                  { label: "Cash", value: "cash" },
                  { label: "QRIS", value: "qris" },
                  { label: "Transfer Bank", value: "transfer" },
                  { label: "Debit Card", value: "debit" },
                  { label: "Credit Card", value: "credit" },
                ],
                required: true,
              },
            },
            {
              type: "file",
              onHide: (values) => {
                const paymentMethod = values.find(
                  (v) => v.name === "payment_method"
                )?.value;
                return paymentMethod === "cash";
              },
              construction: {
                name: "payment_proof",
                label: "Bukti Pembayaran (opsional untuk cash)",
                placeholder: "Upload bukti pembayaran...",
                accept: "image/*,.pdf",
                required: false,
              },
            },
          ]}
          footerControl={({ loading }) => (
            <div className="flex justify-end gap-2 mt-4">
              <ButtonComponent
                type="button"
                onClick={() => setModal({ type: "" })}
                label="Batal"
                icon={faXmark}
                variant="outline"
                paint="danger"
              />
              <ButtonComponent
                type="submit"
                label="Selesaikan Servis"
                icon={faCheckCircle}
                loading={loading}
                paint="success"
              />
            </div>
          )}
        />
      </ModalComponent>
    </>
  );
}
