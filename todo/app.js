var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');

var user;
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "todoList"
});

con.connect();

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');


app.get('/register', function (req, res) {
    var data = "SELECT * FROM registration";
    con.query(data, function (error, results, fields) {
        if (error) throw error;
        res.render("register", { results });
    });
});

app.get('/', function (req, res) {
    var data = "SELECT * FROM registration";
    con.query(data, function (error, results, fields) {
        if (error) throw error;
        res.render("login", { error: false, results });
    });
});

// =====================register==========================

app.post('/register', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var contact = req.body.contact;
    var code = req.body.code;
    var gender = req.body.gender;

    var query = "INSERT INTO registration(name, email, password, contact, code, gender) VALUES ('" + name + "','" + email + "','" + password + "','" + contact + "','" + code + "','" + gender + "')";

    con.query(query, function (error, results) {
        if (error) throw error;
        res.redirect('/register');
    });
});

// =======================login===========================

app.post('/', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    if (email && password) {
        var query = "SELECT * FROM registration WHERE email = '" + email + "' AND password = '" + password + "'";
    
        con.query(query, function (error, results) {
            if (error) throw error;

            if (results.length > 0) {
                var code = results[0].code;
                if (code === 'admin') {
                    res.redirect('/dashboard');
                } else if (code === 'user') {
                    res.redirect('/userdashboard');
                }
                user = results[0].name;
            } else {
                res.render('login', { error: true });
            }
        });
    } else {
        console.log("Please enter email and password")
    }
});

// ==========================admin dashboard routing======================

app.get('/dashboard', function (req, res) {

    var select_data = "SELECT t1.name, COALESCE( t4.total_task, 0 ) AS total_task, COALESCE( t1.total_pending, 0 ) AS total_pending, COALESCE( t2.total_complete, 0 ) AS total_complete, COALESCE( t3.total_decline, 0 ) AS total_decline FROM (SELECT name, COUNT( * ) AS total_task FROM task GROUP BY name)t4 CROSS JOIN (SELECT name, COUNT( * ) AS total_pending FROM task WHERE pending = 'true'GROUP BY name)t1 ON t4.name = t1.name LEFT JOIN (SELECT name, COUNT( * ) AS total_complete FROM task WHERE complete = 'true'GROUP BY name)t2 ON t1.name = t2.name LEFT JOIN (SELECT name, COUNT( * ) AS total_decline FROM task WHERE decline = 'true' GROUP BY name)t3 ON t1.name = t3.name"; 
    
   con.query(select_data,function (error,results,fields){
       if (error) throw error
       res.render("dashboard", { results,user});
    })
})

// ========================select name query==========================

app.get('/addtask', function (req, res) {
    var code = 'user';
    var query = "SELECT * FROM registration WHERE code = '" + code + "'";

    con.query(query, function (error, results, fields) {
        if (error) throw error;
        res.render('addtask', { results });
    });
});

// ===========================insert task into db==========================

app.post('/addtask', function (req, res) {
    var name = req.body.selectedUser;
    var date = req.body.date;
    var task = req.body.task;
    var pending = 'true';
    var complete = 'false';
    var decline = 'false';

    var query = "INSERT INTO task (name, date, task, pending, complete, decline) VALUES ('" + name + "','" + date + "','" + task + "','" + pending + "','" + complete + "','" + decline + "')";

    con.query(query, function (error, results) {
        if (error) throw error;
        res.redirect('/addtask');
    });
});

// =========================user dashboard query==========================

app.get('/userdashboard', function (req, res) {
    var data = "SELECT * FROM task WHERE name = '"+user+"' AND pending = 'true'";
    con.query(data, function (error, results, fields) {
        if (error) throw error;
        res.render("userdashboard", { results,user });
    });
});

// =============================add complete task update query==================================

app.get('/complete/:id',function(req,res){
    id = req.params.id;
    var data = "update task set complete = 'true', pending = 'false' , decline='false' where id = " + id;

    con.query(data,function(error,results,feild){
        if(error) throw error;
    res.redirect('/userdashboard')
    })
})

// ============================complete task page query======================

app.get('/complete',function(req,res){
    var data = "SELECT * FROM task WHERE name = '"+ user +"' AND complete = 'true'";

    con.query(data,function(error,results,fields){
        if(error) throw error;
        res.render('complete',{results,user})
    })

})

//=========================add decline task page query=============================

app.get('/decline/:id',function(req,res){
    var id = req.params.id;
    var data = "update task set decline = 'true', pending = 'false' , complete='false' where id = " + id;

    con.query(data,function(error,results,fields){
        if (error) throw error;
        res.redirect('/userdashboard')
    })
})

// ===============================decline task page===============================

app.get('/decline',function(req,res){
    var data = "SELECT * FROM task WHERE name = '"+user+"' AND decline = 'true'";

    con.query(data,function(error,results,fields){
        if(error) throw error;
        res.render('decline',{results,user})
    })
})

app.listen(5000);