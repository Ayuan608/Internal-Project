import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import getDay from "date-fns/getDay";
import startOfWeek from "date-fns/startOfWeek";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion } from "framer-motion";
import { Paperclip } from "lucide-react";
import { createEvent, deleteEvent, fetchAllEvents } from "../../redux/announcementSlice";

// Create the localizer with ES module imports
const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
    getDay,
    locales,
});

function CalendarPage() {
    const dispatch = useDispatch();
    const { events, createEventLoading, createEventError } = useSelector(state => state.announcements);
    console.log("events", events)

    const [attachment, setAttachment] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [view, setView] = useState(Views.MONTH);

    const [newEvent, setNewEvent] = useState({
        title: "",
        startDate: new Date(),
        endDate: new Date(),
        notes: "",
        files: [],
    });

    const defaultDate = useMemo(() => selectedDate, [selectedDate]);
    useEffect(() => {
        dispatch(fetchAllEvents()).then(res => {
            console.log("FETCH EVENTS RESULT 👉", res.payload);
        });
    }, [dispatch]);


    const handleFileUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachment(file);
            setNewEvent(prev => ({ ...prev, files: [file] }));
        }
    }, []);

    const handleSelectSlot = useCallback(({ start, end }) => {
        setNewEvent({
            title: "",
            startDate: start,
            endDate: end,
            notes: "",
            files: [],
        });
        setAttachment(null);
        setShowModal(true);
    }, []);

    const saveEvent = useCallback(async () => {
        if (!newEvent.title.trim()) return;

        const eventData = {
            title: newEvent.title,
            startDate: newEvent.startDate.toISOString(),
            endDate: newEvent.endDate.toISOString(),
            notes: newEvent.notes,
            files: newEvent.files,
        };

        try {
            await dispatch(createEvent(eventData)).unwrap();
            setShowModal(false);
            // Reset form after successful save
            setNewEvent({
                title: "",
                startDate: new Date(),
                endDate: new Date(),
                notes: "",
                files: [],
            });
            setAttachment(null);
        } catch (error) {
            console.error("Failed to create event:", error);
        }
    }, [dispatch, newEvent]);

    const handleDelete = useCallback((event) => {
        const id = event?.id;
        console.log(id, "id")
        if (!id) return console.error("Event ID is undefined!");

        if (window.confirm("Are you sure you want to delete this event?")) {
            dispatch(deleteEvent(id))
                .unwrap()
                .then(() => console.log("Event deleted successfully"))
                .catch(err => console.error("Failed to delete event:", err));
        }
    }, [dispatch]);


    const handleDateChange = useCallback((date) => {
        setSelectedDate(date);
    }, []);

    const Toolbar = useCallback((toolbar) => (
        <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex gap-2">
                <button
                    className="px-3 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                    onClick={() => toolbar.onNavigate("PREV")}
                >
                    ‹
                </button>
                <button
                    className="px-3 py-1 bg-[#3b82f6] text-white rounded hover:bg-[#2764ba] transition-colors"
                    onClick={() => toolbar.onNavigate("TODAY")}
                >
                    Today
                </button>
                <button
                    className="px-3 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                    onClick={() => toolbar.onNavigate("NEXT")}
                >
                    ›
                </button>
            </div>
            <h2 className="text-gray-300 font-semibold">{toolbar.label}</h2>
            <div className="flex gap-2">
                <button
                    className={`px-3 py-1 rounded transition-colors ${view === Views.DAY ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                    onClick={() => {
                        setView(Views.DAY);
                        toolbar.onView(Views.DAY);
                    }}
                >
                    Day
                </button>
                <button
                    className={`px-3 py-1 rounded transition-colors ${view === Views.WEEK ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                    onClick={() => {
                        setView(Views.WEEK);
                        toolbar.onView(Views.WEEK);
                    }}
                >
                    Week
                </button>
                <button
                    className={`px-3 py-1 rounded transition-colors ${view === Views.MONTH ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                    onClick={() => {
                        setView(Views.MONTH);
                        toolbar.onView(Views.MONTH);
                    }}
                >
                    Month
                </button>
            </div>
        </div>
    ), [view]);

    const calendarEvents = useMemo(() => {
        return events.map(evt => ({
            id: evt._id || evt.id,
            title: evt.title,
            start: new Date(evt.startDate),
            end: new Date(evt.endDate),
            resource: evt,
        }));
    }, [events]);

    return (
        <div className="h-screen flex text-white">
            {/* LEFT MINI CALENDAR */}
            <div className="w-72 p-4">
                <h2 className="text-lg font-semibold mb-3 text-blue-300">Calendar</h2>
                <ReactCalendar
                    className="rounded-lg overflow-hidden shadow-md"
                    onChange={handleDateChange}
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
                    events={calendarEvents}
                    defaultDate={defaultDate}
                    defaultView={Views.MONTH}
                    view={view}
                    onView={setView}
                    views={[Views.DAY, Views.WEEK, Views.MONTH]}
                    style={{ height: "90vh" }}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleDelete}
                    onNavigate={setSelectedDate}
                    popup
                    components={{ toolbar: Toolbar }}
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
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-semibold">New Event</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Add a Title</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="w-full mb-5 p-3 rounded bg-[rgba(59,130,246,0.06)] border border-gray-800 text-white"
                                    placeholder="Meeting, Appointment, Task..."
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={newEvent.startDate.toISOString().slice(0, 16)}
                                        onChange={(e) => setNewEvent({ ...newEvent, startDate: new Date(e.target.value) })}
                                        className="w-full p-3 rounded bg-[rgba(59,130,246,0.06)] border border-gray-800 text-white"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm text-gray-400 mb-1">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={newEvent.endDate.toISOString().slice(0, 16)}
                                        onChange={(e) => setNewEvent({ ...newEvent, endDate: new Date(e.target.value) })}
                                        className="w-full p-3 rounded bg-[rgba(59,130,246,0.06)] border border-gray-600 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                                <textarea
                                    className="w-full h-32 p-3 rounded bg-[rgba(59,130,246,0.06)] border border-gray-800 text-white"
                                    placeholder="Add event details..."
                                    value={newEvent.notes}
                                    onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Attachment</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="fileUpload"
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="fileUpload"
                                        className="flex items-center gap-2 px-4 py-2 bg-[rgba(59,130,246,0.10)] 
                       border border-gray-700 rounded-lg cursor-pointer hover:bg-[rgba(59,130,246,0.20)]
                       transition text-sm"
                                    >
                                        <Paperclip size={18} className="text-white" />
                                        <span className="text-gray-300">Attach File</span>
                                    </label>
                                    {attachment && (
                                        <span className="text-sm text-gray-400 truncate max-w-[200px]">
                                            {attachment.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEvent}
                                disabled={createEventLoading || !newEvent.title.trim()}
                                className={`px-4 py-2 rounded transition-colors ${createEventLoading || !newEvent.title.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {createEventLoading ? "Saving..." : "Save"}
                            </button>
                        </div>

                        {createEventError && (
                            <p className="text-red-500 mt-2 text-sm">{createEventError}</p>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default CalendarPage;