"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";

const STORAGE_KEY = "garudaqua_enquiries";

interface Enquiry {
    _id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    product: string;
    quantity: string;
    message: string;
    createdAt: string;
    status: "new" | "contacted" | "closed";
}

const STATUS_COLORS: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    closed: "bg-gray-100 text-gray-600",
};

export default function AdminEnquiriesPage() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            setEnquiries(stored ? JSON.parse(stored) : []);
        } catch {
            setEnquiries([]);
        }
        setLoading(false);
    }, []);

    const saveEnquiries = (updated: Enquiry[]) => {
        setEnquiries(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const updateStatus = (id: string, status: Enquiry["status"]) => {
        saveEnquiries(enquiries.map((e) => (e._id === id ? { ...e, status } : e)));
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this enquiry?")) return;
        saveEnquiries(enquiries.filter((e) => e._id !== id));
    };

    const filtered = enquiries.filter((e) => statusFilter === "all" || e.status === statusFilter);

    const newCount = enquiries.filter((e) => e.status === "new").length;

    if (loading) {
        return (
            <AdminLayout>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded" />
                    <div className="h-64 bg-gray-200 rounded-xl" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Enquiries
                            {newCount > 0 && (
                                <span className="ml-2 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                                    {newCount} new
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-600 mt-1">Manage product enquiries from customers</p>
                    </div>
                    <div className="flex gap-2">
                        {["all", "new", "contacted", "closed"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    statusFilter === s
                                        ? "bg-[#0EA5E9] text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Enquiry List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500">No enquiries found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filtered.map((enq) => (
                                <div key={enq._id} className="hover:bg-gray-50 transition">
                                    {/* Summary row */}
                                    <div
                                        className="flex items-center gap-4 p-4 cursor-pointer"
                                        onClick={() => setExpandedId(expandedId === enq._id ? null : enq._id)}
                                    >
                                        {/* Status dot */}
                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                            enq.status === "new" ? "bg-blue-500" : enq.status === "contacted" ? "bg-yellow-500" : "bg-gray-400"
                                        }`} />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900">{enq.name}</span>
                                                {enq.company && (
                                                    <span className="text-xs text-gray-500">({enq.company})</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {enq.product && <span className="font-medium text-[#0EA5E9]">{enq.product}</span>}
                                                {enq.quantity && <span className="ml-2">Qty: {enq.quantity}</span>}
                                            </div>
                                        </div>

                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[enq.status]}`}>
                                            {enq.status}
                                        </span>

                                        <span className="text-xs text-gray-400 shrink-0">
                                            {new Date(enq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>

                                        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expandedId === enq._id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {/* Expanded details */}
                                    {expandedId === enq._id && (
                                        <div className="px-4 pb-4 pt-0 ml-6.5 border-l-2 border-gray-200">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                                <div>
                                                    <span className="text-xs text-gray-500">Phone</span>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        <a href={`tel:${enq.phone}`} className="text-[#0EA5E9] hover:underline">{enq.phone}</a>
                                                    </p>
                                                </div>
                                                {enq.email && (
                                                    <div>
                                                        <span className="text-xs text-gray-500">Email</span>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            <a href={`mailto:${enq.email}`} className="text-[#0EA5E9] hover:underline">{enq.email}</a>
                                                        </p>
                                                    </div>
                                                )}
                                                {enq.product && (
                                                    <div>
                                                        <span className="text-xs text-gray-500">Product</span>
                                                        <p className="text-sm font-medium text-gray-900">{enq.product}</p>
                                                    </div>
                                                )}
                                                {enq.quantity && (
                                                    <div>
                                                        <span className="text-xs text-gray-500">Quantity</span>
                                                        <p className="text-sm font-medium text-gray-900">{enq.quantity}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {enq.message && (
                                                <div className="mb-4">
                                                    <span className="text-xs text-gray-500">Message</span>
                                                    <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg">{enq.message}</p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2">
                                                {enq.status !== "contacted" && (
                                                    <button
                                                        onClick={() => updateStatus(enq._id, "contacted")}
                                                        className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-medium hover:bg-yellow-200 transition"
                                                    >
                                                        Mark Contacted
                                                    </button>
                                                )}
                                                {enq.status !== "closed" && (
                                                    <button
                                                        onClick={() => updateStatus(enq._id, "closed")}
                                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition"
                                                    >
                                                        Close
                                                    </button>
                                                )}
                                                {enq.status === "closed" && (
                                                    <button
                                                        onClick={() => updateStatus(enq._id, "new")}
                                                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition"
                                                    >
                                                        Reopen
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(enq._id)}
                                                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
