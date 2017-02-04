var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/form', function(req, res) {
  res.render('form', { title: 'Appsters Matrix Release form' });
});

// router.post('/form', function (req, res) {
//   console.log(req.body);
//  res.render('released', { title: 'Thank you for taking the red pill' });
// });

module.exports = router;
