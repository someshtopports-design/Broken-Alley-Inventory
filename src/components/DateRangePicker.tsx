import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../index.css'; // Ensure we have base styles if needed

interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface DateRangePickerProps {
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateRange, setDateRange }) => {
    // Presets
    const setPreset = (type: 'all' | 'winter' | 'summer' | 'thisMonth') => {
        const now = new Date();
        const year = now.getFullYear();
        if (type === 'all') {
            setDateRange({ start: null, end: null });
        } else if (type === 'winter') {
            const startYear = now.getMonth() < 3 ? year - 1 : year; // < 3 Means Jan(0), Feb(1), Mar(2)
            setDateRange({ start: new Date(`${startYear}-11-01`), end: new Date(`${startYear + 1}-02-28`) });
        } else if (type === 'summer') {
            setDateRange({ start: new Date(`${year}-03-01`), end: new Date(`${year}-06-30`) });
        } else if (type === 'thisMonth') {
            setDateRange({ start: new Date(year, now.getMonth(), 1), end: new Date(year, now.getMonth() + 1, 0) });
        }
    };

    const CustomInput = React.forwardRef(({ value, onClick, placeholder }: any, ref: any) => (
        <button className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white focus:border-cyan-400 outline-none min-w-[120px] text-left flex items-center justify-between" onClick={onClick} ref={ref}>
            {value || placeholder}
            <i className="fa-solid fa-calendar-day text-white/20 ml-2"></i>
        </button>
    ));

    return (
        <div className="flex flex-col xl:flex-row gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
            <div className="flex gap-2 items-center min-w-max">
                <i className="fa-solid fa-calendar text-cyan-400"></i>
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Filter Date:</span>
            </div>
            <div className="flex gap-2 items-center">
                <div className="relative">
                    <DatePicker
                        selected={dateRange.start}
                        onChange={(date) => setDateRange({ ...dateRange, start: date })}
                        selectsStart
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        customInput={<CustomInput placeholder="Start Date" />}
                        dateFormat="dd MMM yyyy"
                        placeholderText="Start Date"
                        wrapperClassName="w-full"
                    />
                </div>
                <span className="text-white/20">-</span>
                <div className="relative">
                    <DatePicker
                        selected={dateRange.end}
                        onChange={(date) => setDateRange({ ...dateRange, end: date })}
                        selectsEnd
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        minDate={dateRange.start}
                        customInput={<CustomInput placeholder="End Date" />}
                        dateFormat="dd MMM yyyy"
                        placeholderText="End Date"
                        wrapperClassName="w-full"
                    />
                </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-center xl:justify-start">
                <button onClick={() => setPreset('all')} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold uppercase transition-colors">All</button>
                <button onClick={() => setPreset('thisMonth')} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold uppercase transition-colors">Month</button>
                <button onClick={() => setPreset('winter')} className="px-3 py-1 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 text-[10px] font-bold uppercase transition-colors">Winter</button>
                <button onClick={() => setPreset('summer')} className="px-3 py-1 rounded-lg bg-orange-400/10 text-orange-400 hover:bg-orange-400/20 text-[10px] font-bold uppercase transition-colors">Summer</button>
            </div>
        </div>
    );
};

export default DateRangePicker;
