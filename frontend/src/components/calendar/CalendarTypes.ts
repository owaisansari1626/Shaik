import { ActivityOccurrence } from '../../types';

export type ViewType = 'Day' | '3 Days' | 'Week' | 'Month';

export interface CalendarViewProps {
    occurrences: ActivityOccurrence[];
    selectedDate: Date;
    isLoading: boolean;
    setSelectedEvent: (event: any) => void;
    onDragStart: (e: React.DragEvent, occ: ActivityOccurrence) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, targetDate: Date, targetHour: number) => void;
    onEmptySlotClick: (date: Date, hour: number) => void;
    onContextMenuAction?: (e: React.MouseEvent, occ: any) => void;
    TIMELINE_HOURS: number[];
}
