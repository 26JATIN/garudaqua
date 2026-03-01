"use client";
import { Suspense } from "react";
import AdminLayout from "../../components/AdminLayout";
import BlogManagement from "../../components/BlogManagement";

export default function AdminBlogsPage() {
    return (
        <AdminLayout>
            <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading blog management...</div>}>
                <BlogManagement />
            </Suspense>
        </AdminLayout>
    );
}
