"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

interface Enquiry {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    product: string;
    quantity: string;
    message: string;
    createdAt: string;
    updatedAt: string;
    status: "NEW" | "CONTACTED" | "CLOSED";
}

// Map API uppercase status to lowercase display value
const statusToDisplay = (status: Enquiry["status"]): string => {
    return status.toLowerCase();
};

// Map lowercase display value to API uppercase status
const displayToStatus = (display: string): Enquiry["status"] => {
    return display.toUpperCase() as Enquiry["status"];
};

const STATUS_COLORS: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    closed: "bg-gray-100 text-gray-600",
};

export default function AdminEnquiriesPage() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchEnquiries = useCallback(async () => {
        try {
            setError(null);
            const res = await fetch("/api/admin/enquiries");
            if (!res.ok) {
                throw new Error(`Failed to fetch enquiries: ${res.statusText}`);
            }
            const data = await res.json();
            setEnquiries(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load enquiries";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEnquiries();
    }, [fetchEnquiries]);

    const updateStatus = async (id: string, status: Enquiry["status"]) => {
        // Optimistic update
        const previousEnquiries = [...enquiries];
        setEnquiries(enquiries.map((e) => (e.id === id ? { ...e, status } : e)));

        try {
            const res = await fetch(`/api/admin/enquiries/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) {
                throw new Error(`Failed to update status: ${res.statusText}`);
            }
            const updated = await res.json();
            setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
            toast.success(`Status updated to ${statusToDisplay(status)}`);
        } catch (err) {
            // Rollback on failure
            setEnquiries(previousEnquiries);
            const message = err instanceof Error ? err.message : "Failed to update status";
            toast.error(message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this enquiry?")) return;

        // Optimistic update
        const previousEnquiries = [...enquiries];
        setEnquiries(enquiries.filter((e) => e.id !== id));

        try {
            const res = await fetch(`/api/admin/enquiries/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error(`Failed to delete enquiry: ${res.statusText}`);
            }
            toast.success("Enquiry deleted");
            // Collapse if the deleted item was expanded
            if (expandedId === id) {
                setExpandedId(null);
            }
        } catch (err) {
            // Rollback on failure
            setEnquiries(previousEnquiries);
            const message = err instanceof Error ? err.message : "Failed to delete enquiry";
            toast.error(message);
        }
    };

    const filtered = enquiries.filter(
        (e) => statusFilter === "all" || statusToDisplay(e.status) === statusFilter
    );

    const newCount = enquiries.filter((e) => e.status === "NEW").length;

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

    if (error && enquiries.length === 0) {
        return (
            <AdminLayout>
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-gray-700 font-medium mb-2">Failed to load enquiries</p>
                        <p className="text-gray-500 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => {
                                setLoading(true);
                                fetchEnquiries();
                            }}
                            className="px-4 py-2 bg-[#0EA5E9] text-white rounded-lg text-sm font-medium hover:bg-[#0d94d1] transition"
                        >
                            Try Again
                        </button>
                    </div>
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
                                <div key={enq.id} className="hover:bg-gray-50 transition">
                                    {/* Summary row */}
                                    <div
                                        className="flex items-center gap-4 p-4 cursor-pointer"
                                        onClick={() => setExpandedId(expandedId === enq.id ? null : enq.id)}
                                    >
                                        {/* Status dot */}
                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                            enq.status === "NEW" ? "bg-blue-500" : enq.status === "CONTACTED" ? "bg-yellow-500" : "bg-gray-400"
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

                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[statusToDisplay(enq.status)]}`}>
                                            {statusToDisplay(enq.status)}
                                        </span>

                                        <span className="text-xs text-gray-400 shrink-0">
                                            {new Date(enq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>

                                        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expandedId === enq.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {/* Expanded details */}
                                    {expandedId === enq.id && (
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
                                                {enq.status !== "CONTACTED" && (
                                                    <button
                                                        onClick={() => updateStatus(enq.id, "CONTACTED")}
                                                        className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-medium hover:bg-yellow-200 transition"
                                                    >
                                                        Mark Contacted
                                                    </button>
                                                )}
                                                {enq.status !== "CLOSED" && (
                                                    <button
                                                        onClick={() => updateStatus(enq.id, "CLOSED")}
                                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition"
                                                    >
                                                        Close
                                                    </button>
                                                )}
                                                {enq.status === "CLOSED" && (
                                                    <button
                                                        onClick={() => updateStatus(enq.id, "NEW")}
                                                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition"
                                                    >
                                                        Reopen
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(enq.id)}
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
