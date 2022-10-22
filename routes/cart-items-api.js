const express = require('express');
const router  = express.Router();
const userQueries = require('../db/queries/users');

router.get('/:id', (req, res) => {
  userQueries.getOneCartItem() // gives all the info about one item
    .then(cartItem => {
      res.json({ cartItem });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});

module.exports = router;