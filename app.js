require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-adesh:Adesh%40729%40S285@cluster0.rd0slvm.mongodb.net/extcDB", {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  displayName: String,
  photo: Array,
  userinfo:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID:" 14412686084-vhm9tq8mpjkgpo9n3he16g1rti7tt35f.apps.googleusercontent.com",
    clientSecret:" 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",
    callbackURL: "http://localhost:3000/auth/google/extcwebsite2022",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({
      googleId: profile.id,
      displayName: profile.displayName,
      photo: profile.photos
    }, function(err, user) {
      return cb(err, user);
    });
  }
));

const studentsSchema = new mongoose.Schema({
  image: String,
  fname: String,
  lname: String,
  prn: Number,
  email: String,
  dateob: String,
  mobile: Number,
  gender: String,
  address: String,
  profile: String,
  tenth: String,
  tenththmarks: Number,
  twelth: String,
  twelthmarks: Number,
  college: String,
  education: String,
  title1: String,
  certificate1: String,
  description1: String,
  title2: String,
  certificate2: String,
  description2: String,
  workint: String,
  prskills: Array,
  intskills: Array,
  langskills: Array,
  linkedin: String,
  instagram: String,
  twitter: String,
  objective: String,
  resumeinput: String,
  resume: String,
  joined: String
});

const Student = mongoose.model("Student", studentsSchema);

const subscribeSchema = new mongoose.Schema({
  email: String,
  mobileno: Number
});

const Subscribe = mongoose.model("Subscribe", subscribeSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.post("/home", function(req, res) {
  const subscribe = new Subscribe({
    email: req.body.emailsubs,
    mobileno: req.body.mobilesubs
  });
  subscribe.save();
  res.send("Thank you subscribing us.")
});

app.post("/students", function(req, res) {
  Student.findOne({
    email: req.body.button
  }, function(err, newStudent) {
    if (newStudent) {
      res.render("profile", {
        accountinfo: newStudent
      });
    }
  });
})

app.get("/auth/google",
  passport.authenticate("google", {
    scope: ['profile']
  })
);

app.get("/auth/google/extcwebsite2022",
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect("/students");
  });

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/students", function(req, res) {
  if (req.isAuthenticated()) {
    Student.find({}, function(err, newStudents) {
      res.render("students", {
        accountinfo: newStudents
      });
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/register", function(req, res) {

  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        Student.find({}, function(err, newStudents) {
          res.render("students", {
            accountinfo: newStudents
          });
        });
      });
    }
  });
});

app.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.Password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        Student.findOne({
          email: req.body.username
        }, function(err, newOne) {
          res.render("profile");
        });

      });
    }
  });
});

app.get("/logout", function(req, res) {
  req.logout(function(err) {
    if (!err) {
      res.redirect("/");
    }
  });
});





app.get("/profile", function(req, res) {

  Student.findOne({}, function(err, newStudents) {
    res.render("profile", {
      accountinfo: newStudents
    });
  })
});

app.post("/students", function(req, res) {
  Student.findOne({
    fname: req.body.ssname
  }, function(err, newStudent) {
    if (newStudent) {
      res.render("profile", {
        accountinfo: newStudent
      });
    } else {
      res.send("<h1> No User Found 😥 !!! Try again.");
    }
  });
});

app.get("/createaccount", function(req, res) {
  if (req.isAuthenticated()){
    res.render("createaccount");
  } else {
    res.render("register");
  }
});

app.get("/about", function(req, res) {
  res.render("about");
});
app.get("/album", function(req, res) {
  res.render("album");
});
app.get("/department", function(req, res) {
  res.render("department");
});

app.get("/successful", function(req, res) {
  res.render("successful");
});
app.get("/guide", function(req, res) {
  res.render("guide");
});

app.post("/account", function(req, res) {

  const student = new Student({
    image: req.body.image,
    fname: req.body.fname,
    lname: req.body.lname,
    prn: req.body.prn,
    email: req.body.email,
    dateob: req.body.dob,
    mobile: req.body.mobilen,
    gender: req.body.gender,
    address: req.body.address,
    profile: req.body.profile,
    tenth: req.body.tenth,
    tenththmarks: req.body.tenththmarks,
    twelth: req.body.twelth,
    twelthmarks: req.body.twelthmarks,
    college: req.body.college,
    education: req.body.education,
    title1: req.body.title1,
    certificate1: req.body.certificate1,
    description1: req.body.destitle1,
    title2: req.body.title2,
    certificate2: req.body.certificate2,
    description2: req.body.destitle2,
    workint: req.body.workint,
    prskills: req.body.prskills,
    intskills: req.body.intskills,
    langskills: req.body.langskills,
    linkedin: req.body.linkedin,
    instagram: req.body.instagram,
    twitter: req.body.twitter,
    objective: req.body.objective,
    resumeinput: req.body.ans,
    resume: req.body.resume,
    joined: new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    })
  });
User.findById(req.user.id , function(err, foundUser){
  if (err){
    console.log(err);
  } else {
    if (foundUser){
      foundUser.userinfo = student;
      foundUser.save(function(){
        res.redirect("/students");
      });
    }
  }
});

  student.save();
  res.redirect("successful");
});

const port = process.env.PORT || 3000;

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }
// app.listen(port);

app.listen(port, function() {
  console.log("Server has started successfully.");
});
