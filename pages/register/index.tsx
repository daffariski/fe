import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import LayoutAuth from "../login/_auth_layout";
import { ButtonComponent } from "../../components/base.components";
import { encryption, token_cookie_name } from "@/utils";
import Cookies from "js-cookie";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorRegister, setErrorRegister] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorRegister("");

        // Validation
        if (password !== passwordConfirmation) {
            setErrorRegister("Password dan konfirmasi password tidak sama");
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setErrorRegister("Password minimal 8 karakter");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                    phone,
                    address,
                }),
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
                setErrorRegister(
                    data.message || "Registrasi gagal, silakan periksa data Anda"
                );
            }
        } catch (error) {
            setErrorRegister("Terjadi kesalahan, silakan coba lagi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-4">
                <p className="">Daftar sebagai pelanggan baru</p>
            </div>

            {errorRegister && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
                    {errorRegister}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm mb-2">Nama Lengkap*</label>
                    <input
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-primary"
                    />
                </div>

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

                <div className="mb-4">
                    <label className="block text-sm mb-2">Password*</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimal 8 karakter"
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

                <div className="mb-4">
                    <label className="block text-sm mb-2">
                        Konfirmasi Password*
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswordConfirmation ? "text" : "password"}
                            placeholder="Ketik ulang password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-primary pr-12"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowPasswordConfirmation(!showPasswordConfirmation)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            <FontAwesomeIcon
                                icon={showPasswordConfirmation ? faEyeSlash : faEye}
                            />
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm mb-2">
                        No. Telepon (opsional)
                    </label>
                    <input
                        type="tel"
                        placeholder="Ex: 08123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-primary"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm mb-2">
                        Alamat (opsional)
                    </label>
                    <textarea
                        placeholder="Masukkan alamat lengkap"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-primary resize-none"
                    />
                </div>

                <ButtonComponent
                    type="submit"
                    label="Daftar"
                    block
                    loading={loading}
                    rounded
                />
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-primary hover:underline font-semibold">
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </>
    );
};

Register.getLayout = function getLayout(page: any) {
    return <LayoutAuth title={"Daftar"}>{page}</LayoutAuth>;
};

export default Register;
