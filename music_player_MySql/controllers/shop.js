const fs = require('fs');
const path = require('path');

const { Op } = require('sequelize');

const Product = require('../models/product');

const searchAlgo = require('../util/search');

const ITEMS_PER_PG = 2;

exports.getProduct = (req, res, next) => {
  const id = +req.params.productId;
  Product.findByPk(id).then(product => {
    if (!product) {
      return res.redirect('/404');
    }
    res.render('shop/product-detail', {
      path: '/products',
      pageTitle: product.title,
      product: product,
    });
  });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let items;
  req.user.countProducts().then(count => {
    items = count;
    return count;
  }).then(count => {
    return req.user.getProducts({
      limit: ITEMS_PER_PG,
      offset: (page - 1) * ITEMS_PER_PG
    });
  }).then(products => {
    res.render('admin/products', {
      path: '/',
      pageTitle: 'PlayList',
      prods: products,
      currentPage: page,
      hasNextPage: (page < Math.ceil(items / ITEMS_PER_PG)) ? true : false,
      hasPreviousPage: (page > 1) ? true : false,
      nextPage: page + 1,
      previousPage: page - 1,
      filter: false
    });
  }).catch(err => console.log(err));
};

exports.getFilter = (req, res, next) => {
  const filteredProds = [];
  // const page = +req.query.page || 1;
  const filter = req.body.filter;
  // console.log(filter);
  req.user.getProducts().then(products => {
    if (!products.length) {
      return res.redirect('/');
    }
    products.forEach(product => {
      filteredProds.push([product, searchAlgo.filter(product.title, filter)]);
    });
    filteredProds.sort((a, b) => {
      // console.log(a[1]);
      // console.log(b[1]);
      if (a[1] == b[1]) {
        if (searchAlgo.minChanges(a[0].title, filter) == searchAlgo.minChanges(b[0].title, filter)) {
          return 0;
        } else {
          return (searchAlgo.minChanges(a[0].title, filter) < searchAlgo.minChanges(b[0].title, filter)) ? -1 : 1;
        }
      }
      else {
        return (a[1] < b[1]) ? 1 : -1;
      }
    });
    const finalProds = [];
    const length = Math.min(filteredProds.length, ITEMS_PER_PG);
    for (let i = 0; i < length; i++) {
      finalProds.push(filteredProds[i][0]);
    }
    res.render('admin/products', {
      path: '/',
      pageTitle: 'PlayList',
      prods: finalProds,
      filter: true
    });
  }).catch(err => console.log(err));
};



