var express = require("express"),
    app = express(),
    mver = require("method-override"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user"),
    bodyParser = require("body-parser"),
    path = require("path");

mongoose.connect('mongodb+srv://aastha:Aastha@1203@cluster0.dwjbn.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to DB!'))
    .catch(error => console.log(error.message));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(mver("_method"));
// app.use(function(req, res, next){
//     res.locals.user= req.user;
//     next();
// });

var msgSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now}
});
var msg = mongoose.model("msg", msgSchema);

//PassportConfig

app.use(require("express-session")({
    secret: "I love my sister",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//var newUser = new User({username : "peachgoma"});
//var password = "peachgoma";
//User.register(newUser, password, function(err, user){
     // if(err)
    //  {
     //     console.log(err);
      //}else{
     //     console.log("created!");
     // }
  //});

app.get('/login', function (req, res) {
    res.render("login", { user: req.user });
})

app.post("/login", passport.authenticate("local", {
    successRedirect: "/msgs",
    failureRedirect: "/login"
}), function (req, res) {
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/login");
})

app.get('/',isloggedin, function (req, res) {
   
        res.render("home.ejs", {user: req.user});
    
}
)

app.get('/msgs', isloggedin, function (req, res) {
    msg.find({}, function (err, msgs) {
        if (err) {
            console.log("Error!");
        }
        else {
            res.render("index", { msgs: msgs, user: req.user });
        }
    })
})



app.get('/msgs/new', isloggedin, function (req, res) {
    res.render("new", {user: req.user});
})

app.post("/msgs",isloggedin, function (req, res) {
    msg.create(req.body.msg, function (err, newMsg) {
        if (err) {
            res.render("new");
        }
        else {
            res.redirect("/msgs");
        }
    })
})

app.get("/msgs/:id", isloggedin, function (req, res) {
    msg.findById(req.params.id, function (err, found) {
        if (err) {
            console.log(err);
            res.redirect("/msgs");
        }
        else {
            res.render("detail", { found: found, user: req.user });
        }
    })
    //console.log(req.params);
    ///res.send("Hi")
})

app.get("/msgs/:id/edit", isloggedin, function (req, res) {
    msg.findById(req.params.id, function (err, found) {
        if (err) {
            console.log(err);
            res.redirect("/msgs");
        }
        else {
            res.render("edit", { found: found, user: req.user });
        }
    })
})

app.put("/msgs/:id", function (req, res) {
    msg.findByIdAndUpdate(req.params.id, req.body.msg, function (err, updates) {
        if (err) {
            console.log(err);
            res.redirect("/msgs");
        }
        else {
            res.redirect("/msgs/" + req.params.id);
        }
    })
})

app.delete("/msgs/:id", isloggedin, function (req, res) {
    msg.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/msgs");
        }
    })
})

function isloggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT || 3000, function () {
    console.log("Port is running!");
})
