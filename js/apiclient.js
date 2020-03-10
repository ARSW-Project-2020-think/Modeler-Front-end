var apiclient = (function () {


    return {
        registrarse: function(newUsuario) {
            alert("ENTRO REGISTRER");
            var register = $.ajax({type: "POST", url:"https://class-modeler.herokuapp.com/user",
                    data: JSON.stringify(newUsuario), contentType: "application/JSON"});
            register.then (function(){
                location.href = "mainPage.html";
            }, function(){
                alert("Usuario o correo electrónico inválidos");
                location.href = "index.html";
            });
        }
    }


})();
