import { NextResponse } from "next/server";
import { getCalendarWeek } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export async function GET() {
  const timezone = process.env.USER_TIMEZONE || "Europe/Rome";
  try {
    const data = await getCalendarWeek(timezone);
    return NextResponse.json({
      connected: data.connected,
      events: data.events.map((e) => ({
        start: e.start.toISOString(),
        end: e.end.toISOString(),
        summary: e.summary,
        allDay: e.allDay,
      })),
    });
  } catch (err) {
    return NextResponse.json({ connected: true, events: [], error: err.message }, { status: 200 });
  }
}
