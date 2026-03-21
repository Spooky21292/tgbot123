"use client";

import { ResponsiveContainer, ComposedChart, Area, Bar, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

export function ProgressChart({ data }: { data: { label: string; lessons: number; active: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 8, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" minTickGap={18} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" width={34} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 16, borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            formatter={(value: number, name: string) => [value, name === 'lessons' ? 'Уроков' : 'Учебных дней']}
          />
          <Bar dataKey="active" name="active" barSize={10} radius={[8, 8, 0, 0]} fill="#93c5fd" />
          <Area type="monotone" dataKey="lessons" name="lessons" stroke="#1d4ed8" strokeWidth={2.5} fill="url(#activityFill)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
