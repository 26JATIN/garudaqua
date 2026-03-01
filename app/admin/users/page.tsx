"use client";
import AdminLayout from "../../components/AdminLayout";

export default function UsersPage() {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-600 mt-1">User management coming soon</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <p className="text-gray-500 text-sm">This section is not yet available.</p>
                </div>
            </div>
        </AdminLayout>
    );
}
