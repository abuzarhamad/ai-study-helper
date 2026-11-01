import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import Usage from "@/models/usage";

export const runtime = "nodejs";

function parseDate(value) {
  if (value === null) {
    return { valid: true, date: null };
  }
  const date = new Date(value);
  return {
    valid: !Number.isNaN(date.getTime()),
    date,
  };
}

export async function GET(request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const limitParam = searchParams.get("limit");
    const limit = limitParam === null ? 50 : Number(limitParam);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ error: "Limit must be between 1 and 100." }, { status: 400 });
    }

    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));
    if (!from.valid || !to.valid || (from.date && to.date && from.date > to.date)) {
      return NextResponse.json({ error: "Invalid usage date range." }, { status: 400 });
    }

    const filter = { userId };
    if (from.date || to.date) {
      filter.createdAt = {};
      if (from.date) filter.createdAt.$gte = from.date;
      if (to.date) filter.createdAt.$lte = to.date;
    }

    await connectDB();
    const [records, [summary]] = await Promise.all([
      Usage.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("-userId")
        .lean(),
      Usage.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            requestCount: { $sum: 1 },
            inputTokens: { $sum: "$inputTokens" },
            outputTokens: { $sum: "$outputTokens" },
            totalTokens: { $sum: "$totalTokens" },
            knownCostCount: {
              $sum: {
                $cond: [{ $ne: ["$estimatedCostUsd", null] }, 1, 0],
              },
            },
            estimatedCostUsd: {
              $sum: { $ifNull: ["$estimatedCostUsd", 0] },
            },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      summary: {
        requestCount: summary?.requestCount || 0,
        inputTokens: summary?.inputTokens || 0,
        outputTokens: summary?.outputTokens || 0,
        totalTokens: summary?.totalTokens || 0,
        estimatedCostUsd: summary?.knownCostCount
          ? summary.estimatedCostUsd
          : null,
      },
      records: records.map((record) => ({
        id: record._id.toString(),
        chatId: record.chatId?.toString() || null,
        provider: record.provider,
        model: record.model,
        requestId: record.requestId,
        inputTokens: record.inputTokens,
        outputTokens: record.outputTokens,
        totalTokens: record.totalTokens,
        estimatedCostUsd: record.estimatedCostUsd,
        createdAt: record.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/usage error:", error);
    return NextResponse.json({ error: "Failed to load usage." }, { status: 500 });
  }
}
