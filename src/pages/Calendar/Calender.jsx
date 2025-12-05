import React, { useState, useMemo } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import addHours from "date-fns/addHours";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion } from "framer-motion";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);

    const [newEvent, setNewEvent] = useState({
        title: "",
        start: new Date(),
        end: new Date(),
    });

    const [events, setEvents] = useState([
        {
            id: 1,
            title: "Team Call (Manila)",
            start: addHours(new Date(), 1),
            end: addHours(new Date(), 2),
        },
    ]);

    const defaultDate = useMemo(() => selectedDate, [selectedDate]);

    // Open modal on slot select
    const handleSelectSlot = ({ start, end }) => {
        setNewEvent({
            title: "",
            start,
            end,
        });
        setShowModal(true);
    };

    // Save new event
    const saveEvent = () => {
        if (!newEvent.title) return;

        setEvents((prev) => [
            ...prev,
            {
                id: Math.random(),
                title: newEvent.title,
                start: newEvent.start,
                end: newEvent.end,
            },
        ]);

        setShowModal(false);
    };

    // Delete event
    const handleSelectEvent = (event) => {
        if (window.confirm("Delete this event?")) {
            setEvents((prev) => prev.filter((e) => e.id !== event.id));
        }
    };

    // Custom Toolbar
    const Toolbar = (toolbar) => {
        return (
            <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 bg-gray-700 text-gray-200 rounded"
                        onClick={() => toolbar.onNavigate("PREV")}
                    >
                        ‹
                    </button>
                    <button
                        className="px-3 py-1 bg-[#3b82f6] text-white rounded"
                        onClick={() => toolbar.onNavigate("TODAY")}
                    >
                        Today
                    </button>
                    <button
                        className="px-3 py-1 bg-gray-700 text-gray-200 rounded"
                        onClick={() => toolbar.onNavigate("NEXT")}
                    >
                        ›
                    </button>
                </div>

                <h2 className="text-gray-300 font-semibold">{toolbar.label}</h2>

                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 bg-gray-700 text-gray-200 rounded"
                        onClick={() => toolbar.onView(Views.DAY)}
                    >
                        Day
                    </button>
                    <button
                        className="px-3 py-1 bg-gray-700 text-gray-200 rounded"
                        onClick={() => toolbar.onView(Views.WEEK)}
                    >
                        Week
                    </button>
                    <button
                        className="px-3 py-1 bg-gray-700 text-gray-200 rounded"
                        onClick={() => toolbar.onView(Views.MONTH)}
                    >
                        Month
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen flex text-white ">
            {/* LEFT MINI CALENDAR */}
            <div className="w-72 p-4">
                <h2 className="text-lg font-semibold mb-3 text-blue-300">Calendar</h2>

                <ReactCalendar
                    className="rounded-lg overflow-hidden shadow-md"
                    onChange={(date) => setSelectedDate(date)}
                    value={selectedDate}
                />

                <button
                    onClick={() => setSelectedDate(new Date())}
                    className="mt-4 w-full py-2 bg-[#3b82f6] rounded-lg hover:bg-[#2764ba]"
                >
                    Go to Today
                </button>
            </div>

            {/* MAIN CALENDAR */}
            <div className="flex-1 p-4">
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    defaultDate={defaultDate}
                    defaultView={Views.MONTH}
                    views={["day", "week", "month"]}
                    style={{ height: "90vh" }}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    popup
                    components={{
                        toolbar: Toolbar,
                    }}
                />
            </div>

            {/* NEW EVENT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur flex justify-center items-center z-50">

                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="bg-[rgba(59,130,246,0.06)] backdrop-blur-lg w-[650px] rounded-xl shadow-2xl p-6 text-white border border-gray-800"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-semibold">New Event</h2>

                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Title */}
                        <label className="block text-sm text-gray-400 mb-1">Add a Title</label>
                        <input
                            type="text"
                            value={newEvent.title}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, title: e.target.value })
                            }
                            className="w-full mb-5 p-3 rounded bg-[rgba(59,130,246,0.06)] border border-gray-800 text-white"
                            placeholder="Meeting, Appointment, Task..."
                        />

                        {/* Date & Time Row */}
                        <div className="flex gap-4 mb-5">
                            <div className="w-1/2">
                                <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                                <input
                                    type="datetime-local"
                                    value={newEvent.start.toISOString().slice(0, 16)}
                                    onChange={(e) =>
                                        setNewEvent({
                                            ...newEvent,
                                            start: new Date(e.target.value),
                                        })
                                    }
                                    className="w-full p-3 rounded bg-[rgba(59,130,246,0.06)] border border-gray-800 text-white"
                                />
                            </div>

                            <div className="w-1/2">
                                <label className="block text-sm text-gray-400 mb-1">End Date</label>
                                <input
                                    type="datetime-local"
                                    value={newEvent.end.toISOString().slice(0, 16)}
                                    onChange={(e) =>
                                        setNewEvent({
                                            ...newEvent,
                                            end: new Date(e.target.value),
                                        })
                                    }
                                    className="w-full p-3 rounded bg-[rgba(59,130,246,0.06)] border border-gray-600 text-white"
                                />
                            </div>
                        </div>

                

                        {/* Description */}
                        <label className="block text-sm text-gray-400 mb-2">Notes</label>
                        <textarea
                            className="w-full h-32 p-3 rounded bg-[rgba(59,130,246,0.06)] border border-gray-800 text-white"
                            placeholder="Add event details..."
                        />

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={saveEvent}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}



        </div>
    );
}

export default CalendarPage;
