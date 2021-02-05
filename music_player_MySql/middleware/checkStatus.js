module.exports = (req, res, next) => {
    if (req.session.userId || req.session.isLoggedIn) {
        return res.redirect('/');
    }
    next();
}