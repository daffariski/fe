import { useAuthContext } from "@/contexts/Auth.context";
import React, { useState } from "react";
import {
  faMagnifyingGlass,
  faUserCog,
  faCheckCircle,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { CardComponent, InputComponent, PaginationComponent } from "@/components/base.components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import { useGetApi } from "@/utils";

export default function Index() {
  const [paginate, setPaginate] = useState(20);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const { accessToken } = useAuthContext();
  const { loading, code, data, reset } = useGetApi({
    path: "catalog",
    method: "GET",
    params: {
      page,
      paginate,
      search: search,
      // filter: filter,
    },
  });
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <div className="flex flex-col">
        <div
          style={{ height: "calc(100vh - 60px)" }}
          className="overflow-y-scroll"
        >
          <section className="container w-screen grid grid-cols-2 md:grid-cols-4 mx-auto justify-center gap-4 p-4 ">
            <CardComponent className="flex flex-col items-center justify-center p-4">
              <FontAwesomeIcon icon={faUserCog} size="2x" className="mb-2" />
              <h3 className="text-sm font-semibold">Teknisi Tersedia</h3>
              <p className="text-2xl font-bold">12</p>
            </CardComponent>
            <CardComponent className="flex flex-col items-center justify-center p-4">
              <FontAwesomeIcon
                icon={faCheckCircle}
                size="2x"
                className="mb-2"
              />
              <h3 className="text-sm font-semibold">Servis Selesai</h3>
              <p className="text-2xl font-bold">1,234</p>
            </CardComponent>
            <CardComponent className="flex flex-col items-center justify-center p-4">
              <FontAwesomeIcon
                icon={faClipboardList}
                size="2x"
                className="mb-2"
              />
              <h3 className="text-sm font-semibold">Suku Cadang</h3>
              <p className="text-2xl font-bold">5</p>
            </CardComponent>
            <CardComponent className="flex flex-col items-center justify-center p-4 bg-primary text-white cursor-pointer">
              {accessToken ? (
                <Link href={`/me/${id}`}>
                  <h3 className="text-sm font-semibold">My Appointment</h3>
                  <p className="text-xs">Check your queue</p>
                </Link>
              ) : (
                <Link href="/login">
                  <h3 className="text-sm font-semibold">Login Sekarang!</h3>
                  <p className="text-xs">gunakan semua fitur</p>
                </Link>
              )}
            </CardComponent>
          </section>
          <section className="container mx-auto px-4  ">
            <InputComponent
              name="search"
              placeholder="Cari disini..."
              rightIcon={faMagnifyingGlass}
              value={search}
              onChange={(e) => setSearch(e)}
              className="py-1.5 text-sm"
            />
          </section>
          <section className="container w-screen mx-auto justify-center gap-4 pt-5 flex flex-wrap ">
            {!loading &&
              code !== 500 &&
              data?.data?.map((item: any, key: number) => {
                return (
                  <CardComponent
                    key={key}
                    className="w-[320px] md:min-w-[300px]"
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">
                        {item.name}
                      </h3>
                      {item.series && (
                        <p className="text-gray-600 text-sm mb-1">
                          Series: {item.series}
                        </p>
                      )}
                      {item.price && (
                        <p className="text-gray-800 font-bold">
                          Rp.{item.price.toLocaleString()}
                          {item.uom && `/${item.uom}`}
                        </p>
                      )}
                    </div>
                  </CardComponent>
                );
              })}
          </section>
        </div>
        <div className="m-2">
          <PaginationComponent
            className="w-screen flex flex-col md:flex-row"
            page={page}
            paginate={paginate}
            totalRow={data?.total_row || 0}
            onChange={(_, pageSize, page) => {
              setPage(page);
              setPaginate(pageSize);
            }}
          />
        </div>
      </div>
    </>
  );
}
