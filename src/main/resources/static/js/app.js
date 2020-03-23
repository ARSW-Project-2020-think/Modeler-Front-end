var app = (function () {
    var createSession = function(email,password,token){
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("password", password);
        sessionStorage.setItem("token",token);
        console.log("creo session");
        apiclient.userData(token,saveUsername);
    };
    var setToken = function(email,password,token){
    	sessionStorage.setItem("token",token);
    	console.log("actualizo token: "+token);
    };
    var saveUsername= function(err,user){
    	if(err!=null){
    		return;
    	}
    	sessionStorage.setItem("username",user.username);
    	location.href = "index.html";
    };
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
        }else{
        	var cont = $("<div class='container'></div>");
        	var contador =1;
        	var row = null;
        	data.forEach(function(proyecto){
        		if(contador==1){
        			row = $("<div class='row'></div>");
        		}
        		console.log(contador);
        		var div = $("<div class='col'></div>");
        		div.append("<div class='card text-white bg-dark mb-3' style='width: 18rem;'>"+
        					"<div class='card-body'>"+
        					"<h5 class='card-title'>"+proyecto.nombre+"</h5>"+
        					"<p class='card-text' style='color:white;'>Publico: "+proyecto.publico+"</p>"+
        					"<a href='version.html' class='btn btn-primary'>Ver</a>"+
    			"</div>"+
  				"</div>");
        		row.append(div);
        		
        		if(contador==3){
        			contador=0;
        			cont.append(row);
        		}
        		contador+=1;
        	});
        	var ent = (contador!=1);
        	while(contador!=1 && contador!=4){
        		row.append("<div class='col'></div>");
        		console.log(contador);
        		contador+=1;
        	}
        	if(ent){
        		cont.append(row);
        	}
        	$("#cont").append(cont);
        	
        }
    };
    var redirProyecto = function(err){
    	if(err!=null){
    		alert("No se pudo registrar");
    	}else{
    		location.href = "modelo.html";
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
        },registrarProyecto(nombre){
        	var publico = $("input[id='publico']:checked").val();
        	console.log(nombre,publico);
        	if(publico=="on"){
        		apiclient.registrarPryecto(sessionStorage.getItem("token"),sessionStorage.getItem("username"),nombre,true,redirProyecto);
        	}else{
        		apiclient.registrarPryecto(sessionStorage.getItem("token"),sessionStorage.getItem("username"),nombre,false,redirProyecto);
        	}
        },draw:function(event){
        	console.log(event);
        	event.stopPropagation();
        	var canv = $("#dib");
        	var clase = $("<div style='width:200px; height:50px; background:black; margin:0px; padding:0px;'></div>");
        	clase.css("position","absolute");
        	clase.css("left",(event.pageX)+"px");
        	clase.css("top",event.pageY+"px");
        	console.log("X: "+event.pageX);
        	console.log("Y: "+event.pageY);
        	clase.draggable({containment:"parent",
        		drag:function(drev){
        			//Send to Socket
        			var y = $(this).css("top");
        			var x = $(this).css("left");
        			console.log("X: "+x);
        			console.log("Y: "+y);
        			}
        	});
        	clase.click(function(ev){
        		ev.stopPropagation();
        	});
        	console.log(event.pageX);
        	console.log(event.pageY);
        	canv.append(clase);
        }
    }





})();