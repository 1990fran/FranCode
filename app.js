var express = require('express');
var  path=require('path');
var passport=require('passport');
var local=require('passport-local').Strategy;
var flash=require('connect-flash');
var morgan=require('morgan');
//para poder adminsitrar la cookies
var cookieParser=require('cookie-parser');
var bodyParser=require('body-parser');
var session=require('express-session');
//rethindb
var config=require('./config/database');
var r = require('rethinkdb');
var bcrypt = require('bcrypt-nodejs');

//configuraciones
var app = express();

//configurando sokect io
var http=require('http').Server(app);
var io=require("socket.io")(http);

//static middleware: carpeta public
app.use(express.static(__dirname + '/public'));
//midlewares
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(session({
    secret:'Fran20082502077',
    //para que nos e guarde cada sierto tiempo
    resave:false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
//unir passpor a las secciones para que se guarde dentro del mismo navegador
app.use(passport.session());
//para pasar mensajes entre los modulos
app.use(flash());

//requerir pasport para la autentificacion
//require('./config/passport')(passport);


//------------------motor de plantillas 
var handlebars = require('express3-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        section: function (name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//creando la conexion a la base de datos
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;
    if (err) throw err;
    r
        .db("test")
        .tableList()
        .run(conn, function(err, response) {
            if (response.indexOf("edit") > -1) {
                // do nothing it is created...
                console.log("Table exists, skipping create...");
                console.log("Tables - " + response);
            } else {
                // create table...
                console.log("Table does not exist. Creating");
                r
                    .db("test")
                    .tableCreate("edit")
                    .run(conn);
            }
        });


});

//-------------------- RUTAS ---------------------
//le paso la apliacion y pasport para poder autentificar las rutas
require('./routes/routes')(app,passport,r,config);

// Setup PassportJS local authentication strategy
passport.use(new local(
    function(username, password, done) {
        r.db(config.database).table('doc_users').filter(r.row('username').eq(username)).run(connection, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }

            user.toArray(function(err, result) {
                if (err) throw err;
                if (result.length == 0) { return done(null, false); }
                if (!bcrypt.compareSync(password, result[0].password)) { return done(null, false); }
                return done(null, result[0]);
            });
        });
    }
));

// Provide a user serialization method
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// Deserialize the user: Get the record from the db and return it
passport.deserializeUser(function (id, done) {
    r.db(config.database).table('doc_users').filter(r.row('id').eq(id)).run(connection, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        user.toArray(function(err, result) {
            if (err) throw err;
            return done(null, result[0]);
        });
    });
});

//puerto donde voy a ejecutar el servidor 
http.listen(3005, "0.0.0.0", function() {
    console.log("listening on: 0.0.0.0:3005");
});

//Code mirror
// Setup Database
/*
r.connect({ host: "localhost", port: 28015 }, function(err, conn) {
    if (err) throw err;
    r
        .db("test")
        .tableList()
        .run(conn, function(err, response) {
            if (response.indexOf("edit") > -1) {
                // do nothing it is created...
                console.log("Table exists, skipping create...");
                console.log("Tables - " + response);
            } else {
                // create table...
                console.log("Table does not exist. Creating");
                r
                    .db("test")
                    .tableCreate("edit")
                    .run(conn);
            }
        });

    // Socket Stuff
    io.on("connection", function(socket) {
        console.log("a user connected");
        socket.on("disconnect", function() {
            console.log("user disconnected");
        });
        socket.on("document-update", function(msg) {
            console.log(msg);
            r
                .table("edit")
                .insert(
                    { id: msg.id, value: msg.value, user: msg.user },
                    { conflict: "update" }
                )
                .run(conn, function(err, res) {
                    if (err) throw err;
                    //console.log(JSON.stringify(res, null, 2));
                });
        });
        r
            .table("edit")
            .changes()
            .run(conn, function(err, cursor) {
                if (err) throw err;
                cursor.each(function(err, row) {
                    if (err) throw err;
                    io.emit("doc", row);
                });
            });
    });


});
*/

// Socket Stuff
io.on("connection", function(socket) {
    console.log("a user connected");
    socket.on("disconnect", function() {
        console.log("user disconnected");
    });
    socket.on("document-update", function(msg) {
        console.log(msg);
        r
            .table("edit")
            .insert(
                { id: msg.id, value: msg.value, user: msg.user },
                { conflict: "update" }
            )
            .run(connection, function(err, res) {
                if (err) throw err;
                //console.log(JSON.stringify(res, null, 2));
            });
    });
    r
        .table("edit")
        .changes()
        .run(connection, function(err, cursor) {
            if (err) throw err;
            cursor.each(function(err, row) {
                if (err) throw err;
                io.emit("doc", row);
            });
        });
});