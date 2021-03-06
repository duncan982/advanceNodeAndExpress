const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

module.exports = function(app, myDataBase){

  // Be sure to change the title
  app.route('/').get((req, res) => {
    // Change the response to render the Pug template
    res.render('pug', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
    });
  });

  app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile');
  });

  app.route('/profile').get(ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + '/views/pug/profile', { username: req.user.username });
  });
  
  app.route('/logout').get((req, res) => {
    req.logout();
    res.redirect('/');
  });

// Registration of New Users
  app.route('/register')
  .post((req, res, next) => {
    const hash = bcrypt.hashSync(req.body.passowrd, 12);
    myDataBase.findOne({ username: req.body.username }, function(err, user) {
      if (err) {
        next(err);
      } else if (user) {
        res.redirect('/');
      } else {
        myDataBase.insertOne({
          username: req.body.username,
          password: hash
        },
          (err, doc) => {
            if (err) {
              res.redirect('/');
            } else {
              // The inserted document is held within
              // the ops property of the doc
              next(null, doc.ops[0]);
            }
          }
        )
      }
    })
  },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );

// Implementation of Social Authentication
app.route('/auth/github').get(passport.authenticate('github'), (req, res) =>{
  
});

// app.route('/auth/github/callback').get(passport.authenticate('github', {failureRedirect: '/'}), (req, res) =>{
//   res.redirect('/profile')
// });

app.route('/auth/github/callback').get(passport.authenticate('github', {failureRedirect: '/'}), (req, res) =>{
  req.session.user_id = req.user.id,
  res.redirect('/chat')
});

// Set up the Environment
app.route('/chat').get(ensureAuthenticated, (req, res) => {
  res.render(process.cwd() + '/views/pug/chat', { user: req.user})
})


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  };
  if(!bcrypt.compareSync(password, user.password)){
    return done(null, false)
  }
  res.redirect('/');
}
  
};