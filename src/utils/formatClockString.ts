export const formatClockString = (date: Date | null): string => {
    if (!date || isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        weekday: 'long',
    }).format(date);
};
