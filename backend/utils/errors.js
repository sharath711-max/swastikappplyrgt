class ValidationError extends Error {
    constructor(message, details = []) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
        this.status = 400;
    }
}

module.exports = {
    ValidationError
};
