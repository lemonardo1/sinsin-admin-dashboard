"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "./StatCard";
import { TimeSeriesChart, CKDPieChart } from "./ChartCard";

interface Stats {
  dailySignups: { date: string; count: number }[];
  totalUsers: {
    total: number;
    users: number;
    doctors: number;
    admins: number;
  };
  activeUsers: { count: number };
  dailyDietRecords: { date: string; count: number }[];
  dailyChatMessages: { date: string; count: number }[];
  ckdDistribution: { stage: string; count: number }[];
  topUsersByDiet: {
    nick_name: string;
    email: string;
    record_count: number;
  }[];
  recentWithdrawals: {
    date: string;
    count: number;
    reasons: string[];
  }[];
  dailyWeightRecords: { date: string; count: number }[];
  communityPostStats: { date: string; count: number }[];
  recentSignupUsers: {
    email: string;
    nick_name: string;
    role: string;
    signup_date: string;
  }[];
}

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/stats?days=${days}`);
      if (res.status === 401) {
        onLogout();
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "데이터를 불러오는 데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [days, onLogout]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    onLogout();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">데이터 로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const totalSignups = stats.dailySignups.reduce(
    (sum, d) => sum + Number(d.count),
    0
  );
  const totalDietRecords = stats.dailyDietRecords.reduce(
    (sum, d) => sum + Number(d.count),
    0
  );
  const totalWithdrawals = stats.recentWithdrawals.reduce(
    (sum, d) => sum + Number(d.count),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              신신당부 관리자 대시보드
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Sinsin Admin Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
            >
              <option value={7}>최근 7일</option>
              <option value={14}>최근 14일</option>
              <option value={30}>최근 30일</option>
              <option value={60}>최근 60일</option>
              <option value={90}>최근 90일</option>
            </select>
            <button
              onClick={fetchStats}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
            >
              새로고침
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-gray-500 text-sm hover:text-red-600 transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="전체 유저"
            value={Number(stats.totalUsers.total)}
            subtitle={`일반 ${stats.totalUsers.users} / 의사 ${stats.totalUsers.doctors}`}
            color="blue"
          />
          <StatCard
            title="활성 유저 (7일)"
            value={Number(stats.activeUsers.count)}
            subtitle="식단 기록 기준"
            color="green"
          />
          <StatCard
            title={`신규 가입 (${days}일)`}
            value={totalSignups}
            color="purple"
          />
          <StatCard
            title={`식단 기록 (${days}일)`}
            value={totalDietRecords}
            color="orange"
          />
          <StatCard
            title={`탈퇴 (${days}일)`}
            value={totalWithdrawals}
            color="red"
          />
          <StatCard
            title="관리자"
            value={Number(stats.totalUsers.admins)}
            color="cyan"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimeSeriesChart
            title="날짜별 신규 가입자"
            data={stats.dailySignups}
            color="#8b5cf6"
          />
          <TimeSeriesChart
            title="날짜별 식단 기록"
            data={stats.dailyDietRecords}
            color="#f59e0b"
            type="bar"
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimeSeriesChart
            title="날짜별 채팅 메시지 (유저)"
            data={stats.dailyChatMessages}
            color="#10b981"
          />
          <TimeSeriesChart
            title="날짜별 체중 기록"
            data={stats.dailyWeightRecords}
            color="#3b82f6"
            type="bar"
          />
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimeSeriesChart
            title="날짜별 커뮤니티 게시글"
            data={stats.communityPostStats}
            color="#ec4899"
            type="bar"
          />
          <CKDPieChart data={stats.ckdDistribution} />
        </div>

        {/* Recent Signups Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            신규 가입 유저 ({days}일)
          </h3>
          {stats.recentSignupUsers.length === 0 ? (
            <p className="text-gray-400 text-sm">
              최근 {days}일 내 신규 가입자가 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">이메일</th>
                    <th className="pb-2 font-medium">닉네임</th>
                    <th className="pb-2 font-medium">역할</th>
                    <th className="pb-2 font-medium">가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSignupUsers.map((user, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-gray-400">{i + 1}</td>
                      <td className="py-2 text-gray-800 font-medium">
                        {user.email}
                      </td>
                      <td className="py-2 text-gray-600">
                        {user.nick_name || "-"}
                      </td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "DOCTOR"
                              ? "bg-blue-100 text-blue-700"
                              : user.role === "admin"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-2 text-gray-500">
                        {new Date(user.signup_date).toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Users by Diet */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              식단 기록 Top 10 유저
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">닉네임</th>
                  <th className="pb-2 font-medium">이메일</th>
                  <th className="pb-2 font-medium text-right">기록 수</th>
                </tr>
              </thead>
              <tbody>
                {stats.topUsersByDiet.map((user, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 text-gray-400">{i + 1}</td>
                    <td className="py-2 text-gray-800 font-medium">
                      {user.nick_name}
                    </td>
                    <td className="py-2 text-gray-500">{user.email}</td>
                    <td className="py-2 text-right font-semibold text-orange-600">
                      {Number(user.record_count).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Withdrawals */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              최근 탈퇴 현황
            </h3>
            {stats.recentWithdrawals.length === 0 ? (
              <p className="text-gray-400 text-sm">
                최근 {days}일 내 탈퇴 기록이 없습니다.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">날짜</th>
                    <th className="pb-2 font-medium text-right">인원</th>
                    <th className="pb-2 font-medium">사유</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentWithdrawals.map((w, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-gray-600">
                        {new Date(w.date).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="py-2 text-right font-semibold text-red-600">
                        {Number(w.count)}
                      </td>
                      <td className="py-2 text-gray-500 text-xs">
                        {w.reasons
                          ?.filter(Boolean)
                          .slice(0, 3)
                          .join(", ") || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
