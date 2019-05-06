module.exports = function(app, passport,r,config,bodyparser) {
    // Utility function to validate authentication has taken place
    // Utility function to validate authentication has taken place



    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) return next();
        if (req.method == 'GET') req.session.returnTo = req.originalUrl;
        res.redirect('/');
    }
    // Setup the views
    app.get('/', function(req, res) {
        res.render('index',{authed: req.isAuthenticated()});
    })

    app.get('/secret', ensureAuthenticated, function(req, res) {
        res.render('secret', {authed: req.isAuthenticated(),user:req.user});
    })

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.get('/login', function (req, res) {
        res.render('login');
    });

    app.get('/registrarse', function (req, res) {
        //console.log(req.body.full_name);
        res.render('registrarse');

    });

    app.post('/registrarse',function (req,res) {
        r.db("francode_DB").table("doc_users").insert({"nombre":req.body.nombre,"nombre":req.body.email,"password":req.body.nombre,}
        ).run(connection,function (err,response) {
            if(err){
                throw err;
                res.send({status:0,mensaje:"Error al registrar usuario"});

            }else{
                console.log(response);
                res.send({status:1,mensaje:"Usuario Registrado correctamente"});
                //res.redirect('/login',req.body.nombre,req.body.password);

            }

        });
        //console
          //  .log(req.body.nombre);
        //req.body.nombre
    });



    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/' }),
        function(req, res) {
            res.redirect('/secret');
    });



    //planes de pago
    app.get('/planes', function(req, res) {
        res.render('planes',{authed: req.isAuthenticated()});
    });

    //proyectos
    app.get('/AdminProyecto', function(req, res) {
        res.render('proyectoAdmin',{authed: req.isAuthenticated()});
    });
    //=============== Proyectos ============================
    app.get('/AdminProyecto/:id', function(req, res) {
        res.render('proyectoAdmin',{authed: req.isAuthenticated(), id_proyecto : req.params.id,user:req.user});
    });

    app.get('/proyectoCrear', function(req, res) {
        res.render('proyectoCrear',{authed: req.isAuthenticated()});
    });

    //retorno el directorio del proyecto
    app.get('/AdminProyecto/getDirProyecto/:id',function (req,res) {
        //  r.db("francode_DB").table("doc_proyectos").get('e0ece719-ae34-4dc5-b164-77bdd97fe65b')('directorio')
        //res.render('proyectoCrear');
        r.db('francode_DB').table('doc_proyectos')
            .get(req.params.id)('directorio')
            .run(connection, function(err, result) {
                if (err) throw err;
                //res.send(result);
                //console.log(result);
                res.jsonp(result);

                //return next(result);
            });

    });
    
    app.post('/AdminProyecto/insertFolderProyecto',function (req,res) {
        //console.log(req);
        //insertando folder en doc carpeta proyecto
        /*r.db("francode_DB").table("doc_carpeta_proyecto").insert({
            id_proyecto:req.body.id_proyecto,
            id_folder:req.body.idFolder,
            text:req.body.text,
            icon:req.body.icon
            }
        ).run(connection,function (err,response) {
            if(err){
                throw err;
            }else{
                console.log(response);
            }

        });*/
        //console.log(req.body.arbolJSON);
        //actualizando el json
        //r.db("francode_DB").table("doc_proyectos").get(req.body.id_proyecto).update({"directorio":JSON.stringify(req.body.arbolJSON)}
        r.db("francode_DB").table("doc_proyectos").get(req.body.id_proyecto).update({"directorio":req.body.arbolJSON}
        ).run(connection,function (err,response) {
            if(err){
                throw err;
            }else{
                console.log(response);
            }

        });
        //res.send("aqui");
        //res.send(req.body);
    });



    app.get('/proyectos', function(req, res) {
        res.render('proyectos',{authed: req.isAuthenticated(),user:req.user});
    });

    //generar numeros aleatorios para identificar un documento htm,css,js
    function randomString(length) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

        if (!length) {
            length = Math.floor(Math.random() * chars.length);
        }

        var str = '';
        for (var i = 0; i < length; i++) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
        return str;
    }

    //registrando Proyectos
    app.post('/proyectos',function (req,res) {

        //res.render('proyectos',{authed: req.isAuthenticated()});
        //console.log(req.body.user_id);
        id_gen_uno=randomString(10);
        id_gen_dos=randomString(10);
        id_gen_tres=randomString(10);
        r.db("francode_DB").table("doc_proyectos").insert(
            //{"nombre":req.body.nombre,"nombre":req.body.email,"password":req.body.nombre,}

            {
                "descripcion":  req.body.descripcion ,
                //"directorio": '[{"id":"ajson1","text":"Public","icon":true,"li_attr":{"id":"ajson1"},"a_attr":{"href":"#","id":"ajson1_anchor"},"state":{"loaded":true,"opened":true,"selected":false,"disabled":false},"data":{},"children":[{"id":"CUre9EzZqS","text":"index.html","icon":"../img/iconos/code.png","li_attr":{"id":"CUre9EzZqS"},"a_attr":{"href":"#","id":"CUre9EzZqS_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"children":[]},{"id":"STuHM4q2gN","text":"controller.js","icon":"../img/iconos/code.png","li_attr":{"id":"STuHM4q2gN"},"a_attr":{"href":"#","id":"STuHM4q2gN_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"children":[]},{"id":"yohJhlfm2I","text":"styles.css","icon":"../img/iconos/code.png","li_attr":{"id":"yohJhlfm2I"},"a_attr":{"href":"#","id":"yohJhlfm2I_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"children":[]}]},{"id":"ajson2","text":"Other","icon":true,"li_attr":{"id":"ajson2"},"a_attr":{"href":"#","id":"ajson2_anchor"},"state":{"loaded":true,"opened":true,"selected":false,"disabled":false},"data":{},"children":[]}]' ,
                "directorio": '[{"id":"ajson1","text":"Public","icon":true,"li_attr":{"id":"ajson1"},"a_attr":{"href":"#","id":"ajson1_anchor"},"state":{"loaded":true,"opened":true,"selected":false,"disabled":false},"data":{},"children":[{"id":"'+id_gen_uno+'","text":"index.html","icon":"../img/iconos/code.png","li_attr":{"id":"'+id_gen_uno+'"},"a_attr":{"href":"#","id":"'+id_gen_uno+'_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"children":[]},{"id":"'+id_gen_dos+'","text":"controller.js","icon":"../img/iconos/code.png","li_attr":{"id":"'+id_gen_dos+'"},"a_attr":{"href":"#","id":"'+id_gen_dos+'_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"children":[]},{"id":"'+id_gen_tres+'","text":"styles.css","icon":"../img/iconos/code.png","li_attr":{"id":"'+id_gen_tres+'"},"a_attr":{"href":"#","id":"'+id_gen_tres+'_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"children":[]}]},{"id":"ajson2","text":"Other","icon":true,"li_attr":{"id":"ajson2"},"a_attr":{"href":"#","id":"ajson2_anchor"},"state":{"loaded":true,"opened":true,"selected":false,"disabled":false},"data":{},"children":[]}]' ,
                 "fecha":  new Date(),
                "nombre_proyecto":  req.body.nombre ,
                "user_id":  req.body.user_id
            }
        ).run(connection,function (err,response) {
            if(err){
                throw err;
                res.send({status:0,mensaje:"Error al registrar proyecto"});

            }else{
                console.log(response);
                res.send({status:1,mensaje:"Proyecto Registrado correctamente"});
                //res.redirect('/login',req.body.nombre,req.body.password);

            }

        });
    });

    app.post('/eliminarProyecto/:id',function (req,res) {
        r.db('francode_DB').table('doc_proyectos').get(req.params.id)
            .delete()
            .run(connection,function (err,response) {
                if(err){
                    throw err;
                    res.send({status:0,mensaje:"Registro Exitoso"});
                }else{
                    //console.log(response);
                    res.send({status:1,mensaje:"Registro Exitoso"});
                }

            });

    });


    app.get('/getUsuarios', function(req, res) {
        r.db('francode_DB').table('doc_users').run(connection,function (err,cursor) {
            if(err){
                throw err;
            }else{
                cursor.toArray(function (err,result) {
                    //console.log(result);
                    res.send(result);
                });
            }

        });
    });

    app.get('/getProyectos/:id', function(req, res) {
        //r.db("francode_DB").table("doc_proyectos").filter(
        //.filter({nombre:"admin"}).run
        r.db("francode_DB").table("doc_proyectos").filter({user_id:req.params.id}).run(connection,function (err,cursor) {
            if(err){
                throw err;
            }else{
                cursor.toArray(function (err,result) {
                    //console.log(result);
                    res.send(result);
                });
            }

        });
        /*r.db(config.database).table('users')
            //.get(req.params.id)
            .run(connection, function(err, result) {
                if (err) throw err;
                res.send(result);
                //return next(result);
            });*/
    });


    //code MIrror
    app.get("/getData/:id", function(req, res, next) {
        r
            .table("edit")
            .get(req.params.id)
            .run(connection, function(err, result) {
                if (err) throw err;
                res.send(result);
                //return next(result);
            });
    });
    //404 catch-all hander (midleware)
   /* app.use(function (req, res, next) {
        res.status(404);
        res.render('404',{authed: req.isAuthenticated()});
    });

//500 error handler (midlwware)
    app.use(function (res, req) {
        res.status(500);
        res.render('500',{authed: req.isAuthenticated()});
    });*/



};