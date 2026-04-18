import { query } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const days = Math.max(1, Math.min(parseInt(url.searchParams.get("days") || "30", 10) || 30, 90));

  try {
  const [
    dailySignups,
    totalUsers,
    activeUsers,
    dailyDietRecords,
    dailyChatMessages,
    ckdDistribution,
    topUsersByDiet,
    recentWithdrawals,
    dailyWeightRecords,
    communityPostStats,
    recentSignupUsers,
    recentErrors,
  ] = await Promise.all([
    // 날짜별 가입자수
    query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [days]
    ),

    // 전체 유저수
    query(
      `SELECT
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE role = 'USER') as users,
         COUNT(*) FILTER (WHERE role = 'DOCTOR') as doctors,
         COUNT(*) FILTER (WHERE role = 'admin') as admins
       FROM users`
    ),

    // 활성 유저수 (최근 7일 내 식단 기록이 있는)
    query(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM food_diary
       WHERE created_at >= NOW() - INTERVAL '7 days'
         AND deleted_at IS NULL`
    ),

    // 날짜별 식단 기록 수
    query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM food_diary
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
         AND deleted_at IS NULL
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [days]
    ),

    // 날짜별 채팅 메시지 수
    query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM message
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
         AND role = 'user'
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [days]
    ),

    // CKD 단계 분포
    query(
      `SELECT
         COALESCE(ckd_stage::text, 'N/A') as stage,
         COUNT(*) as count
       FROM user_profile
       GROUP BY ckd_stage
       ORDER BY ckd_stage NULLS LAST`
    ),

    // 식단 기록 Top 10 유저
    query(
      `SELECT u.nick_name, u.email, COUNT(fd.id) as record_count
       FROM food_diary fd
       JOIN users u ON u.id = fd.user_id
       WHERE fd.deleted_at IS NULL
       GROUP BY u.id, u.nick_name, u.email
       ORDER BY record_count DESC
       LIMIT 10`
    ),

    // 최근 탈퇴 현황
    query(
      `SELECT DATE(uw.created_at) as date, COUNT(*) as count,
              ARRAY_AGG(uw.reason) as reasons
       FROM user_withdrawal uw
       WHERE uw.created_at >= NOW() - INTERVAL '1 day' * $1
       GROUP BY DATE(uw.created_at)
       ORDER BY date DESC`,
      [days]
    ),

    // 날짜별 체중 기록 수
    query(
      `SELECT DATE(updated_at) as date, COUNT(*) as count
       FROM weight_record
       WHERE updated_at >= NOW() - INTERVAL '1 day' * $1
       GROUP BY DATE(updated_at)
       ORDER BY date`,
      [days]
    ),

    // 커뮤니티 게시글 통계
    query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM community_post
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
         AND is_deleted = false
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [days]
    ),

    // 신규 가입 유저 목록
    query(
      `SELECT email, nick_name, role, DATE(created_at) as signup_date
       FROM users
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
       ORDER BY created_at DESC`,
      [days]
    ),

    // 최근 에러 로그 (최대 100건)
    query(
      `SELECT source, status_code, method, path, error_code, message, user_id,
              created_at
       FROM error_log
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [days]
    ),
  ]);

  return Response.json({
    dailySignups,
    totalUsers: totalUsers[0],
    activeUsers: activeUsers[0],
    dailyDietRecords,
    dailyChatMessages,
    ckdDistribution,
    topUsersByDiet,
    recentWithdrawals,
    dailyWeightRecords,
    communityPostStats,
    recentSignupUsers,
    recentErrors,
  });
  } catch (e) {
    console.error("Stats API error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
