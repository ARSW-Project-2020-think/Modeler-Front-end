var app = (function () {

    return {
        registrarse: function(user, email, password) {
            console.log("Primero");
            alert("HOLA1");
            var newUsuario = {username:user, correo: email, password: password};
            apiclient.registrarse(newUsuario);
            alert("HOLA2");
        }
    }





})();