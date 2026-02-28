export function formatMessageTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const isSameYear = date.getFullYear() === now.getFullYear();

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };

    if (isToday) {
        return date.toLocaleTimeString('en-US', timeOptions);
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        ...timeOptions
    };

    if (isSameYear) {
        return date.toLocaleTimeString('en-US', dateOptions);
    }

    return date.toLocaleTimeString('en-US', {
        ...dateOptions,
        year: 'numeric'
    });
}
