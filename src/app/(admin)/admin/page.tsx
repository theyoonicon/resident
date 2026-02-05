"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, UserPlus } from "lucide-react";

interface Stats {
  totalUsers: number;
  pendingVerifications: number;
  recentUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const cards = [
    {
      label: "전체 사용자",
      value: stats?.totalUsers ?? "-",
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "인증 대기",
      value: stats?.pendingVerifications ?? "-",
      icon: ShieldCheck,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "최근 가입 (7일)",
      value: stats?.recentUsers ?? "-",
      icon: UserPlus,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">대시보드</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-card rounded-sm border border-border p-5 flex items-center gap-4"
          >
            <div className={`p-3 rounded-sm ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
