$(document).ready(function(){

    $('#idPassword2').keyup(function(){
        var passwd = $('#idPassword').val();
        var passwd2 = $('#idPassword2').val();

        if (passwd != "") {
            if (passwd == passwd2) {
                cambios(1);
            } else if (passwd2 == "") { 
                cambios(2);
            } else {
                cambios(3);
            }            
        } else if (passwd == "" && passwd2 == ""){
            cambios(4);
        } 

        /*if (passwd != "") {
            if (passwd == passwd2) {
                $('#idConfirmacion').text("Las contraseñas coinciden.").css("color", "green");
            } else if (passwd2 == "") { 
                $('#idConfirmacion').text("No puede dejar el espacio en blanco!").css("color", "red");
            } else {
                $('#idConfirmacion').text("Las contraseñas no coinciden.").css("color", "red");
            }            
        } else if (passwd == "" && passwd2 == ""){
            $('#idConfirmacion').empty();
        }*/ 

    });

    $('#idPassword').keyup(function(){
        var passwd = $('#idPassword').val();
        var passwd2 = $('#idPassword2').val();
    
        if (passwd2 != "") {
            if (passwd == passwd2) {
                cambios(1);
            } else if (passwd == "") { 
                cambios(2);
            } else {
                cambios(3);
            }            
        } else if (passwd == "" && passwd2 == ""){
            cambios(4);
        }

        /*if (passwd2 != "") {
            if (passwd == passwd2) {
                $('#idConfirmacion').text("Las contraseñas coinciden.").css("color", "green");
            } else if (passwd == "") { 
                $('#idConfirmacion').text("No puede dejar el espacio en blanco!").css("color", "red");
            } else {
                $('#idConfirmacion').text("Las contraseñas no coinciden.").css("color", "red");
            }            
        } else if (passwd == "" && passwd2 == ""){
            $('#idConfirmacion').empty();
        }*/

    
    });

    var cambios = function(opcion) {
        if (opcion == 1) {
            $('#idConfirmacion').css("background", "url(images/icons/bien.png)");
            $('#idConfirmacion').prop("title", "Las contraseñas coinciden");
            $('#idConfirmacion2').css("background", "url(images/icons/bien.png)");
            $('#idConfirmacion2').prop("title", "Las contraseñas coinciden");
        } else if (opcion == 2) {
            $('#idConfirmacion').css("background", "url(images/icons/error.png)");
            $('#idConfirmacion').prop("title", "No puede dejar el espacio en blanco!");
            $('#idConfirmacion2').css("background", "url(images/icons/error.png)");
            $('#idConfirmacion2').prop("title", "No puede dejar el espacio en blanco!");
        } else if (opcion == 3) {
            $('#idConfirmacion').css("background", "url(images/icons/error.png)");
            $('#idConfirmacion').prop("title", "Las contraseñas no coinciden");
            $('#idConfirmacion2').css("background", "url(images/icons/error.png)");
            $('#idConfirmacion2').prop("title", "Las contraseñas no coinciden");
        } else if (opcion == 4) {
            $('#idConfirmacion').css("background", "");
            $('#idConfirmacion').prop("title", "");
            $('#idConfirmacion2').css("background", "");
            $('#idConfirmacion2').prop("title", "");
        }
    }
});

var validar = (function() {


    return {
        registrarse: function(user, email, password, event) {
            var passwd = $('#idPassword').val();
            var passwd2 = $('#idPassword2').val();
            if (passwd == "" || passwd2 == "" || user == "" || email == "") {
                alert("Todos los campos son obligatorios!");
                return;
            } else if (passwd != passwd2) {
                alert("Las contraseñas no coinciden!");
                return;
            }
            console.log("Intenta registrar");
            app.registrarse(user, email, password, event);
        },
        login: function(email, password, event){
            if (email == "" || password == "") {
                alert("Todos los campos son obligatorios!");
                return;
            }
            app.login(email, password, event);
        }
        
    }
})();