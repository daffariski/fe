import React, { useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { basePath, token_cookie_name } from '@/utils';

export default function LayoutAuth({ children, title }) {
  useEffect(() => {
    if (Cookies.get(token_cookie_name)) {
      window.location.href = basePath;
    }
  }, []);

  return (
    <>
      <Head>
        <title>{`${title ? title[0]?.toUpperCase() + title?.substring(1) : 'Login'} | YUDHA MOTOR`}</title>
      </Head>
      <div className="min-w-screen min-h-screen overflow-hidden relative">
        {/* <Image
          src="/assets/bg.png"
          alt=""
          height={500}
          width={1400}
          className="absolute top-0 left-0 h-full w-full -z-10 blur-sm"
        /> */}
        <div className="absolute top-0 left-0 w-full h-full bg-background -z-10 opacity-70"></div>
        <div className="container mx-auto grid grid-cols-12 items-center min-h-screen">
          <div className="col-span-12 lg:col-start-3 lg:col-span-5 px-4 lg:px-0">
            {/* <div className="bg-secondary bg-gradient-to-br from-primary to-background w-full p-6 lg:p-8 rounded-xl"> */}
            <div className="border border-gray-300 w-full p-6 lg:p-8 mt-4 rounded-xl">
              {/* <Image
                src="/yukder-logo.svg"
                width={140}
                height={50}
                alt="logo"
              /> */}

              <h1 className="text-xl font-bold capitalize mt-8">
                Halaman Pelanggan
              </h1>

              <div className="mt-6 lg:mt-8 mb-4">{children}</div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="container mx-auto p-2 text-center">
            <p className="text-gray-800 text-sm">Copyright &copy; 2026 Yudha Motor</p>
          </div>
        </div>
      </div>
    </>
  );
}
