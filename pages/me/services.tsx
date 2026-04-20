import { useAuthContext } from "@/contexts/Auth.context";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import {
    CardComponent,
    BottomNavComponent,
} from "@/components/base.components";
import { useGetApi, auth } from "@/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMotorcycle,
    faCalendar,
    faUserGear,
    faClipboardList,
    faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface Service {
    id: string;
    description: string;
    status: string;
    created_at: string;
    vehicle: {
        plate_number: string;
        brand: string;
        series: string;
        color: string;
    };
    queue: {
        queue_number: number;
    };
    mechanic: {
        user: {
            name: string;
        };
    };
}

const ServiceHistoryPage = () => {
    const router = useRouter();
    const { user, accessToken } = useAuthContext();
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Validate authentication
    useEffect(() => {
        if (!router.isReady) return;

        if (!accessToken) {
            auth.deleteAccessToken();
            router.push('/login');
        }
    }, [accessToken, router.isReady]);

    // Fetch customer's services
    const {
        loading: servicesLoading,
        data: myServices,
    } = useGetApi({
        path: "customer/services",
        method: "GET",
    });

    const servicesArray: Service[] = Array.isArray(myServices)
        ? myServices
        : myServices?.data ?? [];

    // Filter services by status
    const filteredServices = useMemo(() => {
        if (statusFilter === "all") return servicesArray;
        return servicesArray.filter(
            (service) => service.status.toLowerCase() === statusFilter.toLowerCase()
        );
    }, [servicesArray, statusFilter]);

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        const statusConfig: Record<
            string,
            { bg: string; text: string; label: string }
        > = {
            pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Menunggu" },
            "in-progress": { bg: "bg-blue-100", text: "text-blue-800", label: "Dikerjakan" },
            completed: { bg: "bg-green-100", text: "text-green-800", label: "Selesai" },
            cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Dibatalkan" },
        };

        const config = statusConfig[status.toLowerCase()] || {
            bg: "bg-gray-100",
            text: "text-gray-800",
            label: status,
        };

        return (
            <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
            >
                {config.label}
            </span>
        );
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Count services by status
    const statusCounts = useMemo(() => {
        return {
            all: servicesArray.length,
            pending: servicesArray.filter((s) => s.status.toLowerCase() === "pending")
                .length,
            "in-progress": servicesArray.filter(
                (s) => s.status.toLowerCase() === "in-progress"
            ).length,
            completed: servicesArray.filter((s) => s.status.toLowerCase() === "completed")
                .length,
            cancelled: servicesArray.filter((s) => s.status.toLowerCase() === "cancelled")
                .length,
        };
    }, [servicesArray]);

    return (
        <>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                    <div className="flex items-center mb-4">
                        <Link
                            href={`/me/${user?.id}`}
                            className="mr-4 hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Riwayat Servis</h1>
                            <p className="text-blue-100 text-sm">
                                Lihat semua aktivitas servis Anda
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <p className="text-blue-100 text-xs mb-1">Total Servis</p>
                            <p className="text-2xl font-bold">{statusCounts.all}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <p className="text-blue-100 text-xs mb-1">Selesai</p>
                            <p className="text-2xl font-bold">{statusCounts.completed}</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="flex overflow-x-auto px-4 py-3 space-x-2">
                        {[
                            { key: "all", label: "Semua", count: statusCounts.all },
                            { key: "pending", label: "Menunggu", count: statusCounts.pending },
                            {
                                key: "in-progress",
                                label: "Dikerjakan",
                                count: statusCounts["in-progress"],
                            },
                            { key: "completed", label: "Selesai", count: statusCounts.completed },
                            { key: "cancelled", label: "Dibatalkan", count: statusCounts.cancelled },
                        ].map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setStatusFilter(filter.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === filter.key
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {filter.label} ({filter.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Services List */}
                <div className="p-4 space-y-4">
                    {servicesLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Memuat riwayat servis...</p>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="text-center py-12">
                            <FontAwesomeIcon
                                icon={faClipboardList}
                                size="3x"
                                className="text-gray-300 mb-4"
                            />
                            <p className="text-gray-600">
                                {statusFilter === "all"
                                    ? "Belum ada riwayat servis"
                                    : `Tidak ada servis dengan status "${statusFilter}"`}
                            </p>
                        </div>
                    ) : (
                        filteredServices.map((service) => (
                            <CardComponent
                                key={service.id}
                                className="hover:shadow-lg transition-shadow"
                            >
                                <div className="p-4">
                                    {/* Header: Status and Queue Number */}
                                    <div className="flex justify-between items-start mb-3">
                                        {getStatusBadge(service.status)}
                                        {!!service.queue?.queue_number && (
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Antrian</p>
                                                <p className="text-lg font-bold text-blue-600">
                                                    #{service.queue.queue_number}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vehicle Info */}
                                    <div className="mb-3 pb-3 border-b">
                                        <div className="flex items-center text-gray-700 mb-2">
                                            <FontAwesomeIcon
                                                icon={faMotorcycle}
                                                className="w-5 mr-3 text-blue-600"
                                            />
                                            <div>
                                                <p className="font-bold text-lg">
                                                    {service.vehicle?.plate_number}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {service.vehicle?.brand} {service.vehicle?.series}
                                                    {service.vehicle?.color && (
                                                        <span className="ml-2">• {service.vehicle.color}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {service.description && (
                                        <div className="mb-3">
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {service.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Footer: Mechanic and Date */}
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <FontAwesomeIcon
                                                icon={faUserGear}
                                                className="w-4 mr-2 text-gray-400"
                                            />
                                            <span>
                                                {service.mechanic?.user?.name || "Belum ditugaskan"}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <FontAwesomeIcon
                                                icon={faCalendar}
                                                className="w-4 mr-2 text-gray-400"
                                            />
                                            <span>{formatDate(service.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardComponent>
                        ))
                    )}
                </div>
            </div>

            <BottomNavComponent />
        </>
    );
};

export default ServiceHistoryPage;