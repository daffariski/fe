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
        <title>
          {title ? title[0]?.toUpperCase() + title?.substring(1) : ''} | YUDHA MOTOR
        </title>
      </Head>
      <div className="min-w-screen min-h-screen overflow-hidden relative">
        {/* <Image
          src="/assets/bg.png"
          alt=""
          height={500}
          width={1400}
          className="absolute top-0 left-0 h-full w-full -z-10 blur-sm"
        /> */}
        <div className="absolute top-0 left-0 w-full h-full bg-background  -z-10 opacity-70"></div>
        <div className="container mx-auto grid grid-cols-12 items-center min-h-screen">
          <div className="col-span-12 lg:col-start-3 lg:col-span-5 px-4 lg:px-0">
            <div className="bg-secondary bg-gradient-to-br from-primary to-background w-full p-6 lg:p-8 rounded-xl">
              <Image
                src="/yukder-logo.svg"
                width={140}
                height={50}
                alt="logo"
              />

              <h1 className="text-xl font-bold text-gray-200 capitalize mt-8">
                Login Pelanggan
              </h1>

              <div className="mt-6 lg:mt-8 mb-4">{children}</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full">
          <div className="container mx-auto p-2 flex gap-2 items-center">
            <p className="text-white text-sm">Copyright &copy; 2024 Yudha Motor</p>
            <div className="text-white text-sm">|</div>
            {/* <a href="" className="text-sm text__primary">
              info@yukder.com
            </a> */}
          </div>
        </div>
      </div>
    </>
  );
}
