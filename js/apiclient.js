var apiclient = (function () {


    return {
        registrarse: function(newUsuario) {
            alert("ENTRO REGISTRER");
            var register = $.post({url:"https://class-modeler.herokuapp.com/user",
                    data: JSON.stringify(newUsuario), contentType: "application/JSON"});
            register.then (function(){
                alert("correct ");
                location.href = "mainPage.html";
            }, function(){
                alert("Usuario o correo electrónico inválidos");
                //location.href = "index.html";
            });
        },login:function(email,password,callback){
            var json = {username:email,password:password};
            console.log(JSON.stringify(json));
            var promise = $.post({
                url:"https://class-modeler.herokuapp.com/user/login",
                data: JSON.stringify(json),contentType: "application/json"
            });
            promise.then(function(data){
                callback(email,password,data.token);
            },function(data){
                alert("Error en credenciales");
            });

        }
    }


})();
