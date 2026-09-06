"use client";

import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { EventClickArg } from "@fullcalendar/core";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  /** 已 +1 天（FullCalendar 全日事件 end 為 exclusive）*/
  end?: string;
  color: string;
};

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  const router = useRouter();

  return (
    <div className="admin-calendar rounded-xl border border-border bg-card p-3 text-sm">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        }}
        buttonText={{
          today: "本月",
          month: "月",
          week: "週",
        }}
        locale="zh-tw"
        firstDay={1}
        height="auto"
        displayEventTime={false}
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          allDay: true,
          backgroundColor: e.color,
          borderColor: e.color,
        }))}
        eventClick={(arg: EventClickArg) => {
          arg.jsEvent.preventDefault();
          router.push(`/admin/projects/${arg.event.id}`);
        }}
      />
    </div>
  );
}
