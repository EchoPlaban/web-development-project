var express = require('express');
var url = require('url');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const ejs = require('ejs');
var mysql = require('mysql');
var formidable = require('formidable');
var fs = require('fs');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "demo",
  port:3306
});

var app = express()
app.use(express.static(__dirname + '/public'));
app.set('view engine' , 'ejs');
app.use(cookieParser());
app.use(session({
    secret: "amar",
    saveUninitialized: true,
    resave: true
}));

app.get("/user", function(req, res){
    var q = url.parse(req.url, true);
    var param = q.query;
    req.session.user = param.user
    res.redirect("/");
});

app.use("/logout", function(req, res){
    req.session.destroy();
    res.redirect("/");
});

// app.use("/login", function(req, res){

    
// });
app.post("/insert", function(req, res){

    var form = new formidable.IncomingForm();
    
    form.parse(req, function (err, fields, files) {
        console.log("In file upload");
        console.log(fields);
        console.log(files.myfile[0].filepath);
        var oldpath = files.myfile[0].filepath;
        var newpath = __dirname+"/public/image/" + files.myfile[0].originalFilename;
        console.log(oldpath);
        console.log(newpath);
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
        });
        var image = files.myfile[0].originalFilename;
        var name = fields.name;
        var price = fields.price;
        var str = "INSERT INTO product(name, price, image) VALUES('"+name+"','"+price+"','"+image+"');";
        con.query(str, function (err, result) {
            if (err) throw err;
            console.log(result);
            res.redirect("/");
        });
    });
    
});
app.get('/update/:id', function(req, res) {
    var id = req.params.id;
    var str = "SELECT * from product WHERE id ="+id;
    console.log(str);
    con.query(str, function (err, result) {
        if (err) throw err;
        console.log(result);
        var data = {product:result[0]}
        res.locals.user = req.session.user;
        if(req.session.user != undefined){
            res.render('updateproduct', data) ;
        }else{ 
            res.redirect("/");
        }
        
    });


});

app.post("/modify/:id", function(req, res){
    var id = req.params.id;
    
    var form = new formidable.IncomingForm();
    
    form.parse(req, function (err, fields, files) {
        console.log("In file upload");
        console.log(fields);
        console.log(files);
        var name = fields.name;
        var price = fields.price;

        if(Object.keys(files).length == 0){
            console.log("Yes====");
            var str = "update product SET name='"+name+"',price="+price+" WHERE id="+id;
            con.query(str, function (err, result) {
                if (err) throw err;
                console.log(result);
                res.redirect("/");
            });
        }else{
            console.log("No====");
            var oldpath = files.myfile[0].filepath;
            var newpath = __dirname+"/public/image/" + files.myfile[0].originalFilename;
            console.log(oldpath);
            console.log(newpath);
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
            });
            var image = files.myfile[0].originalFilename;
            var str = "update product SET name='"+name+"',price="+price+" ,image='"+image+"' WHERE id="+id;
            console.log(image);
            console.log(str);
            con.query(str, function (err, result) {
                if (err) throw err;
                console.log(result);
                res.redirect("/");
            });
        }
        
        
    });
    
   
});
app.get('/delete/:id', function(req, res) {
    if(req.session.user != undefined){
        var id = req.params.id;
        var str = "DELETE FROM product WHERE id ="+id;
        console.log(str);
        con.query(str, function (err, result) {
            if (err) throw err;
            console.log(result);
            res.redirect("/") ;
        });
    }else{ 
        res.redirect("/");
    }
    
});
app.post("/create",function(req, res){
    var form = new formidable.IncomingForm();
    
    form.parse(req, function (err, fields) {
        console.log(fields);
        var name = fields.name;
        var email = fields.email;
        var pass = fields.pass;

        var str = "INSERT INTO users(name, email, pass) VALUES('"+name+"','"+email+"','"+pass+"')";
        con.query(str, function (err, result) {
            if (err) throw err;
            console.log(result);
            
            res.redirect("/login") ;
        });
    });
});
app.use("/login", function(req, res){
    if(req.session.user != undefined){
        res.redirect("/");
    }else{ 
        res.locals.user = req.session.user;
        res.render('signin');
    }
    
});

app.get("/signin", function(req, res){
    console.log("here=====");
    var q = url.parse(req.url, true);
    var email = q.query.email;
    var pass = q.query.pass;
    var str = "SELECT * FROM users WHERE email='"+email+"'";
    console.log(str);
    con.query(str, function (err, result) {
        if (err) throw err;
        if(result.length > 0 && result[0].pass == pass){
            req.session['user'] = email;
            res.locals.user = req.session.user;
        }
        console.log(result[0]);
        
        res.redirect("/");
    });
});
app.use("/add", function(req, res){
    res.locals.user = req.session.user;
    if(req.session.user != undefined){
        res.render('add');
        
    }else{ 
        res.redirect("/");
    }
    res.render('add') ;
});


app.use("/register", function(req, res){
    res.locals.user = req.session.user;
    res.render('register');

});

app.use("/about",function(req,res){
    res.locals.user = req.session.user;
    res.render('about');
});

app.use("/contact",function(req,res){
    res.locals.user = req.session.user;
    res.render('contact');
});

app.use("/", function(req, res){
    res.locals.user = req.session.user;
    con.query("SELECT * FROM product", function (err, result) {
        if (err) throw err;
        var data = {
            products:result
        };
        res.render('home', data) ;
    }); 
    
   
});



app.listen(3000);