"use client";
import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StatusData {
  configured: boolean;
  merchantId: string | null;
  listedProducts: number;
  error: string | null;
}

interface SyncResult {
  offerId: string;
  ok: boolean;
  error?: string;
  action?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  image: string;
  category: { name: string } | null;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusCard({ status, loading }: { status: StatusData | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
        <div className="h-8 w-48 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className={`rounded-2xl border shadow-sm p-6 ${status.configured && !status.error ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Connection Status</p>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${status.configured && !status.error ? "bg-green-500" : "bg-amber-500"}`} />
            <span className="font-semibold text-gray-900">
              {status.configured && !status.error ? "Connected" : "Not Connected"}
            </span>
          </div>
          {status.merchantId && (
            <p className="text-xs text-gray-500 mt-1">Merchant ID: {status.merchantId}</p>
          )}
          {status.error && (
            <p className="text-xs text-red-600 mt-2 max-w-sm">{status.error}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-600 mb-1">Listed Products</p>
          <p className="text-3xl font-bold text-gray-900">{status.listedProducts}</p>
        </div>
      </div>
    </div>
  );
}

function SetupGuide() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-blue-900">Setup Required</h2>
      </div>
      <p className="text-sm text-blue-800 mb-4">
        Add these 3 environment variables to your <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> file to enable Google Merchant Center sync:
      </p>
      <div className="bg-white/70 rounded-xl p-4 font-mono text-xs space-y-2 border border-blue-100">
        <p><span className="text-purple-600">GOOGLE_MERCHANT_ID</span>=<span className="text-gray-500">"123456789"</span></p>
        <p><span className="text-purple-600">GOOGLE_SERVICE_ACCOUNT_EMAIL</span>=<span className="text-gray-500">"service@project.iam.gserviceaccount.com"</span></p>
        <p><span className="text-purple-600">GOOGLE_SERVICE_ACCOUNT_KEY</span>=<span className="text-gray-500">"base64-encoded-private-key-pem"</span></p>
        <p><span className="text-purple-600">NEXT_PUBLIC_SITE_URL</span>=<span className="text-gray-500">"https://www.garudaqua.in"</span></p>
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-blue-800">How to encode your service account key:</p>
        <div className="bg-white/70 rounded-xl p-3 font-mono text-xs border border-blue-100 text-gray-700">
          base64 -w 0 service-account.json
        </div>
        <p className="text-xs text-blue-700">
          Then grant the service account <strong>Standard access</strong> in Merchant Center → Settings → Account access.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MerchantPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
  const [productSyncing, setProductSyncing] = useState<Record<string, boolean>>({});

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await fetch("/api/merchant/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      toast.error("Failed to load Merchant Center status");
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchProducts();
  }, [fetchStatus, fetchProducts]);

  // ── Bulk sync ──
  const handleBulkSync = async () => {
    if (!confirm(`Sync all ${products.filter(p => p.isActive).length} active products to Google Merchant Center?`)) return;
    setSyncing(true);
    setSyncResults(null);
    try {
      const res = await fetch("/api/merchant/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      toast.success(`Synced ${data.synced}/${data.total} products successfully`);
      setSyncResults(data.errors?.length ? data.errors : []);
      fetchStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      toast.error(msg);
    } finally {
      setSyncing(false);
    }
  };

  // ── Per-product sync ──
  const handleSyncProduct = async (product: Product) => {
    setProductSyncing((prev) => ({ ...prev, [product.id]: true }));
    try {
      const res = await fetch(`/api/merchant/product/${product.id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      toast.success(`"${product.name}" synced to Merchant Center`);
      fetchStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      toast.error(`Failed: ${msg}`);
    } finally {
      setProductSyncing((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // ── Per-product remove ──
  const handleRemoveProduct = async (product: Product) => {
    if (!confirm(`Remove "${product.name}" from Google Merchant Center?`)) return;
    setProductSyncing((prev) => ({ ...prev, [product.id]: true }));
    try {
      const res = await fetch(`/api/merchant/product/${product.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Remove failed");
      toast.success(`"${product.name}" removed from Merchant Center`);
      fetchStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Remove failed";
      toast.error(`Failed: ${msg}`);
    } finally {
      setProductSyncing((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const activeProducts = products.filter((p) => p.isActive);
  const inactiveProducts = products.filter((p) => !p.isActive);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC05] rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Google Merchant Center</h1>
            </div>
            <p className="text-gray-500 text-sm">
              Sync your products to Google Shopping for free discovery across Search, Maps & more.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={fetchStatus}
              disabled={statusLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              {statusLoading ? "Checking…" : "↻ Refresh"}
            </button>
            <button
              onClick={handleBulkSync}
              disabled={syncing || !status?.configured}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#0EA5E9] to-[#0369A1] rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-sm"
            >
              {syncing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Syncing…
                </span>
              ) : (
                `⇡ Sync All (${activeProducts.length})`
              )}
            </button>
          </div>
        </div>

        {/* Status Card */}
        <StatusCard status={status} loading={statusLoading} />

        {/* Setup Guide — only shown when not configured */}
        {!statusLoading && status && !status.configured && <SetupGuide />}

        {/* Sync Results */}
        {syncResults !== null && (
          <div className={`rounded-2xl border p-5 ${syncResults.length === 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <h3 className="font-semibold text-gray-900 mb-2">
              {syncResults.length === 0 ? "✅ All products synced successfully!" : `⚠️ ${syncResults.length} product(s) failed`}
            </h3>
            {syncResults.length > 0 && (
              <ul className="space-y-1 max-h-48 overflow-y-auto text-sm">
                {syncResults.map((r) => (
                  <li key={r.offerId} className="flex items-start gap-2 text-red-700">
                    <span className="font-mono shrink-0">{r.offerId}:</span>
                    <span>{r.error}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Products", value: products.length, color: "bg-gray-50 border-gray-200" },
            { label: "Active (Syncable)", value: activeProducts.length, color: "bg-green-50 border-green-200" },
            { label: "Inactive", value: inactiveProducts.length, color: "bg-gray-50 border-gray-200" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} border rounded-2xl p-4`}>
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Products</h2>
            <span className="text-xs text-gray-400">{products.length} total</span>
          </div>

          {productsLoading ? (
            <div className="p-8 text-center text-gray-400">
              <svg className="animate-spin w-8 h-8 mx-auto mb-2 text-[#0EA5E9]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading products…
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No products found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-6 py-3">Product</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Offer ID</th>
                    <th className="text-right px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => {
                    const isBusy = productSyncing[product.id];
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <span className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500">
                          {product.category?.name || "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <code className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                            {product.slug}
                          </code>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSyncProduct(product)}
                              disabled={isBusy || !status?.configured}
                              title="Push to Merchant Center"
                              className="px-3 py-1.5 text-xs font-medium text-[#0EA5E9] border border-[#0EA5E9]/30 bg-blue-50 rounded-lg hover:bg-blue-100 transition disabled:opacity-40"
                            >
                              {isBusy ? "…" : "↑ Sync"}
                            </button>
                            <button
                              onClick={() => handleRemoveProduct(product)}
                              disabled={isBusy || !status?.configured}
                              title="Remove from Merchant Center"
                              className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-40"
                            >
                              {isBusy ? "…" : "✕"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help footer */}
        <div className="text-xs text-gray-400 text-center pb-4">
          Products are listed under <strong>Content Language: en · Target Country: IN · Brand: Garud Aqua</strong>.
          Listings may take up to 3 business days to appear in Google Shopping.
        </div>
      </div>
    </AdminLayout>
  );
}
