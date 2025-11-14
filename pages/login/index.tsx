import { faGoogle } from "@fortawesome/free-brands-svg-icons";

import React, { useState } from "react";
// import { login, loginFirebase } from './api/auth';
import LayoutAuth from "./_auth_layout";
import { ButtonComponent } from "../../components/base.components";
import Cookies from "js-cookie";
import { encryption, token_cookie_name } from "@/utils";


const Index = () => {
  const [btnGoogleLoading, setBtnGoogleLoading] = useState(false);
  const [errorLoginProvider, setErrorLoginProvider] = useState("");

  // useEffect(() => {
  //   let myInterval = setInterval(() => {
  //     if (waitingMail > 0) {
  //       setWaitingMail(waitingMail - 1);
  //     }
  //   }, 1000);
  //   return () => {
  //     clearInterval(myInterval);
  //   };
  // });

  function openPopup(url: string, title: string, w: number, h: number) {
    const left = window.screen.width / 2 - w / 2;
    const top = window.screen.height / 2 - h / 2;

    return window.open(
      url,
      title,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${top}, left=${left}`
    );
  }

  async function loginWithPopup(provider = "google") {
    // 👉 backend endpoint that triggers Socialite redirect
    const popup = openPopup(
      `${process.env.NEXT_PUBLIC_API_HOST}/auth/${provider}/redirect`,
      `Login with ${provider}`,
      600,
      600
    );

    return new Promise((resolve, reject) => {
      function onMessage(event: any) {
        // Optional: check event.origin === process.env.NEXT_PUBLIC_API_HOST if same domain
        const data :{token:string,user_id:string,success:number,error:any} = event.data;

        if (data?.success && data?.token) {
          popup?.close();
          window.removeEventListener("message", onMessage);
          resolve(data);
        } else if (data?.error) {
          popup?.close();
          window.removeEventListener("message", onMessage);
          reject(data.error);
        }
      }

      window.addEventListener("message", onMessage);
    });
  }

  const handleLoginProvider = async (provider = "google") => {
    setBtnGoogleLoading(true);
    try {
      const data = await loginWithPopup(provider);

      Cookies.set(token_cookie_name, encryption.set(data?.token), {
        expires: 365,
        secure: true,
      });

      setBtnGoogleLoading(false);
      if (data.user_id) {
        window.location.href = `/me/${data?.user_id}`;
      }
    } catch (error) {
      setBtnGoogleLoading(false);
      setErrorLoginProvider(error || "Gagal masuk!");
    }
  };

  return (
    <>
      <>
        <div className="mb-4">
          <p>Masuk gunakan</p>
        </div>

        <div className="flex gap-4">
          <ButtonComponent
            icon={faGoogle}
            label={"Google"}
            // variant="light"
            loading={btnGoogleLoading}
            block
            onClick={() => handleLoginProvider("google")}
            rounded
          />
        </div>
        {errorLoginProvider && (
          <small
            className={`
              overflow-x-hidden block text-left text-danger mt-3 ml-1 text-sm
            `}
          >
            {errorLoginProvider}
          </small>
        )}
      </>
    </>
  );
};

Index.getLayout = function getLayout(page: any) {
  return <LayoutAuth title={"Masuk"}>{page}</LayoutAuth>;
};

export default Index;
