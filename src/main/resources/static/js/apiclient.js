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
        		callback(null,nombreProyecto);
        	},function(err){
        		callback(err,null);
        	});
        },getModels:function(usuario,proyecto,version,token,callback){
        	var promise = $.get({
        		url:"https://class-modeler.herokuapp.com/projectapi/"+usuario+"/project/"+proyecto+"/version/"+version+"/modelo",
        		headers:{"Authorization":token}
        	});
        	promise.then(function(data){
        		callback(null,data);
        	},function(error){
        		callback(error,null);
        	});
        },registrarModelo:function(usuario,proyecto,version,nombre,tipo,token,callback){
        	var obj = {"nombre":nombre,"tipo":tipo};
        	var promise = $.post({
        		url:"https://class-modeler.herokuapp.com/projectapi/"+usuario+"/project/"+proyecto+"/version/"+version+"/modelo",
        		data:JSON.stringify(obj),
        		contentType:"application/json",
        		headers:{"Authorization":token}
        	});
        	promise.then(function(){
        		callback(null,usuario,proyecto,version,nombre);
        	},function(err){
        		callback(err,null,null,null,null);
        	})
        },registrarRectangulo:function(usuario,proyecto,version,modelo,token,rectangulo,callback){
        	var promise = $.post({
        		url:"https://class-modeler.herokuapp.com/projectapi/"+usuario+"/project/"+proyecto+"/version/"+version+"/modelo/"+modelo+"/rectangle",
        		data:JSON.stringify(rectangulo),
        		headers:{"Authorization":token},
        		contentType:"application/json"
        	});
        	promise.then(function(){
        		callback(null,rectangulo);
        	},function(err){
        		console.log(err);
        		callback(err,null);
        	});
        },getRectangulos(usuario,proyecto,version,modelo,token,callback){
        	var promise = $.get({
        		url:"https://class-modeler.herokuapp.com/projectapi/"+usuario+"/project/"+proyecto+"/version/"+version+"/modelo/"+modelo,
        		headers:{"Authorization":token},
        	});
        	promise.then(function(data){
        		callback(null,data.rectangulos);
        	},function(err){
        		callback(err,null);
        	});
        }
    }
})();
