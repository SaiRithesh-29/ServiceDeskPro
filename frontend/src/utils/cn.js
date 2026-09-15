/** Joins conditional Tailwind classes without requiring a runtime dependency. */
export function cn(...classes) {
    return classes
        .flatMap((value) => {
        if (typeof value === 'string')
            return value;
        if (value && typeof value === 'object') {
            return Object.entries(value)
                .filter(([, enabled]) => Boolean(enabled))
                .map(([className]) => className);
        }
        return [];
    })
        .filter(Boolean)
        .join(' ');
}
