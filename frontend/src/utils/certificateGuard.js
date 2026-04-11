const activeKeys = new Set();

export const preventDuplicateCreate = (type, customerId) => {
    const key = `${type}-${customerId}`;

    if (!customerId || activeKeys.has(key)) {
        return false;
    }

    activeKeys.add(key);
    setTimeout(() => {
        activeKeys.delete(key);
    }, 100);

    return true;
};
