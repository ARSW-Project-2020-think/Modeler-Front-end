var apiclient = (function () {
    var userSelect = null;
    return {
        registrarse: function(newUsuario) {
            //alert("ENTRO REGISTRER");
            var register = $.post({url:"https://class-modeler.herokuapp.com/user",
                    data: JSON.stringify(newUsuario), contentType: "application/JSON"});
            register.then (function(){
                //alert("correct ");
                app.login(newUsuario.correo, newUsuario.password, null);
                //onsole.log(newUsuario.username + "  "  + newUsuario.password + " ");
            }, function(){                
                alert("Usuario o correo electrónico inválidos");
                location.href = "register.html";
                //location.href = "index.html";
            });
        },login:function(email,password,callback){
            var json = {username:email,password:password};
            //console.log(JSON.stringify(json));
            var promise = $.post({
                url:"https://class-modeler.herokuapp.com/user/login",
                data: JSON.stringify(json),contentType: "application/json"
            });
            promise.then(function(data){
                callback(email,password,data.token);
            },function(data){
                alert("Error, correo electrónico o contraseña inválidos.");
            });

        },
        getToken:function(email,password,fun,calback){
            var json = {username:email,password:password};
            var promise = $.post({
                url:"https://class-modeler.herokuapp.com/user/login",
                data: JSON.stringify(json),contentType: "application/json"
            });
            promise.then(function(data){
                fun(data.token,calback);
            },function(){

            });
        },
        userData:function(token,calback){
            console.log(token);
            var promise = $.ajax({
                type:"GET",
                headers:{"Authorization":token},
                url:"https://class-modeler.herokuapp.com/user/data",
                contentType:"application/json"
            });
            console.log(promise);
            promise.then(function(data){
                console.log(data);
                userSelect=data;
                calback(null,data);
            },function(err){
                calback(err,null);
            });
        },Projects:function(token,callback){
            console.log("obtiene proyectos");
            console.log("username "+userSelect);
            var prom = $.get({
                url:"https://class-modeler.herokuapp.com/"+userSelect.username+"/project",
                headers:{"Authorization":token}
            });
            prom.then(function(data){
                callback(null,data);
            },function(err){
                callback(err,null);
            });
        }
    }


})();