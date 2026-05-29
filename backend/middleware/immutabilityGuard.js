// IMMUTABLE-on-DONE feature removed per operator request.
// This middleware is now a pass-through. Kept as an export so existing
// route imports (`require('../middleware/immutabilityGuard')`) continue
// to resolve without rewiring every router file.
function immutabilityGuard(/* tableName, idParamName */) {
    return (req, res, next) => next();
}

module.exports = { immutabilityGuard };
