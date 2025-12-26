import React from 'react';

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
            // Winter: Assume Nov 1 to Feb 28. If currently in early year, use previous year start.
            // Logic: Winter '24 starts Nov '24, ends Feb '25.
            // If current month is Jan/Feb/Mar, we are in Winter, so start year is prev year.
            // If current month is Nov/Dec, start year is current year.
            const startYear = now.getMonth() < 3 ? year - 1 : year; // < 3 Means Jan(0), Feb(1), Mar(2)
            setDateRange({ start: new Date(`${startYear}-11-01`), end: new Date(`${startYear + 1}-02-28`) });
        } else if (type === 'summer') {
            // Summer: Mar 1 to June 30
            setDateRange({ start: new Date(`${year}-03-01`), end: new Date(`${year}-06-30`) });
        } else if (type === 'thisMonth') {
            setDateRange({ start: new Date(year, now.getMonth(), 1), end: new Date(year, now.getMonth() + 1, 0) });
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
            <div className="flex gap-2 items-center">
                <i className="fa-solid fa-calendar text-cyan-400"></i>
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Filter Date:</span>
            </div>
            <div className="flex gap-2">
                <input
                    type="date"
                    value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                    onChange={e => setDateRange({ ...dateRange, start: e.target.value ? new Date(e.target.value) : null })}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white focus:border-cyan-400 outline-none"
                    placeholder="Start"
                />
                <span className="text-white/20">-</span>
                <input
                    type="date"
                    value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                    onChange={e => setDateRange({ ...dateRange, end: e.target.value ? new Date(e.target.value) : null })}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white focus:border-cyan-400 outline-none"
                    placeholder="End"
                />
            </div>
            <div className="flex gap-2 flex-wrap">
                <button onClick={() => setPreset('all')} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold uppercase transition-colors">All</button>
                <button onClick={() => setPreset('thisMonth')} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold uppercase transition-colors">Month</button>
                <button onClick={() => setPreset('winter')} className="px-3 py-1 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 text-[10px] font-bold uppercase transition-colors">Winter</button>
                <button onClick={() => setPreset('summer')} className="px-3 py-1 rounded-lg bg-orange-400/10 text-orange-400 hover:bg-orange-400/20 text-[10px] font-bold uppercase transition-colors">Summer</button>
            </div>
        </div>
    );
};

export default DateRangePicker;
