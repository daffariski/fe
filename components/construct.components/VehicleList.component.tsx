import React from "react";

interface Vehicle {
  user_id: string;
  plate_number: string;
  brand: string;
  series: string;
  year: number;
  color: string;
}

interface VehicleListComponentProps {
  loading: boolean;
  data: any
  onVehicleClick: (vehicle: Vehicle) => void;
}

export const VehicleListComponent: React.FC<VehicleListComponentProps> = ({
  loading,
  data,
  onVehicleClick,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Your Vehicles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading
          ? [1, 2].map((_, key) => (
              <div
                key={key}
                className="p-4 h-20 rounded-lg border skeleton-loading"
              ></div>
            ))
          : data?.map((data:any) => (
              <div
                key={data.vehicle.plate_number}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => onVehicleClick(data.vehicle)}
              >
                <p className="font-semibold">
                  {data.vehicle.brand} {data.vehicle.series}
                </p>
                <p className="text-gray-600">{data.vehicle.plate_number}</p>
              </div>
            ))}
      </div>
    </div>
  );
};
