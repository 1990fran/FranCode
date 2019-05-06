//como vamos a logearlo y configurar la base de datos
//estrategia local
var r=require('rethinkdb');
var config=require('./database');
var local=require('passport-local').Strategy;


//conectarme a rethikdb
var connection=null;

module.exports=function (passport) {
    //metodo que serieliza a los usuario
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        r.db(config.database).table('users').filter(r.row('id').eq(id)).run(connection, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            user.toArray(function (err, result) {
                if (err) throw err;
                return done(null, result[0]);
            });
        });
    });



    //------ LOGIN ----
    passport.use(new local(
        function (email, password, done) {
            r.db(config.database).table('users').filter(r.row('username').eq(email)).run(connection, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }

                user.toArray(function (err, result) {
                    if (err) throw err;
                    if (result.length == 0) {
                        return done(null, false);
                    }
                    if (!bcrypt.compareSync(password, result[0].password)) {
                        return done(null, false);
                    }
                    return done(null, result[0]);
                });
            });
        }
    ));

}