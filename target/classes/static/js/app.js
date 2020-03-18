var app = (function () {
    var createSession = function(email,password,token){
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("password", password);
        sessionStorage.setItem("token",token);
        apiclient.userData(token,saveUsername);
    }
    var setToken = function(email,password,token){
    	sessionStorage.setItem("token",token);
    	console.log("actualizo token: "+token);
    }
    var saveUsername= function(err,user){
    	if(err!=null){
    		return;
    	}
    	sessionStorage.setItem("username",user.username);
    	location.href = "index.html";
    }
    var updateView = function(error,user){
        if(error!=null) return;
        $("#uservar").text("Usuario: "+user.username);
        $("#email").text("Correo: "+user.correo);
    };
    var updateProjects = function(error,data){
        if(error!=null){
            console.log(error);
            return ;
        } 
        console.log(data);
        if(data.length==0){
        	$("#cont").html("<h1>No tienes actualemnete proyectos, crea uno nuevo</h1>");
        }
    }
    return {
        registrarse: function(user, email, password, event) {
            event.preventDefault();
            //console.log("Primero");
            //alert("HOLA1");
            var newUsuario = {username:user, correo: email, password: password};
            apiclient.registrarse(newUsuario);
            //alert("HOLA2");
        },login:function(email,password,event){
            if (event != null) {
                event.preventDefault();
            }
            apiclient.login(email,password,createSession);
        },validate:function(){
            if(sessionStorage.getItem("email")!=null){
                location.href = "index.html";
            }
        },loadPage:function(){
            if(sessionStorage.getItem("email")==null){
                location.href = "login.html";
                return ;
            }
            apiclient.userData(sessionStorage.getItem("token"),updateView);
            console.log("obtuvo user");
            apiclient.Projects(sessionStorage.getItem("token"),sessionStorage.getItem("username"),updateProjects);
            //apiclient.getToken(sessionStorage.getItem("email"),sessionStorage.getItem("password"),apiclient.Projects,updateProjects);
            console.log("obtuvo pr");
            //Actualiza cada media hora el token
            window.setInterval(function(){
            	//app.login(sessionStorage.getItem("email"),sessionStorage.getItem("password"));
            	apiclient.login(sessionStorage.getItem("email"),sessionStorage.getItem("password"),setToken);
            },1000*60*10);
        },logout:function(){
        	sessionStorage.clear();
        	location.href = "login.html";
        },redirectValidation(){
        	if(sessionStorage.getItem("email")==null){
                location.href = "login.html";
                return ;
            }
        	apiclient.userData(sessionStorage.getItem("token"),updateView);
        },registrarProyecto(nombre,publico){
        	console.log(nombre,publico);
        	if(publico=="on"){
        		apiclient.registrarPryecto(sessionStorage.getItem("token"),sessionStorage.getItem("username"),nombre,true);
        	}else{
        		apiclient.registrarPryecto(sessionStorage.getItem("token"),sessionStorage.getItem("username"),nombre,false);
        	}
        }
    }





})();