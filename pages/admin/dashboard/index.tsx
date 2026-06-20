import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import Layout from "../_layout";
import {
  ButtonComponent,
  CardComponent,
} from "@/components/base.components";
import { conversion, useGetApi, auth, cn } from "@/utils";
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

  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("week");

  // Fetch revenue statistics
  const {
    loading: revenueLoading,
    data: revenueData,
    reset: resetRevenue,
  } = useGetApi({
    path: `admin/dashboard/revenue?period=${period}`,
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
    resetRevenue();
  }, [refresh]);

  const handleRefresh = () => setRefresh(!refresh);

  // Process revenue data for chart representation
  const revenueDataNorm = useMemo(() => {
    return Array.isArray(revenueData)
      ? revenueData
      : revenueData?.data || [];
  }, [revenueData]);

  useEffect(() => {
    console.log("revenueDataNorm is changed: ", revenueDataNorm);
  }, [revenueDataNorm])
  
  useEffect(() => {
    console.log("revenueData is changed: ", revenueData);
  }, [revenueData])

  const processedRevenue = useMemo(() => {
    if (period === "day") {
      const todayRevenue = !Array.isArray(revenueData) ? (revenueData?.data[0] || revenueData || {}) : {};
      const total = Number(todayRevenue?.total || 0);
      const count = Number(todayRevenue?.count || 0);
      return {
        total,
        count,
        avg: count > 0 ? total / count : 0,
        chartItems: [
          {
            label: "Hari Ini",
            shortLabel: "Hari Ini",
            total,
            count,
          }
        ]
      };
    }

    if (period === "week") {
      const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
      const startOfWeek = moment().startOf('isoWeek');
      let grandTotal = 0;
      let grandCount = 0;

      const chartItems = Array.from({ length: 7 }).map((_, i) => {
        const dayMoment = startOfWeek.clone().add(i, 'days');
        const dateStr = dayMoment.format('YYYY-MM-DD');
        const apiMatch = revenueDataNorm.find(
          (item: any) => moment(item.date).format('YYYY-MM-DD') === dateStr
        );
        const total = apiMatch ? Number(apiMatch.total || 0) : 0;
        const count = apiMatch ? Number(apiMatch.count || 0) : 0;
        grandTotal += total;
        grandCount += count;

        return {
          label: DAY_NAMES[i],
          shortLabel: DAY_NAMES[i].substring(0, 3),
          date: dateStr,
          total,
          count,
        };
      });

      return {
        total: grandTotal,
        count: grandCount,
        avg: grandCount > 0 ? grandTotal / grandCount : 0,
        chartItems,
      };
    }

    if (period === "month") {
      const startOfMonth = moment().startOf('month');
      const daysInMonth = moment().daysInMonth();
      let grandTotal = 0;
      let grandCount = 0;

      const chartItems = Array.from({ length: daysInMonth }).map((_, i) => {
        const dayMoment = startOfMonth.clone().add(i, 'days');
        const dateStr = dayMoment.format('YYYY-MM-DD');
        const apiMatch = revenueDataNorm.find(
          (item: any) => moment(item.date).format('YYYY-MM-DD') === dateStr
        );
        const total = apiMatch ? Number(apiMatch.total || 0) : 0;
        const count = apiMatch ? Number(apiMatch.count || 0) : 0;
        grandTotal += total;
        grandCount += count;

        return {
          label: dayMoment.format('D MMM'),
          shortLabel: dayMoment.format('D'),
          date: dateStr,
          total,
          count,
        };
      });

      return {
        total: grandTotal,
        count: grandCount,
        avg: grandCount > 0 ? grandTotal / grandCount : 0,
        chartItems,
      };
    }

    if (period === "year") {
      const MONTH_NAMES = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      let grandTotal = 0;
      let grandCount = 0;

      const chartItems = Array.from({ length: 12 }).map((_, i) => {
        const monthNum = i + 1;
        const apiMatch = revenueDataNorm.find(
          (item: any) => Number(item.month) === monthNum
        );
        const total = apiMatch ? Number(apiMatch.total || 0) : 0;
        const count = apiMatch ? Number(apiMatch.count || 0) : 0;
        grandTotal += total;
        grandCount += count;

        return {
          label: MONTH_NAMES[i],
          shortLabel: SHORT_MONTH_NAMES[i],
          total,
          count,
        };
      });

      return {
        total: grandTotal,
        count: grandCount,
        avg: grandCount > 0 ? grandTotal / grandCount : 0,
        chartItems,
      };
    }

    return { total: 0, count: 0, avg: 0, chartItems: [] };
  }, [period, revenueData, revenueDataNorm]);

  // Normalize data - handle both array and object responses
  const shopStatusData = Array.isArray(shopData) ? shopData[0] : shopData?.data?.[0] || {};
  const overviewDataNorm = Array.isArray(overviewData) ? overviewData[0] : overviewData?.data?.[0] || {};
  const mechanicsArray = Array.isArray(mechanicsData) ? mechanicsData : mechanicsData?.data || [];

  // Extract shop status - the session object contains the actual data
  const isShopOpen = shopStatusData?.is_open || shopStatusData?.session?.status === 'open' || false;
  const shopSession = shopStatusData?.session || {};

  const today = overviewDataNorm?.today || {};
  const quickStats = overviewDataNorm?.quick_stats || {};
  const queueInfo = overviewDataNorm?.queue || {};

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

        {/* Gross Profit Statistics Widget */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Analisis Pendapatan Kotor</h2>

            {/* Period selector */}
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 w-full sm:w-auto">
              {(["day", "week", "month", "year"] as const).map((p) => {
                const label =
                  p === "day" ? "Hari Ini" :
                    p === "week" ? "Minggu" :
                      p === "month" ? "Bulan" : "Tahun";
                return (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
                      period === p
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-600 hover:text-primary hover:bg-white/50"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary cards */}
            <div className="flex flex-col gap-4 lg:col-span-1">
              <CardComponent className="p-4 flex items-center justify-between border-l-4 border-l-primary shadow-sm hover:shadow transition-shadow">
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {revenueLoading ? "..." : conversion.currency(processedRevenue.total)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FontAwesomeIcon icon={faDollarSign} />
                </div>
              </CardComponent>

              <CardComponent className="p-4 flex items-center justify-between border-l-4 border-l-green-500 shadow-sm hover:shadow transition-shadow">
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Jumlah Transaksi</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {revenueLoading ? "..." : `${processedRevenue.count} Servis`}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
              </CardComponent>

              <CardComponent className="p-4 flex items-center justify-between border-l-4 border-l-blue-500 shadow-sm hover:shadow transition-shadow">
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Rata-rata Nilai Servis</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {revenueLoading ? "..." : conversion.currency(processedRevenue.avg)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <FontAwesomeIcon icon={faWrench} />
                </div>
              </CardComponent>
            </div>

            {/* Visual representation */}
            <CardComponent className="p-6 lg:col-span-2 flex flex-col justify-between shadow-sm min-h-[300px]">
              {revenueLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12">
                  <div className="animate-spin text-primary text-3xl">
                    <FontAwesomeIcon icon={faSpinner} />
                  </div>
                  <p className="text-sm text-gray-500">Memuat statistik...</p>
                </div>
              ) : period === "day" ? (
                // Today Summary circle progress / visual gauge
                <div className="flex-1 flex flex-col items-center justify-center py-6">
                  <div className="relative w-36 h-36 flex items-center justify-center rounded-full border-8 border-gray-100 shadow-inner">
                    <div className="absolute inset-0 rounded-full border-8 border-primary/25"></div>
                    <div className="text-center z-10">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Hari Ini</p>
                      <p className="text-xl font-extrabold text-primary mt-1">
                        {conversion.currency(processedRevenue.total)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{processedRevenue.count} transaksi</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center max-w-[280px]">
                    Menampilkan total pendapatan kotor dari semua servis yang telah diselesaikan hari ini.
                  </p>
                </div>
              ) : (
                // Bar Chart representation
                <div className="flex-1 flex flex-col justify-between h-full pt-4">
                  {/* Y-Axis guide lines */}
                  <div className="flex-1 relative flex items-end w-full h-[180px] border-b border-gray-200">
                    <div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-100"></div>
                    <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-gray-100"></div>
                    <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-gray-100"></div>

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end justify-between px-2 gap-1 overflow-x-auto scroll select-none">
                      {processedRevenue.chartItems.map((item: any, idx: number) => {
                        const maxVal = Math.max(...processedRevenue.chartItems.map((i: any) => i.total), 1);
                        const percentHeight = (item.total / maxVal) * 100;
                        return (
                          <div
                            key={idx}
                            className="group relative flex-1 flex flex-col items-center min-w-[24px] max-w-[45px] h-full justify-end cursor-pointer"
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none transition-all duration-200 animate-intro-up">
                              <div className="bg-gray-800 text-white text-2xs md:text-xs rounded py-1 px-2 shadow-lg whitespace-nowrap text-center">
                                <p className="font-bold">{item.label}</p>
                                <p className="text-green-400 mt-0.5">{conversion.currency(item.total)}</p>
                                <p className="text-gray-400 text-3xs">{item.count} Servis</p>
                              </div>
                              {/* Triangle arrow */}
                              <div className="w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
                            </div>

                            {/* Bar Graphic */}
                            <div className="w-full bg-gray-50 rounded-t-sm h-full flex items-end">
                              <div
                                style={{ height: `${percentHeight}%` }}
                                className={cn(
                                  "w-full rounded-t-sm transition-all duration-500 ease-out origin-bottom",
                                  item.total > 0
                                    ? "bg-gradient-to-t from-primary/80 to-primary group-hover:from-primary group-hover:to-primary-dark"
                                    : "bg-gray-200"
                                )}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* X-Axis labels */}
                  <div className="flex justify-between items-center mt-2 px-2 text-[10px] text-gray-500 select-none">
                    {processedRevenue.chartItems.map((item: any, idx: number) => {
                      const isMonth = period === "month";
                      const shouldShow = !isMonth || idx === 0 || idx === 4 || idx === 9 || idx === 14 || idx === 19 || idx === 24 || idx === processedRevenue.chartItems.length - 1;
                      return (
                        <div key={idx} className="flex-1 text-center font-semibold truncate" style={{ opacity: shouldShow ? 1 : 0 }}>
                          {item.shortLabel}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
