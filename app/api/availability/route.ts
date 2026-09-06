import { NextRequest, NextResponse } from "next/server";
import { getProductAvailableStock } from "@/lib/booking/availability";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (!productId || !startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    const stockInfo = await getProductAvailableStock(productId, startDate, endDate);
    return NextResponse.json(stockInfo);
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
