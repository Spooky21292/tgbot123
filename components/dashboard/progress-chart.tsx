"use client";

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

export function ProgressChart({ data }: { data: { name: string; progress: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="progress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1e293b" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#1e293b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" />
          <YAxis unit="%" tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" width={36} />
          <Tooltip />
          <Area type="monotone" dataKey="progress" stroke="#1e293b" strokeWidth={2} fill="url(#progress)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
