import React, { useEffect, useState } from "react";
import Layout from "./_layout";
import { CardComponent } from "@/components/base.components";
import { conversion, auth } from "@/utils";

interface ShopSession {
    id: number;
    status: string;
    opened_at: string;
    closed_at: string | null;
    gross_revenue: number;
    services_completed: number;
    services_cancelled: number;
}

export default function ShopSessionsPage() {
    const [sessions, setSessions] = useState<ShopSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [averageRevenue, setAverageRevenue] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchSessions = async () => {
            setLoading(true);
            setError("");
            try {
                const token = auth.getAccessToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/admin/shop-sessions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                if (res.ok && Array.isArray(data.data)) {
                    setSessions(data.data);
                    // Calculate average gross revenue per day (only for days with revenue)
                    const daysWithRevenue = data.data.filter((s: ShopSession) => s.gross_revenue > 0);
                    const totalRevenue = daysWithRevenue.reduce((sum: number, s: ShopSession) => sum + s.gross_revenue, 0);
                    setAverageRevenue(daysWithRevenue.length ? totalRevenue / daysWithRevenue.length : 0);
                } else {
                    setError(data.message || "Gagal memuat data sesi toko");
                }
            } catch (e) {
                setError("Terjadi kesalahan saat memuat data sesi toko");
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <Layout>
                <div className="container mx-auto py-8">
                    <h1 className="text-2xl font-bold mb-4">Riwayat Sesi Toko</h1>
                    <p>Memuat data...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto py-8">
                <h1 className="text-2xl font-bold mb-4">Riwayat Sesi Toko</h1>
                {loading ? (
                    <p>Memuat data...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <>
                        <CardComponent className="mb-6 p-4">
                            <h2 className="text-lg font-semibold mb-2">Statistik</h2>
                            <p>Rata-rata pendapatan kotor per hari: <span className="font-bold text-green-700">{conversion.currency(averageRevenue || 0)}</span></p>
                        </CardComponent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 border">Tanggal Buka</th>
                                        <th className="px-4 py-2 border">Tanggal Tutup</th>
                                        <th className="px-4 py-2 border">Status</th>
                                        <th className="px-4 py-2 border">Pendapatan Kotor</th>
                                        <th className="px-4 py-2 border">Servis Selesai</th>
                                        <th className="px-4 py-2 border">Servis Batal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map((s) => (
                                        <tr key={s.id} className="text-center">
                                            <td className="px-4 py-2 border">
                                                {s.opened_at ? conversion.date(s.opened_at, "DD MMM YYYY HH:mm") : "-"}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                {s.closed_at ? conversion.date(s.closed_at, "DD MMM YYYY HH:mm") : "-"}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                {s.status === "open" ? (
                                                    <span className="text-green-600 font-semibold">BUKA</span>
                                                ) : (
                                                    <span className="text-gray-600">TUTUP</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border">{conversion.currency(s.gross_revenue)}</td>
                                            <td className="px-4 py-2 border">{s.services_completed}</td>
                                            <td className="px-4 py-2 border">{s.services_cancelled}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}
