import { ButtonComponent, CardComponent, FormSupervisionComponent } from "@components/.";
import { useAuthContext } from "@contexts/Auth.context";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { encryption, token_cookie_name, useForm } from "@/utils";

export default function Login() {
  const [errorLogin, setErrorLogin] = useState("");

  const [{ formControl, submit, loading: submitLoading }] = useForm(
    {
      path: "login",
    },
    false,
    false,
    (res) => {
      Cookies.set(token_cookie_name, encryption.set(res?.access_token), {
        expires: 365,
      });

      window.location.href = "/mechanic/task";
    },
    (res) => {
      if (res == 401) {
        setErrorLogin("Login Gagal, Pastikan Email benar");
      } else {
        setErrorLogin("");
      }
    }
  );

  const router = useRouter();
  const { setAccessToken, setUser,user } = useAuthContext();
console.log(user);
  return (
    <>
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
            forms={[
              {
                construction: {
                  name: "email",
                  label: "E-mail",
                  placeholder: "Ex: example@mail.com",
                  validations: "required|min:10|max:50|email"
                }
              },
              {
                construction: {
                  type: "password",
                  name: "password",
                  label: "Password",
                  placeholder: "Ex: secret123",
                },
              },
            ]}
            submitControl={{
              path: "login",
            }}
            onSuccess={(res) => {
              console.log(res);
              setAccessToken(res?.access_token);
              setUser(res?.user);
              router.push("/mechanic/task");
            }}
            footerControl={() => (
              <>
                <ButtonComponent
                  type="submit"
                  label="Login Now"
                  block
                  loading={submitLoading}
                  className="mt-4"
                />

                {/* <p className="mt-4 text-center">
                  Don&apos;t have an account yet?{" "}
                  <Link
                    href="/auth/register"
                    className="text-primary underline"
                  >
                    Create Account
                  </Link>
                </p> */}
              </>
            )}
          />
        </CardComponent>
      </div>
    </>
  );
}
