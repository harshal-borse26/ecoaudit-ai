import React from "react";

export const Skeleton = ({ className = "", style = {} }) => {
  return (
    <div
      className={`animate-pulse bg-[#EEEDDF] rounded-xl border border-[#DDDDD0]/60 ${className}`}
      style={style}
    />
  );
};

export const SkeletonPageHeader = () => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 animate-pulse">
    <div>
      <div className="h-7 w-64 bg-[#EEEDDF] rounded-xl mb-2 border border-[#DDDDD0]/60" />
      <div className="h-4 w-96 bg-[#EEEDDF] rounded-lg border border-[#DDDDD0]/40" />
    </div>
    <div className="flex items-center gap-3">
      <div className="h-9 w-24 bg-[#EEEDDF] rounded-2xl border border-[#DDDDD0]/60" />
      <div className="h-9 w-32 bg-[#EEEDDF] rounded-2xl border border-[#DDDDD0]/60" />
    </div>
  </div>
);

export const SkeletonKpiGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-[#F7F6EE] border border-[#DDDDD0] rounded-[24px] p-6 flex flex-col justify-between min-h-[168px] animate-pulse"
      >
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="h-3 w-28 bg-[#EEEDDF] rounded-md" />
            <div className="w-10 h-10 rounded-2xl bg-[#EEEDDF]" />
          </div>
          <div className="h-8 w-36 bg-[#EEEDDF] rounded-xl mb-2" />
        </div>
        <div>
          <div className="h-[3px] rounded-full bg-[#EEEDDF] mb-3" />
          <div className="flex justify-between items-center">
            <div className="h-3 w-24 bg-[#EEEDDF] rounded-md" />
            <div className="h-3 w-16 bg-[#EEEDDF] rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonDashboardCharts = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch mb-7">
    <div className="lg:col-span-2 bg-[#F7F6EE] border border-[#DDDDD0] rounded-[24px] p-6 min-h-[380px] animate-pulse flex flex-col justify-between">
      <div className="flex justify-between items-center mb-6">
        <div className="h-5 w-48 bg-[#EEEDDF] rounded-lg" />
        <div className="h-8 w-36 bg-[#EEEDDF] rounded-xl" />
      </div>
      <div className="h-52 w-full bg-[#EEEDDF]/60 rounded-2xl border border-[#DDDDD0]/40 flex items-center justify-center">
        <div className="w-full h-full p-4 flex items-end justify-between gap-2 opacity-50">
          {[40, 65, 30, 85, 55, 70, 95, 60, 75, 50].map((h, idx) => (
            <div key={idx} className="w-full bg-[#DDDDD0] rounded-t-lg" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
    <div className="bg-[#F7F6EE] border border-[#DDDDD0] rounded-[24px] p-6 min-h-[380px] animate-pulse flex flex-col justify-between">
      <div className="mb-6">
        <div className="h-4 w-36 bg-[#EEEDDF] rounded-lg mb-2" />
        <div className="h-3 w-48 bg-[#EEEDDF] rounded-md" />
      </div>
      <div className="space-y-4 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-[#EEEDDF] rounded" />
              <div className="h-3 w-10 bg-[#EEEDDF] rounded" />
            </div>
            <div className="h-2.5 w-full bg-[#EEEDDF] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonTableRows = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-[#F7F6EE] border border-[#DDDDD0] rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse"
      >
        <div className="flex items-center gap-3.5 flex-1">
          <div className="w-10 h-10 rounded-xl bg-[#EEEDDF] shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-44 bg-[#EEEDDF] rounded-lg" />
            <div className="h-3 w-64 bg-[#EEEDDF] rounded-md" />
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end space-y-1.5">
          <div className="h-4 w-20 bg-[#EEEDDF] rounded-md" />
          <div className="h-3 w-16 bg-[#EEEDDF] rounded-md" />
        </div>
        <div className="h-8 w-24 bg-[#EEEDDF] rounded-xl shrink-0" />
      </div>
    ))}
  </div>
);

export default Skeleton;
