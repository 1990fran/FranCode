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

/*   -------------------- GET ---------------------------
var connection = null;
rethinkdb.connect({host : 'localhost', port :
        28015},function(err,conn) {
    if(err) {
        throw new Error('Connection error');
    } else {
        connection = conn;
        rethinkdb.db('francode_DB').table('doc_users').run(connection,function (err,cursor) {
            if(err){
                throw err;
            }else{
                cursor.toArray(function(err,result) {
                    console.log(result);
                });
            }

        })
    }
});
*/
//------------------- INSERT -----------------------------
/*var connection = null;
rethinkdb.connect({host : 'localhost', port :
        28015},function(err,conn) {
    if(err) {
        throw new Error('Connection error');
    } else {
        connection = conn;
        rethinkdb.db('francode_DB').table('doc_users').insert(
        {
            nombre:  "shahid" ,
            password:  "password123" ,
            rol: 1,
            createdDate:new Date()
        }
        ).run(connection,function (err,response) {
            if(err){
                throw err;
            }else{
                console.log(response);
            }

        });
    }
});
*/
//---------------- leyendo el documento
/*var connection = null;
rethinkdb.connect({host : 'localhost', port :
        28015},function(err,conn) {
    if(err) {
        throw new Error('Connection error');
    } else {
        connection = conn;
        rethinkdb.db('francode_DB').table('doc_users').run(connection,function (err,cursor) {
            if(err){
                throw err;
            }else{
                cursor.toArray(function (err,result) {
                   console.log(result);
                });
            }

        });
    }
});
*/
//-------- Filtrar por ID ---------------
/*var connection = null;
rethinkdb.connect({host : 'localhost', port :
        28015},function(err,conn) {
    if(err) {
        throw new Error('Connection error');
    } else {
        connection = conn;
        rethinkdb.db('francode_DB').table('doc_users').get('5fa0dc11-fd7b-41f1-86b6-a9a630d89dea').run(connection,function (err,data) {
            if(err){
                throw err;
            }else{
                console.log(data);
            }

        });
    }
});
*/
//----------- Actualizando documento
/*var connection = null;
rethinkdb.connect({host : 'localhost', port :
        28015},function(err,conn) {
    if(err) {
        throw new Error('Connection error');
    } else {
        connection = conn;
        rethinkdb.db('francode_DB').table('doc_users').get('5fa0dc11-fd7b-41f1-86b6-a9a630d89dea')
            .update({nombre:'shahidshakt'})
            .run(connection,function (err,response) {
            if(err){
                throw err;
            }else{
                console.log(response);
            }

        });
    }
});
*/
//--------------- Eliminando documento
/*var connection = null;
rethinkdb.connect({host : 'localhost', port :
        28015},function(err,conn) {
    if(err) {
        throw new Error('Connection error');
    } else {
        connection = conn;
        rethinkdb.db('francode_DB').table('doc_users').get('5fa0dc11-fd7b-41f1-86b6-a9a630d89dea')
            .delete()
            .run(connection,function (err,response) {
                if(err){
                    throw err;
                }else{
                    console.log(response);
                }

            });
    }
});
*/



//var r=require('rethinkdb');


//var configDB=require('./config/database');

/*var connection=null;
//conectarme a rethikdb
r.connect(configDB.rethinkdb,function (err,conn) {
    if(err){
        throw new Error('Coneccion error');
    }else{
        connection=conn;
        console.log(connection);
    }
});*/



/*r.table('doc_user').run(connection,function (err,cursor) {
    if(err){
        throw new Error();
    }
    cursor.toArray(function (err,result) {
        console.log(result);
    });
});
*/

/*var connection = null;
rethinkdb.connect({host : 'localhost', port :
        28015},function(err,conn) {
    if(err) {
        throw new Error('Connection error');
    } else {
        connection = conn;
        rethinkdb.db('francode_DB').table('doc_users').filter({nombre:"admin"}).run(connection,function (err,cursor) {
            if(err){
                throw err;
            }else{
                cursor.toArray(function(err,result) {
                    console.log(result);
                });
            }

        })
    }
});
*/
//configuraciones
var app = express();

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

