const path = require('path');
const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const express = require('express');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const multer = require('multer');

const sequelize = require('./util/database');
const errorController = require('./controllers/error');
const Product = require('./models/product');
const User = require('./models/user');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'files');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now().toString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const fileTypes = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-m4a', 'audio/x-m4p', 'audio/x-m4b', 'video/mp4', 'video/webm', 'video/ogg', 'video/x-m4a', 'video/x-m4p', 'video/x-m4b'];
    if (fileTypes.find(type => type === file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('audio'));
app.use(express.static(path.join(__dirname, 'public')));//serving static files!
app.use('/files', express.static(path.join(__dirname, 'files')));
app.use(session({ secret: 'long string in prod', resave: false, saveUninitialized: false, store: new SequelizeStore({ db: sequelize, checkExpirationInterval: 15 * 60 * 1000, expiration: 60 * 60 * 1000 }) }));//session is stored in memory if we u dont specify the store prop.Dont forget!
app.use(csrfProtection);

app.use((req, res, next) => {
    if (!req.session.userId) {
        return next();
    }
    User.findByPk(req.session.userId).then(user => {
        req.user = user;
        next();
    }).catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn || false;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(authRoutes);
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

User.hasMany(Product, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Product.belongsTo(User);

sequelize.sync().then(res => {
    app.listen(3000);
}).catch(err => console.log(err));
