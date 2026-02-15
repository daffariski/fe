import React, { useState, useEffect } from "react";
import Layout from "../_layout";
import {
  ButtonComponent,
  CardComponent,
  ModalComponent,
  FormSupervisionComponent,
  TableComponent,
} from "@/components/base.components";
import { conversion, useGetApi } from "@/utils";
import {
  faPlay,
  faForward,
  faCalendarAlt,
  faSave,
  faXmark,
  faCheckCircle,
  faClock,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function QueueManagement() {
  const [modal, setModal] = useState<{
    type: "start" | "requeue" | "next" | "";
    data?: any;
  }>({ type: "" });
  const [refresh, setRefresh] = useState(false);

  // Fetch today's queues
  const {
    loading: queuesLoading,
    data: queuesData,
    reset: resetQueues,
  } = useGetApi({
    path: "admin/queue/today",
    method: "GET",
  });

  // Fetch queue statistics
  const {
    loading: statsLoading,
    data: statsData,
    reset: resetStats,
  } = useGetApi({
    path: "admin/queue/statistics",
    method: "GET",
  });

  // Fetch mechanic options
  const {
    loading: mechanicLoading,
    data: mechanicData,
  } = useGetApi({
    path: "options/mechanic",
    method: "GET",
  });

  // Refresh data
  useEffect(() => {
    resetQueues();
    resetStats();
  }, [refresh]);

  const handleRefresh = () => setRefresh(!refresh);

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      waiting: { color: "bg-yellow-100 text-yellow-800", label: "Menunggu" },
      process: { color: "bg-blue-100 text-blue-800", label: "Dikerjakan" },
      done: { color: "bg-green-100 text-green-800", label: "Selesai" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Dibatalkan" },
    };
    return badges[status] || badges.waiting;
  };

  const statistics = statsData?.data?.[0] || {};
  const queues = queuesData?.data || [];

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Manajemen Antrian</h1>
          <div className="flex gap-2">
            <ButtonComponent
              label="Kerja Antrian Berikutnya"
              icon={faPlay}
              paint="primary"
              onClick={() => setModal({ type: "next" })}
              disabled={queuesLoading || statistics.waiting === 0}
            />
            <ButtonComponent
              label="Refresh"
              variant="outline"
              onClick={handleRefresh}
              loading={queuesLoading}
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardComponent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Antrian</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? "-" : statistics.total_queues || 0}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faClock}
                className="text-3xl text-gray-400"
              />
            </div>
          </CardComponent>

          <CardComponent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statsLoading ? "-" : statistics.waiting || 0}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faClock}
                className="text-3xl text-yellow-400"
              />
            </div>
          </CardComponent>

          <CardComponent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dikerjakan</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statsLoading ? "-" : statistics.in_process || 0}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-3xl text-blue-400"
              />
            </div>
          </CardComponent>

          <CardComponent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-green-600">
                  {statsLoading ? "-" : statistics.completed || 0}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-3xl text-green-400"
              />
            </div>
          </CardComponent>
        </div>

        {/* Current Queue Being Worked */}
        {statistics.current_queue && (
          <CardComponent className="p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-4">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-2xl text-blue-500 animate-spin"
              />
              <div>
                <p className="text-sm text-gray-600">Sedang Dikerjakan</p>
                <p className="font-bold text-lg">
                  Antrian #{statistics.current_queue.queue_number} -{" "}
                  {statistics.current_queue.vehicle}
                </p>
                <p className="text-sm text-gray-600">
                  Teknisi: {statistics.current_queue.mechanic || "-"}
                </p>
              </div>
            </div>
          </CardComponent>
        )}

        {/* Queue List */}
        <CardComponent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Antrian Hari Ini</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Antrian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kendaraan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teknisi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {queuesLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="animate-spin text-2xl text-gray-400"
                      />
                      <p className="mt-2 text-gray-500">Memuat data...</p>
                    </td>
                  </tr>
                ) : queues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <p className="text-gray-500">
                        Tidak ada antrian hari ini
                      </p>
                    </td>
                  </tr>
                ) : (
                  queues.map((queue: any, index: number) => {
                    const statusBadge = getStatusBadge(queue.status);
                    return (
                      <tr key={queue.queue_id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                              <span className="text-blue-800 font-bold">
                                {queue.queue_number}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {queue.customer_name}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {queue.vehicle}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {queue.description || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {queue.mechanic || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.color}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {queue.status === "waiting" && (
                              <>
                                <ButtonComponent
                                  label="Mulai"
                                  size="xs"
                                  icon={faPlay}
                                  paint="primary"
                                  onClick={() =>
                                    setModal({
                                      type: "start",
                                      data: queue,
                                    })
                                  }
                                />
                                <ButtonComponent
                                  label="Tunda"
                                  size="xs"
                                  variant="outline"
                                  icon={faCalendarAlt}
                                  paint="warning"
                                  onClick={() =>
                                    setModal({
                                      type: "requeue",
                                      data: queue,
                                    })
                                  }
                                />
                              </>
                            )}
                            {queue.status === "process" && (
                              <span className="text-blue-600 text-xs">
                                Sedang dikerjakan...
                              </span>
                            )}
                            {queue.status === "done" && (
                              <span className="text-green-600 text-xs">
                                ✓ Selesai
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardComponent>
      </div>

      {/* Modal: Work Next Queue */}
      <ModalComponent
        title="Kerja Antrian Berikutnya"
        show={modal.type === "next"}
        onClose={() => setModal({ type: "" })}
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Sistem akan mengidentifikasi antrian berikutnya yang menunggu.
            Setelah itu, Anda dapat mengklik "Mulai" untuk menugaskan teknisi.
          </p>
          <FormSupervisionComponent
            submitControl={{
              path: "admin/queue/work-next",
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }}
            onSuccess={(response) => {
              setModal({ type: "" });
              handleRefresh();
              // Show the next queue details
              if (response?.data?.service) {
                alert(
                  `Antrian berikutnya: #${response.data.queue.queue_number}\nPelanggan: ${response.data.service.customer_name}\nKlik "Mulai" untuk menugaskan teknisi.`
                );
              }
            }}
            forms={[]}
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
                  label="Identifikasi Antrian Berikutnya"
                  icon={faForward}
                  loading={loading}
                  paint="primary"
                />
              </div>
            )}
          />
        </div>
      </ModalComponent>

      {/* Modal: Start Service (Assign Mechanic) */}
      <ModalComponent
        title={`Mulai Servis - Antrian #${modal.data?.queue_number || ""}`}
        show={modal.type === "start"}
        onClose={() => setModal({ type: "" })}
      >
        <FormSupervisionComponent
          className="p-6"
          submitControl={{
            path: `admin/services/${modal.data?.service_id}/start`,
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }}
          onSuccess={() => {
            setModal({ type: "" });
            handleRefresh();
          }}
          forms={[
            {
              type: "select",
              construction: {
                name: "mechanic_id",
                label: "Pilih Teknisi",
                placeholder: "Pilih teknisi yang akan mengerjakan...",
                options: mechanicData || [],
                disabled: mechanicLoading,
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
                label="Mulai Servis"
                icon={faPlay}
                loading={loading}
                paint="primary"
              />
            </div>
          )}
        />
      </ModalComponent>

      {/* Modal: Requeue Service */}
      <ModalComponent
        title={`Tunda Servis - Antrian #${modal.data?.queue_number || ""}`}
        show={modal.type === "requeue"}
        onClose={() => setModal({ type: "" })}
      >
        <FormSupervisionComponent
          className="p-6"
          submitControl={{
            path: `admin/queue/${modal.data?.service_id}/requeue`,
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }}
          onSuccess={() => {
            setModal({ type: "" });
            handleRefresh();
          }}
          forms={[
            {
              type: "date",
              construction: {
                name: "new_date",
                label: "Tanggal Baru",
                placeholder: "Pilih tanggal baru...",
                required: true,
                min: new Date().toISOString().split("T")[0],
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
                label="Tunda ke Tanggal Baru"
                icon={faSave}
                loading={loading}
                paint="warning"
              />
            </div>
          )}
        />
      </ModalComponent>
    </>
  );
}

QueueManagement.getLayout = function getLayout(
  page: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
) {
  return <Layout>{page}</Layout>;
};
