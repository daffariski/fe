import { useAuthContext } from "@/contexts/Auth.context";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import {
  ButtonComponent,
  CardComponent,
  BottomNavComponent,
  FloatingPageComponent,
  FormSupervisionComponent,
} from "@/components/base.components";

import { faSave, faXmark } from "@fortawesome/free-solid-svg-icons";
import { VehicleListComponent } from "@/components/construct.components";
import { useGetApi } from "@/utils";

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
  const { user } = useAuthContext();
  const [floatPage, setFloatPage] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const {
    loading: myVehicleLoading,
    code: myVehicleCode,
    data: myVehicle,
    reset: myVehicleReset,
  } = useGetApi({
    path: "customer/vehicles",
    method: "GET",
  });
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
          <h1
            className={`text-2xl font-bold mb-4 ${
              user?.name ? "" : "skeleton-loading border"
            }`}
          >
            Welcome, {user?.name}
          </h1>
          <div className="h-[90%] flex flex-col justify-between">
            <VehicleListComponent
              loading={myVehicleLoading}
              data={!myVehicleLoading && myVehicle}
              onVehicleClick={(vehicle) => {
                setSelectedVehicle(vehicle);
                setFloatPage("vehicles");
              }}
            />
            {user?.activeQueue ? (
              <CardComponent
                className={`p-4 ${user?.name ? "" : "skeleton-loading border"}`}
              >
                <h2 className="text-xl font-semibold mb-2">
                  Your Active Queue
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Queue Number:</p>
                    <p className="font-bold text-lg">
                      {user.activeQueue.queueNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Service:</p>
                    <p className="font-bold text-lg">
                      {user.activeQueue.service}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Mechanic:</p>
                    <p className="font-bold text-lg">
                      {user.activeQueue.mechanic}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estimated Time:</p>
                    <p className="font-bold text-lg">
                      {user.activeQueue.estimatedTime}
                    </p>
                  </div>
                </div>
              </CardComponent>
            ) : (
              <div
                className={`flex flex-col items-center justify-center p-8 border-dashed border-2 border-gray-300 rounded-lg ${
                  user?.name ? "" : "skeleton-loading border"
                }`}
              >
                <p className="text-lg text-gray-600 mb-4">
                  You don't have any active appointments.
                </p>
                <ButtonComponent
                  label="Make an Appointment"
                  onClick={() => setFloatPage("services")}
                />
              </div>
            )}
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
              path: `customer/${floatPage}${
                selectedVehicle?.id ? `/${selectedVehicle.id}` : ""
              }`,
              headers: { "Content-Type": "application/json" },
              method: selectedVehicle?.id ? "PATCH" : "POST",
            }}
            onSuccess={() => {
              setFloatPage("");          
              myVehicleReset();
            }}
            confirmation
            defaultValue={
              floatPage === "services"
                ? {
                    customer_id: user?.id,
                    type: myVehicle.length ? "existing" : "new",
                  }
                : {
                    user_id: selectedVehicle?.user_id,
                    plate_number: selectedVehicle?.plate_number,
                    brand: selectedVehicle?.brand,
                    series: selectedVehicle?.series,
                    year: selectedVehicle?.year,
                    color: selectedVehicle?.color,
                  }
            }
            forms={
              floatPage == "services"
                ? [
                    {
                      type: "select",
                      construction: {
                        name: "customer_id",
                        label: "Atas Nama",
                        // placeholder: "Tambahkan deskripsi...",
                        required: true,
                        options: [{ label: user?.name, value: user?.id }],
                        disabled: true,
                      },
                    },
                    {
                      type: "datetime",
                      construction: {
                        name: "preferred_datetime",
                        label: "tanggal",
                        required:true,
                      },
                    },
                    {
                      type: "radio",
                      construction: {
                        name: "type",
                        label: "Kendaraan",
                        options: [
                          { label: "Tambah Baru", value: "new" },
                          { label: "Terdata", value: "existing" },
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
                        label: "Deskripsi",
                        placeholder: "Masukkan Deskripsi",
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
                        placeholder: "cnt. Tahun",
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
                        label: "Tahun (opsional)",
                        placeholder: "Cont: Biru Strip Hitan",
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
