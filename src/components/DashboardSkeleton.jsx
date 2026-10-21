// Skeleton loader shown while the dashboard data is loading.
// Uses the .skeleton-box shimmer class defined in index.css.

function Box({ className = '' }) {
  return <div className={`skeleton-box ${className}`} />;
}

function BalanceSkeleton() {
  return (
    <div className="xl:col-span-2 balance-card rounded-[28px] p-6 lg:p-8 relative overflow-hidden">
      <div className="card-blob card-blob-1" />
      <div className="card-blob card-blob-2" />
      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className="space-y-2">
          <Box className="h-3 w-24 rounded-md" />
          <Box className="h-6 w-40 rounded-md" />
        </div>
        <div className="space-y-2 text-right">
          <Box className="h-5 w-20 rounded-md ml-auto" />
          <Box className="h-3 w-28 rounded-md ml-auto" />
        </div>
      </div>
      <div className="relative z-10 space-y-3 mb-6">
        <Box className="h-3 w-24 rounded-md" />
        <Box className="h-10 w-48 rounded-md" />
        <Box className="h-6 w-36 rounded-md" />
      </div>
      <div className="relative z-10 grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Box key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="glass-card rounded-3xl p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <Box className="h-3 w-16 rounded-md" />
          <Box className="h-5 w-16 rounded-full" />
        </div>
        <Box className="h-6 w-32 rounded-md mb-4" />
        <div className="flex gap-2">
          <Box className="h-10 flex-1 rounded-xl" />
          <Box className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-2">
          <Box className="h-4 w-20 rounded-md" />
          <Box className="h-5 w-14 rounded-full" />
        </div>
        <Box className="h-7 w-28 rounded-md mt-2" />
        <Box className="h-3 w-24 rounded-md mt-1" />
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Box className="w-8 h-8 rounded-xl" />
            <Box className="h-3 w-16 rounded-md" />
          </div>
          <Box className="h-6 w-24 rounded-md mb-1" />
          <Box className="h-3 w-20 rounded-md mb-3" />
          <Box className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

function SnapshotSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="space-y-1.5">
          <Box className="h-2.5 w-24 rounded-md" />
          <Box className="h-5 w-48 rounded-md" />
        </div>
        <Box className="h-6 w-28 rounded-full" />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="stat-card rounded-2xl p-4 space-y-2">
            <Box className="h-3 w-16 rounded-md" />
            <Box className="h-5 w-20 rounded-md" />
            <Box className="h-3 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TxSkeleton() {
  return (
    <div className="xl:col-span-3 glass-card rounded-3xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1.5">
          <Box className="h-4 w-28 rounded-md" />
          <Box className="h-3 w-40 rounded-md" />
        </div>
        <Box className="h-4 w-12 rounded-md" />
      </div>
      <Box className="h-9 w-full rounded-xl mb-3" />
      <div className="flex gap-2 mb-4">
        {[...Array(4)].map((_, i) => <Box key={i} className="h-7 w-20 rounded-xl" />)}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-1">
            <Box className="w-9 h-9 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Box className="h-3.5 w-36 rounded-md" />
              <Box className="h-2.5 w-24 rounded-md" />
            </div>
            <div className="text-right space-y-1.5">
              <Box className="h-3.5 w-16 rounded-md ml-auto" />
              <Box className="h-4 w-14 rounded-full ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Balance + Account row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <BalanceSkeleton />
        <AccountSkeleton />
      </div>

      {/* Stats row */}
      <StatsSkeleton />

      {/* Snapshot + Quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
        <SnapshotSkeleton />
        <div className="glass-card rounded-3xl p-5">
          <div className="space-y-2 mb-4">
            <Box className="h-2.5 w-20 rounded-md" />
            <Box className="h-5 w-32 rounded-md" />
          </div>
          <div className="mt-4 space-y-2">
            {[...Array(3)].map((_, i) => <Box key={i} className="h-16 w-full rounded-2xl" />)}
          </div>
        </div>
      </div>

      {/* Portfolio + Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-2 glass-card rounded-3xl p-5">
          <Box className="h-4 w-24 rounded-md mb-1" />
          <Box className="h-3 w-40 rounded-md mb-5" />
          <Box className="h-44 w-full rounded-2xl" />
        </div>
        <TxSkeleton />
      </div>
    </div>
  );
}
