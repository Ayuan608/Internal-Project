import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

type AttendanceRole = 'Market' | 'Finance' | 'Development';

export interface Attendance {
    id: number;
    employeeId: number;
    employeeName: string;
    date: string;
    punchIn: string;
    punchOut: string | null;
    wcBreak: number | null; // in minutes
    smokeBreak: number | null; // in minutes
    role: AttendanceRole;
    isFullTime: boolean;
}

const INITIAL_ATTENDANCE_STORE: Attendance[] = [
    {
        id: 1,
        employeeId: 1,
        employeeName: 'Edward Perry',
        date: '2025-01-15',
        punchIn: '2025-01-15T09:00:00.000Z',
        punchOut: '2025-01-15T17:30:00.000Z',
        wcBreak: 15,
        smokeBreak: 10,
        role: 'Finance',
        isFullTime: true,
    },
    {
        id: 2,
        employeeId: 2,
        employeeName: 'Josephine Drake',
        date: '2025-01-15',
        punchIn: '2025-01-15T08:45:00.000Z',
        punchOut: '2025-01-15T17:15:00.000Z',
        wcBreak: 20,
        smokeBreak: null,
        role: 'Market',
        isFullTime: false,
    },
    {
        id: 3,
        employeeId: 3,
        employeeName: 'Cody Phillips',
        date: '2025-01-15',
        punchIn: '2025-01-15T09:15:00.000Z',
        punchOut: null,
        wcBreak: 10,
        smokeBreak: 5,
        role: 'Development',
        isFullTime: true,
    },
    {
        id: 4,
        employeeId: 1,
        employeeName: 'Edward Perry',
        date: '2025-01-16',
        punchIn: '2025-01-16T09:05:00.000Z',
        punchOut: '2025-01-16T17:25:00.000Z',
        wcBreak: 12,
        smokeBreak: 8,
        role: 'Finance',
        isFullTime: true,
    },
    {
        id: 5,
        employeeId: 2,
        employeeName: 'Josephine Drake',
        date: '2025-01-16',
        punchIn: '2025-01-16T08:50:00.000Z',
        punchOut: '2025-01-16T17:20:00.000Z',
        wcBreak: 18,
        smokeBreak: null,
        role: 'Market',
        isFullTime: false,
    },
];

export function getAttendanceStore(): Attendance[] {
    const stringifiedAttendance = localStorage.getItem('attendance-store');
    return stringifiedAttendance ? JSON.parse(stringifiedAttendance) : INITIAL_ATTENDANCE_STORE;
}

export function setAttendanceStore(attendance: Attendance[]) {
    return localStorage.setItem('attendance-store', JSON.stringify(attendance));
}

export async function getMany({
    paginationModel,
    filterModel,
    sortModel,
}: {
    paginationModel: GridPaginationModel;
    sortModel: GridSortModel;
    filterModel: GridFilterModel;
}): Promise<{ items: Attendance[]; itemCount: number }> {
    const attendanceStore = getAttendanceStore();

    let filteredAttendance = [...attendanceStore];

    // Apply filters
    if (filterModel?.items?.length) {
        filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || value == null) {
                return;
            }

            filteredAttendance = filteredAttendance.filter((attendance) => {
                const attendanceValue = attendance[field as keyof Attendance];

                switch (operator) {
                    case 'contains':
                        return String(attendanceValue).toLowerCase().includes(String(value).toLowerCase());
                    case 'equals':
                        return attendanceValue === value;
                    case 'startsWith':
                        return String(attendanceValue).toLowerCase().startsWith(String(value).toLowerCase());
                    case 'endsWith':
                        return String(attendanceValue).toLowerCase().endsWith(String(value).toLowerCase());
                    case '>':
                        return attendanceValue > value;
                    case '<':
                        return attendanceValue < value;
                    default:
                        return true;
                }
            });
        });
    }

    // Apply sorting
    if (sortModel?.length) {
        filteredAttendance.sort((a, b) => {
            for (const { field, sort } of sortModel) {
                const aValue = a[field as keyof Attendance];
                const bValue = b[field as keyof Attendance];
                
                if (aValue < bValue) {
                    return sort === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sort === 'asc' ? 1 : -1;
                }
            }
            return 0;
        });
    }

    // Apply pagination
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    const paginatedAttendance = filteredAttendance.slice(start, end);

    return {
        items: paginatedAttendance,
        itemCount: filteredAttendance.length,
    };
}

export async function getOne(attendanceId: number) {
    const attendanceStore = getAttendanceStore();

    const attendanceToShow = attendanceStore.find((attendance) => attendance.id === attendanceId);

    if (!attendanceToShow) {
        throw new Error('Attendance record not found');
    }
    return attendanceToShow;
}

export async function createOne(data: Omit<Attendance, 'id'>) {
    const attendanceStore = getAttendanceStore();

    const newAttendance = {
        id: attendanceStore.reduce((max, attendance) => Math.max(max, attendance.id), 0) + 1,
        ...data,
    };

    setAttendanceStore([...attendanceStore, newAttendance]);

    return newAttendance;
}

export async function updateOne(attendanceId: number, data: Partial<Omit<Attendance, 'id'>>) {
    const attendanceStore = getAttendanceStore();

    let updatedAttendance: Attendance | null = null;

    setAttendanceStore(
        attendanceStore.map((attendance) => {
            if (attendance.id === attendanceId) {
                updatedAttendance = { ...attendance, ...data };
                return updatedAttendance;
            }
            return attendance;
        }),
    );

    if (!updatedAttendance) {
        throw new Error('Attendance record not found');
    }
    return updatedAttendance;
}

export async function deleteOne(attendanceId: number) {
    const attendanceStore = getAttendanceStore();

    setAttendanceStore(attendanceStore.filter((attendance) => attendance.id !== attendanceId));
}

// Validation follows the [Standard Schema](https://standardschema.dev/).

type ValidationResult = { issues: { message: string; path: (keyof Attendance)[] }[] };

export function validate(attendance: Partial<Attendance>): ValidationResult {
    let issues: ValidationResult['issues'] = [];

    if (!attendance.employeeId) {
        issues = [...issues, { message: 'Employee ID is required', path: ['employeeId'] }];
    }

    if (!attendance.employeeName) {
        issues = [...issues, { message: 'Employee name is required', path: ['employeeName'] }];
    }

    if (!attendance.date) {
        issues = [...issues, { message: 'Date is required', path: ['date'] }];
    }

    if (!attendance.punchIn) {
        issues = [...issues, { message: 'Punch in time is required', path: ['punchIn'] }];
    }

    if (!attendance.role) {
        issues = [...issues, { message: 'Role is required', path: ['role'] }];
    } else if (!['Market', 'Finance', 'Development'].includes(attendance.role)) {
        issues = [
            ...issues,
            { message: 'Role must be "Market", "Finance" or "Development"', path: ['role'] },
        ];
    }

    return { issues };
}
