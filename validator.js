function check(userSchema) {
    return (req, res, next) => {
        const result = userSchema.validate(req.body);
        if (result.error) {
            return res.status(400).send({ error: result.error.details });
        }
        next();
    }
}
module.exports = {check};