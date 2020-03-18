var app = (function () {
    var createSession = function(email,password,token){
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("password", password);
        location.href = "index.html";
    }
    var updateView = function(error,user){
        if(error!=null) return;
        $("#uservar").text(user.username);
    };
    var updateProjects = function(error,data){
        if(error!=null){
            console.log(error);
            return ;
        } 
        console.log(data);
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
            }
            apiclient.getToken(sessionStorage.getItem("email"),sessionStorage.getItem("password"),apiclient.userData,updateView);
            console.log("obtuvo user");
            apiclient.getToken(sessionStorage.getItem("email"),sessionStorage.getItem("password"),apiclient.Projects,updateProjects);
            console.log("obtuvo pr");
        },logout:function(){
        	sessionStorage.clear();
        	location.href = "login.html";
        }
    }





})();