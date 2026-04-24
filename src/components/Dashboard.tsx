"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "./StatCard";
import { TimeSeriesChart, CKDPieChart } from "./ChartCard";

interface Inquiry {
  id: number;
  inquiry_type: string | null;
  name: string;
  contact: string;
  message: string;
  partnership: string[] | null;
  contact_time: string[] | null;
  created_at: string;
}

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
  recentErrors: {
    source: string;
    status_code: number | null;
    method: string | null;
    path: string | null;
    error_code: string | null;
    message: string | null;
    user_id: number | null;
    user_email: string | null;
    user_nick_name: string | null;
    created_at: string;
  }[];
}

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, inquiriesRes] = await Promise.all([
        fetch(`/api/stats?days=${days}`),
        fetch("/api/inquiries"),
      ]);
      if (statsRes.status === 401 || inquiriesRes.status === 401) {
        onLogout();
        return;
      }
      if (!statsRes.ok) throw new Error("Failed to fetch stats");
      const data = await statsRes.json();
      setStats(data);
      if (inquiriesRes.ok) {
        const inqData = await inquiriesRes.json();
        setInquiries(inqData.inquiries ?? []);
      }
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
        {/* Inquiries */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              프로모 웹 문의 목록 (최근 200건)
            </h3>
            <span className="text-xs text-gray-400">총 {inquiries.length}건</span>
          </div>
          {inquiries.length === 0 ? (
            <p className="text-gray-400 text-sm">접수된 문의가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">문의 유형</th>
                    <th className="pb-2 font-medium">제휴분야</th>
                    <th className="pb-2 font-medium">연락 시간</th>
                    <th className="pb-2 font-medium">이름/소속</th>
                    <th className="pb-2 font-medium">연락처</th>
                    <th className="pb-2 font-medium">내용</th>
                    <th className="pb-2 font-medium">접수일시</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => (
                    <tr key={inq.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-1.5 text-gray-400">{inq.id}</td>
                      <td className="py-1.5">
                        {inq.inquiry_type ? (
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            inq.inquiry_type === "제휴문의"
                              ? "bg-green-100 text-green-700"
                              : inq.inquiry_type === "계정 삭제 요청"
                                ? "bg-red-100 text-red-700"
                                : inq.inquiry_type === "개인정보 삭제 요청"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}>
                            {inq.inquiry_type}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">제휴문의</span>
                        )}
                      </td>
                      <td className="py-1.5 text-gray-600">
                        {inq.partnership?.join(", ") || "-"}
                      </td>
                      <td className="py-1.5 text-gray-600">
                        {inq.contact_time?.join(", ") || "-"}
                      </td>
                      <td className="py-1.5 text-gray-800 font-medium">{inq.name}</td>
                      <td className="py-1.5 text-gray-600 font-mono">{inq.contact}</td>
                      <td className="py-1.5 text-gray-600 max-w-[240px] truncate" title={inq.message}>
                        {inq.message}
                      </td>
                      <td className="py-1.5 text-gray-400 whitespace-nowrap">
                        {new Date(inq.created_at).toLocaleString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Error Log */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              에러 로그 ({days}일, 최근 100건)
            </h3>
            <span className="text-xs text-gray-400">
              서버 4xx/5xx · 클라이언트 API 실패
            </span>
          </div>
          {stats.recentErrors.length === 0 ? (
            <p className="text-gray-400 text-sm">기간 내 에러 기록이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">소스</th>
                    <th className="pb-2 font-medium">상태</th>
                    <th className="pb-2 font-medium">메서드</th>
                    <th className="pb-2 font-medium">경로</th>
                    <th className="pb-2 font-medium">코드</th>
                    <th className="pb-2 font-medium">메시지</th>
                    <th className="pb-2 font-medium">계정</th>
                    <th className="pb-2 font-medium">시간</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentErrors.map((err, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            err.source === "server"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {err.source}
                        </span>
                      </td>
                      <td className="py-1.5 font-mono">
                        <span
                          className={
                            (err.status_code ?? 0) >= 500
                              ? "text-red-600 font-semibold"
                              : "text-amber-600"
                          }
                        >
                          {err.status_code ?? "-"}
                        </span>
                      </td>
                      <td className="py-1.5 text-gray-500 font-mono">
                        {err.method ?? "-"}
                      </td>
                      <td className="py-1.5 text-gray-700 max-w-[200px] truncate font-mono">
                        {err.path ?? "-"}
                      </td>
                      <td className="py-1.5 text-gray-500 font-mono">
                        {err.error_code ?? "-"}
                      </td>
                      <td className="py-1.5 text-gray-600 max-w-[240px] truncate">
                        {err.message ?? "-"}
                      </td>
                      <td className="py-1.5 whitespace-nowrap">
                        {err.user_email ? (
                          <span className="text-blue-600 font-medium" title={`ID: ${err.user_id}`}>
                            {err.user_nick_name ? `${err.user_nick_name}` : err.user_email}
                          </span>
                        ) : err.user_id ? (
                          <span className="text-gray-400 font-mono">#{err.user_id}</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-1.5 text-gray-400 whitespace-nowrap">
                        {new Date(err.created_at).toLocaleString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