// Setup our db so we can get started
//instalando la base de datos f
setupDatabase();

function setupDatabase() {
    r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
        if (err) throw err;
        connection = conn;
    }).then(res => {
        r.dbCreate(config.database).run(connection, function(err, res) {
            if (err) {
                console.log('Database "' + config.database + '" Exists!');
            }
            else {
                console.log('Created database ' + config.database +'!');
            }
        });
    r.db(config.database).tableCreate('users').run(connection, function(err, res) {
        if (err) {
            console.log('Table "users" already exists!');
        }
        else {
            console.log('Created table "users"!');
        }
    });
    r.db(config.database).table('users').filter(r.row('username').eq('admin')).run(connection, function(err, res) {
        if (err) {
            console.log('error retrieving users...');
            return;
        }
        res.toArray(function(err, users) {
            if (users.length != 0) {
                console.log('User "admin" already exists!');
            }
            else {
                r.db(config.database).table('users').insert({
                    username: 'admin',
                    password: bcrypt.hashSync('password'),
                    roll: 0
                }).run(connection, function(err, res) {
                    console.log('Created default user "admin"');
                });
            }
        });
    })
});
}

//-------------------- RUTAS ---------------------
//le paso la apliacion y pasport para poder autentificar las rutas
require('./routes/routes')(app,passport);

// Setup PassportJS local authentication strategy
passport.use(new local(
    function(username, password, done) {
        r.db(config.database).table('users').filter(r.row('username').eq(username)).run(connection, function (err, user) {
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
    r.db(config.database).table('users').filter(r.row('id').eq(id)).run(connection, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        user.toArray(function(err, result) {
            if (err) throw err;
            return done(null, result[0]);
        });
    });
});

// Utility function to validate authentication has taken place
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    if (req.method == 'GET') req.session.returnTo = req.originalUrl;
    res.redirect('/');
}





//------------------- motor de base de datos 
/*var mysql = require('mysql');
//creando la conexion ala base de datos 
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: "fran_code"
});*/

/*con.connect(function(err){
    if(err) throw err;
    console.log("Conectado mysql");
});*/

//static middleware: carpeta public 
app.use(express.static(__dirname + '/public'));

//puerto donde voy a ejecutar el servidor 
app.set('port', process.env.PORT || 3005);

//escuchando en el puerto que le especifique
app.listen(app.get('port'), function () {
    console.log('Express started on http//localhost:' +
        app.get('port') + '; press CTRL + C to terminate')
});
//----------------------- VISTAS -----------------------
//pagina home de inicio

/*app.get('/', function (req, res) {
    body: '<h1>Espacio de Trabajo</h1>';
    res.render('home');
});

app.get('/home', function (req, res) { 
    res.render('homePrincipal',{layout:'mainHome'});
});

app.get('/registrarUser', function (req, res) {
    res.render('registroUser',{layout:'mainHome'});
});

//pagina de contacto
app.get('/planes', function (req, res) {
    res.render('planes',{layout:'mainHome'});
});
*/
//pagina de contacto
/*
app.get('/login', function (req, res) {
    res.render('login',{layout:'mainHome'});
});

//pagina de contacto
app.get('/registrarse', function (req, res) {
    res.render('registrarse',{layout:'mainHome'});
});

//pagina de contacto
app.get('/contacto', function (req, res) {
    res.render('contacto');
});
*/
//----------------- Vistas de Proyectos -------------------

/*app.get('/proyectos', function (req, res) {
    res.render('proyectos');
});

app.get('/getProyectos', function (req, res) {
    con.query('SELECT * FROM tbl_proyectos_usuarios',[], 
    function(err, rows, fields){        
        res.send(rows);
        res.end();
    });  
    //res.render('proyectos');
});

app.get('/ProyectoCrear',function(req,res){
    res.render('proyectoCrear');
});

app.get('/AdminProyecto',function(req,res){
    res.render('proyectoAdmin',{layout:'editor'});
});
*/




//404 catch-all hander (midleware)
app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
});

//500 error handler (midlwware)
app.use(function (res, req) {
    res.status(500);
    res.render('500');
});