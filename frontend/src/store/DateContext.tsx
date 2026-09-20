import React, { createContext, useState, useContext, ReactNode } from 'react';
import { addDays, subDays } from 'date-fns';

interface DateContextType {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    nextDay: () => void;
    prevDay: () => void;
    goToday: () => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const nextDay = () => setSelectedDate(prev => addDays(prev, 1));
    const prevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const goToday = () => setSelectedDate(new Date());

    return (
        <DateContext.Provider value={{ selectedDate, setSelectedDate, nextDay, prevDay, goToday }}>
            {children}
        </DateContext.Provider>
    );
};

export const useDateContext = () => {
    const context = useContext(DateContext);
    if (context === undefined) {
        throw new Error('useDateContext must be used within a DateProvider');
    }
    return context;
};
