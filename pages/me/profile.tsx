import { useAuthContext } from "@/contexts/Auth.context";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useEffect } from "react";
import {
    ButtonComponent,
    CardComponent,
    BottomNavComponent,
    FormSupervisionComponent,
} from "@/components/base.components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSave,
    faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useGetApi, auth } from "@/utils";

const ProfilePage = () => {
    const router = useRouter();
    const { user, setUser, accessToken } = useAuthContext();

    // Validate authentication
    useEffect(() => {
        if (!router.isReady) return;
        
        if (!accessToken) {
            auth.deleteAccessToken();
            router.push('/login');
        }
    }, [accessToken, router.isReady]);

    // Fetch customer profile
    const {
        loading: profileLoading,
        data: profileData,
    } = useGetApi({
        path: "customer/profile",
        method: "GET",
    });

    // Update user context when profile loads
    useEffect(() => {
        if (profileData && !profileLoading) {
            // profileData expected shape: { message, data: { id, name, email, phone, address } }
            const pd = profileData?.data ?? profileData;
            setUser((prev: any) => ({
                ...prev,
                ...pd,
            }));
        }
    }, [profileData, profileLoading, setUser]);

    const profile = profileData?.data ?? user;

    return (
        <>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                    <div className="flex items-center mb-4">
                        <Link
                            href={`/me/${user?.id}`}
                            className="mr-4 hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Profil Saya</h1>
                            <p className="text-blue-100 text-sm">
                                Kelola informasi profil Anda
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="p-4">
                    <CardComponent className="p-6">
                        {profileLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="skeleton-loading h-16 rounded"></div>
                                ))}
                            </div>
                        ) : (
                            <FormSupervisionComponent
                                submitControl={{
                                    path: "customer/profile",
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                }}
                                onSuccess={(response: any) => {
                                    if (response?.data) {
                                        setUser((prev: any) => ({
                                            ...prev,
                                            ...response.data,
                                        }));
                                    }
                                }}
                                defaultValue={{
                                    name: profile?.name || "",
                                    email: profile?.email || "",
                                    phone: profile?.phone || "",
                                    address: profile?.address || "",
                                }}
                                forms={[
                                    {
                                        construction: {
                                            name: "name",
                                            label: "Nama Lengkap",
                                            placeholder: "Masukkan nama lengkap Anda",
                                            required: true,
                                        },
                                    },
                                    {
                                        construction: {
                                            type: "email",
                                            name: "email",
                                            label: "Email",
                                            placeholder: "Masukkan email Anda",
                                            required: true,
                                        },
                                    },
                                    {
                                        construction: {
                                            type: "tel",
                                            name: "phone",
                                            label: "Nomor Telepon",
                                            placeholder: "Contoh: 081234567890",
                                        },
                                    },
                                    {
                                        construction: {
                                            name: "address",
                                            label: "Alamat",
                                            placeholder: "Masukkan alamat lengkap Anda",
                                        },
                                    },
                                    {
                                        construction: {
                                            type: "password",
                                            name: "password",
                                            label: "Password Baru (Opsional)",
                                            placeholder: "Kosongkan jika tidak ingin mengubah password",
                                        },
                                    },
                                    {
                                        construction: {
                                            type: "password",
                                            name: "password_confirmation",
                                            label: "Konfirmasi Password Baru",
                                            placeholder: "Ulangi password baru",
                                        },
                                    },
                                ]}
                                footerControl={({ loading }) => (
                                    <div className="flex flex: any-col sm:flex-row gap-3 mt-6">
                                        <Link href={`/me/${user?.id}`} className="flex-1">
                                            <ButtonComponent
                                                type="button"
                                                label="Batal"
                                                variant="outline"
                                                className="w-full"
                                            />
                                        </Link>
                                        <ButtonComponent
                                            type="submit"
                                            label="Simpan Perubahan"
                                            icon={faSave}
                                            loading={loading}
                                            paint="primary"
                                            className="flex-1"
                                        />
                                    </div>
                                )}
                            />
                        )}
                    </CardComponent>

                    {/* Info Card */}
                    <CardComponent className="p-4 mt-4 bg-blue-50 border-blue-200">
                        <div className="flex items-start gap-3">
                            <div className="text-blue-600 mt-1">
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 text-sm">
                                    Tips Keamanan
                                </h3>
                                <p className="text-blue-800 text-xs mt-1">
                                    Pastikan email dan nomor telepon Anda aktif untuk menerima
                                    notifikasi tentang servis kendaraan Anda. Gunakan password
                                    yang kuat untuk keamanan akun.
                                </p>
                            </div>
                        </div>
                    </CardComponent>
                </div>
            </div>

            <BottomNavComponent />
        </>
    );
};

export default ProfilePage;
