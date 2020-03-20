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
        userData:function(token,callback){
        	console.log("userdata");
            console.log(token);
            var promise = $.ajax({
                type:"GET",
                url:"https://class-modeler.herokuapp.com/user/data",
                headers:{"Authorization":token}
            });
            promise.then(function(data){
            	console.log(data);
                callback(null,data);
            },function(err){
            	console.log("userData err"+err);
                callback(err,null);
            });
        },Projects:function(token,user,callback){
            console.log("obtiene proyectos");
            console.log("username "+userSelect);
            var prom = $.get({
                url:"https://class-modeler.herokuapp.com/projectapi/"+user+"/project",
                headers:{"Authorization":token}
            });
            prom.then(function(data){
            	console.log("ini data");
            	console.log(data);
                callback(null,data);
            },function(err){
                callback(err,null);
            });
        },registrarPryecto:function(token,username,nombreProyecto,publico,callback){
        	var json = {"nombre":nombreProyecto,"publico":publico};
        	var promesa = $.post({
        		url:"https://class-modeler.herokuapp.com/projectapi/"+username+"/project",
        		headers:{"Authorization":token},
        		data:JSON.stringify(json),
        		contentType:"application/json"
        	});
        	promesa.then(function(){
        		callback(null);
        	},function(err){
        		callback(err);
        	});
        }
    }
})();
