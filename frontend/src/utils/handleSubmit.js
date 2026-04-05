const handleSubmit = async ({ action, reload, close }) => {
    const result = await action();

    if (reload) {
        await reload(result);
    }

    if (close) {
        close();
    }

    return result;
};

export default handleSubmit;
