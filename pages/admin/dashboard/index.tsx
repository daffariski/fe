import React, { useState, useEffect } from "react";
import Layout from "../_layout";
import {
  ButtonComponent,
  CardComponent,
} from "@/components/base.components";
import { conversion, useGetApi, auth } from "@/utils";
import {
  faStore,
  faStoreSlash,
  faDollarSign,
  faWrench,
  faUsers,
  faClock,
  faCheckCircle,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Index() {
  const [refresh, setRefresh] = useState(false);

  // Fetch shop status
  const {
    loading: shopLoading,
    data: shopData,
    reset: resetShop,
  } = useGetApi({
    path: "admin/shop/status",
    method: "GET",
  });

  // Fetch dashboard overview
  const {
    loading: overviewLoading,
    data: overviewData,
    reset: resetOverview,
  } = useGetApi({
    path: "admin/dashboard/overview",
    method: "GET",
  });

  // Fetch revenue statistics (this week) - for future use
  useGetApi({
    path: "admin/dashboard/revenue?period=week",
    method: "GET",
  });

  // Fetch mechanic performance
  const {
    data: mechanicsData,
  } = useGetApi({
    path: "admin/dashboard/mechanics",
    method: "GET",
  });

  // Refresh all data
  useEffect(() => {
    resetShop();
    resetOverview();
  }, [refresh]);

  const handleRefresh = () => setRefresh(!refresh);

  // Normalize data - handle both array and object responses
  const shopStatusData = Array.isArray(shopData) ? shopData[0] : shopData?.data?.[0] || {};
  const overviewDataNorm = Array.isArray(overviewData) ? overviewData[0] : overviewData?.data?.[0] || {};
  const mechanicsArray = Array.isArray(mechanicsData) ? mechanicsData : mechanicsData?.data || [];

  // Extract shop status - the session object contains the actual data
  const isShopOpen = shopStatusData?.is_open || shopStatusData?.session?.status === 'open' || false;
  const shopSession = shopStatusData?.session || {};

  const today = overviewDataNorm?.today || {};
  const thisWeek = overviewDataNorm?.this_week || {};
  const quickStats = overviewDataNorm?.quick_stats || {};
  const queueInfo = overviewDataNorm?.queue || {};
  const mechanics = mechanicsArray;

  // Handle open shop
  const handleOpenShop = async () => {
    try {
      const token = auth.getAccessToken();
      if (!token) {
        alert('Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/admin/shop/open`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Toko berhasil dibuka!');
        handleRefresh();
      } else {
        alert(data.message || 'Gagal membuka toko');
      }
    } catch {
      alert('Terjadi kesalahan saat membuka toko');
    }
  };

  // Handle close shop
  const handleCloseShop = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menutup toko? Pastikan semua servis hari ini sudah selesai."
      )
    ) {
      return;
    }

    try {
      const token = auth.getAccessToken();
      if (!token) {
        alert('Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/admin/shop/close`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Toko berhasil ditutup!');
        handleRefresh();
      } else {
        alert(data.message || 'Gagal menutup toko');
      }
    } catch {
      alert('Terjadi kesalahan saat menutup toko');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Shop Status Control */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Shop Control */}
          <CardComponent className="p-4 border-2 border-gray-200 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={isShopOpen ? faStore : faStoreSlash}
                  className={`text-3xl ${isShopOpen ? "text-green-500" : "text-red-500"
                    }`}
                />
                <div>
                  <p className="text-sm text-gray-600">Status Toko</p>
                  <p
                    className={`text-xl font-bold ${isShopOpen ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {shopLoading
                      ? "..."
                      : isShopOpen
                        ? "BUKA"
                        : "TUTUP"}
                  </p>
                  {shopSession?.opened_at && (
                    <p className="text-xs text-gray-500">
                      {isShopOpen
                        ? `Dibuka: ${conversion.date(shopSession.opened_at, "HH:mm")}`
                        : `Ditutup: ${conversion.date(shopSession.closed_at, "HH:mm")}`}
                    </p>
                  )}
                </div>
              </div>
              <ButtonComponent
                label={isShopOpen ? "Tutup Toko" : "Buka Toko"}
                icon={isShopOpen ? faStoreSlash : faStore}
                paint={isShopOpen ? "danger" : "success"}
                onClick={isShopOpen ? handleCloseShop : handleOpenShop}
                disabled={shopLoading}
                loading={shopLoading}
              />
            </div>
          </CardComponent>
        </div>

        {/* Today's Statistics */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Statistik Hari Ini</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <CardComponent className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Servis Selesai</p>
                  <p className="text-2xl font-bold text-green-600">
                    {overviewLoading ? "-" : today.services_completed || 0}
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-3xl text-green-400"
                />
              </div>
            </CardComponent>

            <CardComponent className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menunggu</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {overviewLoading ? "-" : today.waiting_services || 0}
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-3xl text-yellow-400"
                />
              </div>
            </CardComponent>

            <CardComponent className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dikerjakan</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {overviewLoading ? "-" : today.in_process_services || 0}
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="text-3xl text-blue-400"
                />
              </div>
            </CardComponent>

            <CardComponent className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendapatan</p>
                  <p className="text-2xl font-bold text-green-600">
                    {overviewLoading
                      ? "-"
                      : conversion.currency(today.gross_revenue || 0)}
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={faDollarSign}
                  className="text-3xl text-green-400"
                />
              </div>
            </CardComponent>
          </div>
        </div>

        {/* Queue Overview */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Info Antrian</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CardComponent className="p-4">
              <h3 className="font-semibold mb-3">Antrian Saat Ini</h3>
              {queueInfo?.current_queue_number ? (
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center bg-blue-100 rounded-full">
                    <span className="text-blue-800 font-bold text-2xl">
                      {queueInfo.current_queue_number}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sedang Dikerjakan</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total antrian: {queueInfo.total_queues || 0}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Tidak ada antrian yang sedang dikerjakan
                </p>
              )}
            </CardComponent>

            <CardComponent className="p-4">
              <h3 className="font-semibold mb-3">Antrian Berikutnya</h3>
              {queueInfo?.next_queue ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-yellow-100 rounded-full">
                      <span className="text-yellow-800 font-bold text-lg">
                        {queueInfo.next_queue.queue_number}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {queueInfo.next_queue.customer_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {queueInfo.next_queue.vehicle}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Tidak ada antrian berikutnya
                </p>
              )}
            </CardComponent>
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Statistik Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardComponent className="p-4">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-2xl text-purple-500"
                />
                <div>
                  <p className="text-sm text-gray-600">Pelanggan Hari Ini</p>
                  <p className="text-xl font-bold">
                    {overviewLoading ? "-" : quickStats.total_customers_today || 0}
                  </p>
                </div>
              </div>
            </CardComponent>

            <CardComponent className="p-4">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faWrench}
                  className="text-2xl text-blue-500"
                />
                <div>
                  <p className="text-sm text-gray-600">Teknisi Aktif</p>
                  <p className="text-xl font-bold">
                    {overviewLoading ? "-" : quickStats.active_mechanics || 0}
                  </p>
                </div>
              </div>
            </CardComponent>

            <CardComponent className="p-4">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-2xl text-red-500"
                />
                <div>
                  <p className="text-sm text-gray-600">Stok Rendah</p>
                  <p className="text-xl font-bold">
                    {overviewLoading ? "-" : quickStats.low_stock_products || 0}
                  </p>
                </div>
              </div>
            </CardComponent>
          </div>
        </div>

        {/* This Week */}
        {thisWeek && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Minggu Ini</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <CardComponent className="p-4">
                <p className="text-sm text-gray-600">Total Servis</p>
                <p className="text-2xl font-bold">
                  {overviewLoading ? "-" : (thisWeek.services_completed || 0) + (thisWeek.services_cancelled || 0)}
                </p>
              </CardComponent>
              <CardComponent className="p-4">
                <p className="text-sm text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-green-600">
                  {overviewLoading ? "-" : thisWeek.services_completed || 0}
                </p>
              </CardComponent>
              <CardComponent className="p-4">
                <p className="text-sm text-gray-600">Dibatalkan</p>
                <p className="text-2xl font-bold text-red-600">
                  {overviewLoading ? "-" : thisWeek.services_cancelled || 0}
                </p>
              </CardComponent>
              <CardComponent className="p-4">
                <p className="text-sm text-gray-600">Total Pendapatan</p>
                <p className="text-xl font-bold text-green-600">
                  {overviewLoading
                    ? "-"
                    : conversion.currency(thisWeek.gross_revenue || 0)}
                </p>
              </CardComponent>
            </div>
          </div>
        )}

        {/* Mechanic Performance */}
        {/* {mechanics.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Performa Teknisi</h2>
            <CardComponent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nama
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Spesialisasi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Selesai Hari Ini
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Minggu Ini
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Pendapatan Hari Ini
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mechanics.map((mechanic: any) => (
                      <tr key={mechanic.mechanic_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{mechanic.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {mechanic.specialization || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {mechanic.completed_today || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">{mechanic.completed_this_week || 0}</td>
                        <td className="px-4 py-3 font-semibold">
                          {conversion.currency(mechanic.revenue_today || 0)}
                        </td>
                        <td className="px-4 py-3">
                          {mechanic.currently_working ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              Bekerja
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              Siap
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardComponent>
          </div>
        )} */}
      </div>
    </>
  );
}

Index.getLayout = function getLayout(
  page: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
) {
  return <Layout>{page}</Layout>;
};
