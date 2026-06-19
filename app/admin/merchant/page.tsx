"use client";
import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

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
}

interface Product {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  image: string;
  category: { name: string } | null;
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Status Card ─────────────────────────────────────────────────────────────

function StatusCard({ status, loading }: { status: StatusData | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
        <div className="h-6 w-36 bg-gray-200 rounded" />
      </div>
    );
  }
  if (!status) return null;

  const ok = status.configured && !status.error;
  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${ok ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Connection Status</p>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ok ? "bg-green-500" : "bg-amber-500"}`} />
            <span className="font-semibold text-gray-900 text-sm">{ok ? "Connected" : "Not Connected"}</span>
          </div>
          {status.merchantId && (
            <p className="text-xs text-gray-500 mt-1">Merchant ID: {status.merchantId}</p>
          )}
          {status.error && (
            <p className="text-xs text-red-600 mt-2 break-words max-w-xs sm:max-w-sm">{status.error}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Listed</p>
          <p className="text-3xl font-bold text-gray-900">{status.listedProducts}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Setup Guide ─────────────────────────────────────────────────────────────

function SetupGuide() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-blue-900">Setup Required</h2>
      </div>
      <p className="text-sm text-blue-800 mb-3">
        Add these env vars to your <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> to enable sync:
      </p>
      <div className="mt-3 w-full min-w-0 overflow-hidden">
        <div className="bg-white/70 rounded-xl p-3 sm:p-4 font-mono text-[10px] sm:text-xs space-y-1.5 border border-blue-100 w-full overflow-x-auto">
          <p className="whitespace-nowrap"><span className="text-purple-600">GOOGLE_MERCHANT_ID</span>=<span className="text-gray-500">&quot;123456789&quot;</span></p>
          <p className="whitespace-nowrap"><span className="text-purple-600">GOOGLE_SERVICE_ACCOUNT_EMAIL</span>=<span className="text-gray-500">&quot;service@project.iam.gserviceaccount.com&quot;</span></p>
          <p className="whitespace-nowrap"><span className="text-purple-600">GOOGLE_SERVICE_ACCOUNT_KEY</span>=<span className="text-gray-500">&quot;base64-encoded-json-key&quot;</span></p>
          <p className="whitespace-nowrap"><span className="text-purple-600">NEXT_PUBLIC_SITE_URL</span>=<span className="text-gray-500">&quot;https://www.garudaqua.in&quot;</span></p>
        </div>
      </div>
      <p className="text-xs text-blue-700 mt-3 break-words">
        Encode key: <code className="bg-blue-100 px-1 rounded">base64 -w 0 service-account.json</code> · Then grant <strong>Standard access</strong> in Merchant Center → Settings → Account access.
      </p>
    </div>
  );
}

// ─── Product Row (desktop table) ─────────────────────────────────────────────

function ProductRow({
  product,
  isBusy,
  configured,
  onSync,
  onRemove,
}: {
  product: Product;
  isBusy: boolean;
  configured: boolean;
  onSync: () => void;
  onRemove: () => void;
}) {
  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-8 h-8 rounded-lg object-cover border border-gray-100 shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <span className="font-medium text-gray-900 text-sm truncate max-w-[160px] lg:max-w-[240px]">{product.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{product.category?.name || "—"}</td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? "bg-green-500" : "bg-gray-400"}`} />
          {product.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={onSync}
            disabled={isBusy || !configured}
            className="px-2.5 py-1.5 text-xs font-medium text-[#0EA5E9] border border-[#0EA5E9]/30 bg-blue-50 rounded-lg hover:bg-blue-100 transition disabled:opacity-40 whitespace-nowrap"
          >
            {isBusy ? <Spinner className="w-3.5 h-3.5" /> : "↑ Sync"}
          </button>
          <button
            onClick={onRemove}
            disabled={isBusy || !configured}
            className="px-2.5 py-1.5 text-xs font-medium text-red-500 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-40"
          >
            {isBusy ? <Spinner className="w-3.5 h-3.5" /> : "✕"}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Product Card (mobile) ────────────────────────────────────────────────────

function ProductCard({
  product,
  isBusy,
  configured,
  onSync,
  onRemove,
}: {
  product: Product;
  isBusy: boolean;
  configured: boolean;
  onSync: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-50 last:border-0">
      {product.image ? (
        <img src={product.image} alt={product.name} className="w-11 h-11 rounded-xl object-cover border border-gray-100 shrink-0" />
      ) : (
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {product.category?.name && (
            <span className="text-xs text-gray-400">{product.category.name}</span>
          )}
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${product.isActive ? "text-green-600" : "text-gray-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? "bg-green-500" : "bg-gray-300"}`} />
            {product.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onSync}
          disabled={isBusy || !configured}
          className="p-2 text-[#0EA5E9] border border-[#0EA5E9]/30 bg-blue-50 rounded-lg hover:bg-blue-100 transition disabled:opacity-40"
          title="Sync to Merchant Center"
        >
          {isBusy ? <Spinner className="w-4 h-4" /> : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
        </button>
        <button
          onClick={onRemove}
          disabled={isBusy || !configured}
          className="p-2 text-red-500 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-40"
          title="Remove from Merchant Center"
        >
          {isBusy ? <Spinner className="w-4 h-4" /> : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MerchantPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
  const [productSyncing, setProductSyncing] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const data = await fetch("/api/merchant/status").then((r) => r.json());
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
      const data = await fetch("/api/admin/products").then((r) => r.json());
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

  const handleBulkSync = async () => {
    const active = products.filter((p) => p.isActive).length;
    if (!confirm(`Sync all ${active} active products to Google Merchant Center?`)) return;
    setSyncing(true);
    setSyncResults(null);
    try {
      const res = await fetch("/api/merchant/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      toast.success(`Synced ${data.synced}/${data.total} products`);
      setSyncResults(data.errors?.length ? data.errors : []);
      fetchStatus();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncProduct = async (product: Product) => {
    setProductSyncing((p) => ({ ...p, [product.id]: true }));
    try {
      const res = await fetch(`/api/merchant/product/${product.id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      toast.success(`"${product.name}" synced`);
      fetchStatus();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setProductSyncing((p) => ({ ...p, [product.id]: false }));
    }
  };

  const handleRemoveProduct = async (product: Product) => {
    if (!confirm(`Remove "${product.name}" from Merchant Center?`)) return;
    setProductSyncing((p) => ({ ...p, [product.id]: true }));
    try {
      const res = await fetch(`/api/merchant/product/${product.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Remove failed");
      toast.success(`"${product.name}" removed`);
      fetchStatus();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setProductSyncing((p) => ({ ...p, [product.id]: false }));
    }
  };

  const activeProducts = products.filter((p) => p.isActive);
  const inactiveProducts = products.filter((p) => !p.isActive);
  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-5 w-full min-w-0 max-w-full overflow-x-hidden sm:overflow-visible pb-10">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC05] rounded-lg flex items-center justify-center shadow-sm shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Google Merchant Center</h1>
            </div>
            <p className="text-gray-500 text-sm">Sync products to Google Shopping for free discovery.</p>
          </div>

          {/* Action buttons — stack on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-2 sm:shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <button
              onClick={fetchStatus}
              disabled={statusLoading}
              className="flex items-center justify-center gap-1.5 px-4 py-2 w-full sm:w-auto text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              {statusLoading ? <Spinner className="w-4 h-4" /> : (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              <span>Refresh</span>
            </button>
            <button
              onClick={handleBulkSync}
              disabled={syncing || !status?.configured}
              className="flex items-center justify-center gap-2 px-5 py-2 w-full sm:w-auto text-sm font-semibold text-white bg-gradient-to-r from-[#0EA5E9] to-[#0369A1] rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-sm"
            >
              {syncing ? (
                <><Spinner className="w-4 h-4 shrink-0" /> <span>Syncing…</span></>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Sync All ({activeProducts.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Status Card ── */}
        <StatusCard status={status} loading={statusLoading} />

        {/* ── Setup Guide ── */}
        {!statusLoading && status && !status.configured && <SetupGuide />}

        {/* ── Sync Results ── */}
        {syncResults !== null && (
          <div className={`rounded-2xl border p-4 ${syncResults.length === 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <p className="font-semibold text-gray-900 text-sm mb-1">
              {syncResults.length === 0 ? "✅ All products synced!" : `⚠️ ${syncResults.length} product(s) failed`}
            </p>
            {syncResults.length > 0 && (
              <ul className="space-y-1 max-h-40 overflow-y-auto text-xs text-red-700">
                {syncResults.map((r) => (
                  <li key={r.offerId} className="flex gap-2">
                    <span className="font-mono shrink-0 opacity-60">{r.offerId}:</span>
                    <span>{r.error}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 min-w-0">
          {[
            { label: "Total", value: products.length },
            { label: "Active", value: activeProducts.length, green: true },
            { label: "Inactive", value: inactiveProducts.length },
          ].map((s) => (
            <div key={s.label} className={`border rounded-2xl p-2 sm:p-4 min-w-0 ${s.green ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">{s.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{s.value}</p>
            </div>
          ))}
        </div>
        {/* ── Products Panel ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
          {/* Panel header + search */}
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 text-sm">Products</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{products.length}</span>
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
              />
            </div>
          </div>

          {productsLoading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-gray-400">
              <Spinner className="w-6 h-6 text-[#0EA5E9]" />
              <span className="text-sm">Loading products…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              {search ? "No products match your search." : "No products found."}
            </div>
          ) : (
            <>
              {/* Desktop table — hidden on mobile */}
              <div className="hidden sm:block overflow-x-auto w-full">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-5 py-3">Product</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-right px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((p) => (
                      <ProductRow
                        key={p.id}
                        product={p}
                        isBusy={!!productSyncing[p.id]}
                        configured={!!status?.configured}
                        onSync={() => handleSyncProduct(p)}
                        onRemove={() => handleRemoveProduct(p)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards — hidden on sm+ */}
              <div className="sm:hidden divide-y divide-gray-50">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isBusy={!!productSyncing[p.id]}
                    configured={!!status?.configured}
                    onSync={() => handleSyncProduct(p)}
                    onRemove={() => handleRemoveProduct(p)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <p className="text-xs text-gray-400 text-center pb-2">
          Listed as <strong>Language: en · Country: IN · Brand: Garud Aqua</strong> · Allow up to 3 days to appear in Google Shopping.
        </p>
      </div>
    </AdminLayout>
  );
}
