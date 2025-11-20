import { ButtonComponent, CardComponent, FormSupervisionComponent } from "@components/.";
import { useAuthContext } from "@contexts/Auth.context";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { encryption, token_cookie_name } from "@/utils";

export default function Login() {
  const [errorLogin, setErrorLogin] = useState("");
  const router = useRouter();
  const { setAccessToken, setUser } = useAuthContext();

  const formInputs = [
    {
      construction: {
        id: "input-email",
        name: "email",
        label: "E-mail",
        placeholder: "Ex: john@doe.com",
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
    // console.log('test');
    console.log("🚀 ~ Login ~ res:", res);

    Cookies.set(token_cookie_name, encryption.set(res?.access_token), {
      expires: 365,
    });

    setAccessToken(res?.access_token);
    setUser(res?.user);


    // Use res directly since it's available
    if (res?.user?.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/mechanic/task");
    }
  }

  const renderFooter = (formState: any) => (
    <ButtonComponent
      type="submit"
      label="Login Now"
      block
      loading={formState?.loading}
      className="mt-4"
    />
  );

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-extrabold italic">
        YUDHA MOTOR ADMIN
      </h1>
      <p className="text-sm font-semibold mt-6">Masuk Dengan Email Terdaftar</p>
      {errorLogin && (
        <p className="text-sm font-semibold mt-6">{errorLogin}</p>
      )}

      <CardComponent className="mt-4 p-6 w-[400px] rounded-2xl">
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
        />
      </CardComponent>
    </div>
  );
}
