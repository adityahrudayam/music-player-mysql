const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.get('/products/:productId', isAuth, shopController.getProduct);

router.post('/filter', isAuth, shopController.getFilter);

router.get('/', isAuth, shopController.getProducts);

module.exports = router;
