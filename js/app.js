var app = (function () {
    var createSession = function(email,password,token){
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("password", password);
        sessionStorage.setItem("token", token);
        location.href = "mainPage.html";
    }
    return {
        registrarse: function(user, email, password,event) {
            event.preventDefault();
            //console.log("Primero");
            //alert("HOLA1");
            var newUsuario = {username:user, correo: email, password: password};
            apiclient.registrarse(newUsuario);
            //alert("HOLA2");
        },login:function(email,password,event){
            event.preventDefault();
            apiclient.login(email,password,createSession);
        }
    }





})();