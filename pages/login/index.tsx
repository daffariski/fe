import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import LayoutAuth from "./_auth_layout";
import { ButtonComponent } from "../../components/base.components";
import { encryption, token_cookie_name } from "@/utils";
import Cookies from "js-cookie";

const Index = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [btnGoogleLoading, setBtnGoogleLoading] = useState(false);
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

            // Set token in cookie
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
            setErrorLogin(error || "Gagal masuk!");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorLogin("");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.access_token) {
                // Set token in cookie
                Cookies.set(token_cookie_name, encryption.set(data.access_token), {
                    expires: 365,
                });

                // Redirect customer to their profile page with full reload
                if (data?.user?.id) {
                    window.location.href = `/me/${data.user.id}`;
                }
            } else {
                setErrorLogin("Login gagal, periksa email dan password Anda");
            }
        } catch (error) {
            setErrorLogin("Terjadi kesalahan, silakan coba lagi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-4">
                <p className="">Selamat datang kembali!</p>
            </div>

            {errorLogin && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
                    {errorLogin}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm mb-2">E-mail*</label>
                    <input
                        type="email"
                        placeholder="Ex: customer@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-primary"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm mb-2">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="**********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-primary pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>
                </div>

                <ButtonComponent
                    type="submit"
                    label="Masuk"
                    block
                    loading={loading}
                    rounded
                />
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-400"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-background">Atau masuk dengan</span>
                </div>
            </div>

            <ButtonComponent
                icon={faGoogle}
                label="Google"
                loading={btnGoogleLoading}
                block
                onClick={() => handleLoginProvider("google")}
                rounded
            />

            <div className="mt-6 text-center">
                <p className="text-sm">
                    Belum punya akun?{" "}
                    <Link href="/register" className="text-primary hover:underline font-semibold">
                        Daftar di sini
                    </Link>
                </p>
            </div>
        </>
    );
};

Index.getLayout = function getLayout(page: any) {
    return <LayoutAuth title={"Masuk"}>{page}</LayoutAuth>;
};

export default Index;
