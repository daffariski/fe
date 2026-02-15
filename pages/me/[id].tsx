import { useAuthContext } from "@/contexts/Auth.context";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  ButtonComponent,
  CardComponent,
  BottomNavComponent,
  FloatingPageComponent,
  FormSupervisionComponent,
} from "@/components/base.components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faXmark, faArrowRight, faClipboardList, faUserEdit } from "@fortawesome/free-solid-svg-icons";
import { VehicleListComponent } from "@/components/construct.components";
import { useGetApi, auth } from "@/utils";

interface Vehicle {
  id: string;
  user_id: string;
  plate_number: string;
  brand: string;
  series: string;
  year: number;
  color: string;
}

const UserProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, accessToken } = useAuthContext();
  const [floatPage, setFloatPage] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Validate user authentication and ID match
  useEffect(() => {
    if (!router.isReady) return;

    // If no token at all, redirect to login
    if (!accessToken) {
      auth.deleteAccessToken();
      router.push('/login');
      return;
    }

    // If we have a token and user is loaded, validate ID match
    // Don't validate if user is still loading (null but token exists)
    if (user && id && user.id?.toString() !== id) {
      console.log('User ID mismatch - redirecting to correct profile or login');
      auth.deleteAccessToken();
      router.push('/login');
    }
  }, [user, id, accessToken, router.isReady]);

  const {
    loading: myVehicleLoading,
    code: myVehicleCode,
    data: myVehicle,
    reset: myVehicleReset,
  } = useGetApi({
    path: "customer/vehicles",
    method: "GET",
  });

  // Fetch customer's services with status
  const {
    loading: servicesLoading,
    data: myServices,
    reset: myServicesReset,
  } = useGetApi({
    path: "customer/services",
    method: "GET",
  });

  const servicesArray = Array.isArray(myServices) ? myServices : myServices?.data ?? [];

  // Calculate default form values with useMemo
  const defaultFormValue = useMemo(() => {
    if (floatPage === "services") {
      return {
        type: myVehicle?.length ? "existing" : "new",
      };
    } else {
      return {
        user_id: selectedVehicle?.user_id,
        plate_number: selectedVehicle?.plate_number,
        brand: selectedVehicle?.brand,
        series: selectedVehicle?.series,
        year: selectedVehicle?.year,
        color: selectedVehicle?.color,
      };
    }
  }, [floatPage, myVehicle, selectedVehicle]);
  // const vehicleOpts = useMemo(() => {
  //   if (!loading && data) {
  //     return data?.data?.map((i) => {
  //       return {
  //         label: `${i?.brand} ${i?.series} (${i?.plate_number})`,
  //         value: i.id,
  //       };
  //     });
  //   }
  // }, [data]);
  return (
    <>
      <div style={{ height: "calc(100vh - 80px)" }}>
        <div className="h-full container mx-auto p-4 ">
          <div className="flex justify-between items-start mb-4">
            <h1
              className={`text-2xl font-bold ${user?.name ? "" : "skeleton-loading border"
                }`}
            >
              Selamat Datang, {user?.name}
            </h1>
            <Link href="/me/profile">
              <ButtonComponent
                label="Edit Profil"
                icon={faUserEdit}
                size="sm"
                variant="outline"
              />
            </Link>
          </div>
          <div className="h-[90%] flex flex-col justify-between">
            <VehicleListComponent
              loading={myVehicleLoading}
              data={!myVehicleLoading && myVehicle}
              onVehicleClick={(vehicle) => {
                setSelectedVehicle(vehicle);
                setFloatPage("vehicles");
              }}
            />

            {/* Active/Recent Services Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClipboardList} className="text-blue-600" />
                  <h2 className="text-lg font-semibold">Servis Terkini</h2>
                </div>
                {servicesArray?.length > 2 && (
                  <Link href="/me/services" className="text-sm text-blue-600 hover:underline">
                    Lihat Semua
                  </Link>
                )}
              </div>

              {servicesLoading ? (
                <CardComponent className="p-4 skeleton-loading border">
                  <div className="h-32"></div>
                </CardComponent>
              ) : servicesArray?.length > 0 ? (
                <div className="space-y-3">
                  {servicesArray.slice(0, 2).map((service: any) => (
                    <CardComponent key={service.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {service.vehicle?.brand} {service.vehicle?.series}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {service.vehicle?.plate_number}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${service.status === "waiting"
                              ? "bg-yellow-100 text-yellow-800"
                              : service.status === "process"
                                ? "bg-blue-100 text-blue-800"
                                : service.status === "done"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                        >
                          {service.status === "waiting"
                            ? "Menunggu"
                            : service.status === "process"
                              ? "Dikerjakan"
                              : service.status === "done"
                                ? "Selesai"
                                : "Dibatalkan"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {service.description}
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {service.queue && (
                          <div>
                            <p className="text-gray-600">Nomor Antrian:</p>
                            <p className="font-bold">{service.queue.queue_number}</p>
                          </div>
                        )}
                        {service.mechanic && (
                          <div>
                            <p className="text-gray-600">Teknisi:</p>
                            <p className="font-bold">
                              {service.mechanic.user?.name || "-"}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardComponent>
                  ))}
                  {servicesArray.length > 2 && (
                    <Link href="/me/services">
                      <ButtonComponent
                        label="Lihat Semua Riwayat"
                        icon={faArrowRight}
                        variant="outline"
                        className="w-full mt-2"
                      />
                    </Link>
                  )}
                </div>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center p-8 border-dashed border-2 border-gray-300 rounded-lg`}
                >
                  <p className="text-lg text-gray-600 mb-4">
                    Belum ada servis aktif.
                  </p>
                  <ButtonComponent
                    label="Buat Appointment"
                    onClick={() => setFloatPage("services")}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <BottomNavComponent />
      </div>
      <FloatingPageComponent
        show={Boolean(floatPage)}
        onClose={() => setFloatPage("")}
        title={floatPage === "services" ? "Servis Motor" : "Detail Kendaraan"}
        className="p-4 overflow-y-scroll"
      >
        {floatPage && (
          <FormSupervisionComponent
            submitControl={{
              path: `customer/${floatPage}${selectedVehicle?.id ? `/${selectedVehicle.id}` : ""
                }`,
              headers: { "Content-Type": "application/json" },
              method: selectedVehicle?.id ? "PATCH" : "POST",
            }}
            onSuccess={() => {
              setFloatPage("");
              myVehicleReset();
              myServicesReset(); // Refresh services list
            }}
            confirmation
            defaultValue={defaultFormValue}
            forms={
              floatPage == "services"
                ? [
                  {
                    type: "radio",
                    construction: {
                      name: "type",
                      label: "Kendaraan",
                      options: [
                        { label: "Pilih dari Motor Saya", value: "existing" },
                        { label: "Tambah Motor Baru", value: "new" },
                      ],
                      required: true,
                    },
                  },
                  {
                    onHide: (values) => {
                      return (
                        values.find((val) => val.name == "type")?.value ==
                        "new"
                      );
                    },
                    type: "select",
                    construction: {
                      name: "vehicle_id",
                      label: "Motor",
                      options: myVehicle,
                      searchable: true,
                      placeholder: "Pilih Motor...",
                      required: true,
                      disabled: !myVehicle,
                    },
                  },
                  {
                    type: "text",
                    construction: {
                      name: "description",
                      label: "Keluhan / Permintaan",
                      placeholder: "Masukkan Keluhan atau permintaan khusus untuk mekanik...",
                      required: true,
                    },
                  },

                  {
                    onHide: (values) => {
                      return (
                        values.find((val) => val.name == "type")?.value !=
                        "new"
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
                        values.find((val) => val.name == "type")?.value !=
                        "new"
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
                        values.find((val) => val.name == "type")?.value !=
                        "new"
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
                        values.find((val) => val.name == "type")?.value !=
                        "new"
                      );
                    },
                    type: "number",
                    construction: {
                      name: "vehicle_year",
                      label: "Tahun",
                      placeholder: "cnt. 2020",
                      required: true,
                    },
                  },
                  {
                    onHide: (values) => {
                      return (
                        values.find((val) => val.name == "type")?.value !=
                        "new"
                      );
                    },
                    construction: {
                      name: "vehicle_color",
                      label: "Warna",
                      placeholder: "Masukkan Warna",
                      required: true,
                    },
                  },
                ]
                : floatPage == "vehicles"
                  ? [
                    {
                      construction: {
                        name: "plate_number",
                        label: "Nomor Plat",
                        placeholder: "Tambahkan Plat Kendaraan ...",
                        required: true,
                      },
                    },
                    {
                      construction: {
                        name: "brand",
                        label: "Brand",
                        placeholder: "Cont: HONDA",
                        required: true,
                      },
                    },
                    {
                      construction: {
                        name: "series",
                        label: "Series",
                        placeholder: "Cont: Supra X 125",
                        required: true,
                      },
                    },
                    {
                      construction: {
                        name: "year",
                        label: "Tahun (opsional)",
                        placeholder: "Cont: 2010",
                      },
                    },
                    {
                      construction: {
                        name: "color",
                        label: "Warna (opsional)",
                        placeholder: "Cont: Biru Strip Hitam",
                      },
                    },
                  ]
                  : []
            }
            footerControl={({ loading }) => (
              <>
                <div className="flex justify-end mt-4 gap-2">
                  <ButtonComponent
                    type="button"
                    onClick={() => setFloatPage("")}
                    label="Batal"
                    icon={faXmark}
                    loading={loading}
                    variant="outline"
                    paint="danger"
                  />
                  <ButtonComponent
                    type="submit"
                    label="Simpan"
                    icon={faSave}
                    loading={loading}
                    paint="primary"
                  />
                </div>
              </>
            )}
          />
        )}
      </FloatingPageComponent>
    </>
  );
};

export default UserProfilePage;
