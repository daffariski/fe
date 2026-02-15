import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import React, { useState } from "react";
import { useRouter } from "next/router";
import LayoutAuth from "./_auth_layout";
import { ButtonComponent, CardComponent, FormSupervisionComponent } from "../../components/base.components";
import Cookies from "js-cookie";
import { encryption, token_cookie_name } from "@/utils";

const Index = () => {
  const [btnGoogleLoading, setBtnGoogleLoading] = useState(false);
  const [errorLoginProvider, setErrorLoginProvider] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const router = useRouter();

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
    const popup = openPopup(
      `${process.env.NEXT_PUBLIC_API_HOST}/auth/${provider}/redirect`,
      `Login with ${provider}`,
      600,
      600
    );

    return new Promise((resolve, reject) => {
      function onMessage(event: any) {
        const data: { token: string; user_id: string; success: number; error: any } = event.data;

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
      const data: any = await loginWithPopup(provider);

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

  const formInputs = [
    {
      construction: {
        id: "input-email",
        name: "email",
        label: "E-mail",
        placeholder: "Ex: customer@example.com",
        validations: "required|min:10|max:50|email"
      }
    },
    {
      construction: {
        id: "input-password",
        type: "password",
        name: "password",
        label: "Password",
        placeholder: "**********",
      },
    },
  ];

  const submitHandler = (res: any) => {
    console.log("🚀 ~ Login ~ res:", res);

    Cookies.set(token_cookie_name, encryption.set(res?.access_token), {
      expires: 365,
    });

    // Redirect customer to their profile page
    if (res?.user?.customer?.id) {
      router.push(`/me/${res?.user?.id}`);
    } else {
      router.push(`/me/${res?.user?.id}`);
    }
  };

  const renderFooter = (formState: any) => (
    <ButtonComponent
      type="submit"
      label="Masuk"
      block
      loading={formState?.loading}
      className="mt-4"
    />
  );

  return (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Masuk dengan Email</h2>
        <p className="text-sm text-gray-600">Gunakan email dan password yang terdaftar</p>
      </div>

      {errorLogin && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
          {errorLogin}
        </div>
      )}

      <CardComponent className="p-6 rounded-2xl mb-6">
        <FormSupervisionComponent
          forms={formInputs}
          submitControl={{
            path: "login",
          }}
          onSuccess={submitHandler}
          onError={(res) => {
            if (res === 401) {
              setErrorLogin("Login Gagal, Pastikan Email dan Password benar");
            } else {
              setErrorLogin("Terjadi kesalahan, silakan coba lagi");
            }
          }}
          footerControl={renderFooter}
          successMessage="Login berhasil! Mengalihkan..."
          errorMessage="Login gagal, silakan coba lagi"
        />
      </CardComponent>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Atau masuk dengan</span>
        </div>
      </div>

      <div className="flex gap-4">
        <ButtonComponent
          icon={faGoogle}
          label="Google"
          loading={btnGoogleLoading}
          block
          onClick={() => handleLoginProvider("google")}
          rounded
          variant="outline"
        />
      </div>

      {errorLoginProvider && (
        <small className="overflow-x-hidden block text-left text-red-600 mt-3 ml-1 text-sm">
          {errorLoginProvider}
        </small>
      )}
    </>
  );
};

Index.getLayout = function getLayout(page: any) {
  return <LayoutAuth title={"Masuk"}>{page}</LayoutAuth>;
};

export default Index;
