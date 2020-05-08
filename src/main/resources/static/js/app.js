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
    	location.href = "proyectos.html";
    };
    var updateView = function(error,user){
        if(error!=null) return;
        $("#uservar").text("Usuario: "+user.username);
        $("#email").text("Correo: "+user.correo);
	};
	
	var mostrarColaboradores = function(error, data) {
		data.push({username: sessionStorage.getItem("username")});
		if(error!=null){
            console.log(error);
            return ;
		}
		console.log("Load colaboradores")
		console.log("col"+ data);
		$("#idColaboradores").html("");
		var tab = $("<table class='table table-borderless'></table>");
		tab.append($("<thead>" +
					"<tr>" + 
					"<th scope='col'> Nombre</th><th>Eliminar</th>" +
					"</tr>" +
					"</thead>"));
		var tb = $("<tbody id = 'idTBody'></tbody>");
		tab.append(tb);
		var url = new URL(document.URL);
		var params = url.searchParams;
		var project = params.get("proyecto");
		console.log("pr "+project);
		data.forEach(function(colaborador){
			var row = $("<tr id='u-"+colaborador.username+"'></tr>");
			row.append($("<td>" + colaborador.username + "</td>"));
			var col = $("<td></td>");
			var button = $("<button class='btn btn-danger'>Eliminar Colaborador</button>");
			if(colaborador.username!=sessionStorage.getItem("username")){
				col.append(button);
				button.click(function(){
					console.log("Click "+project);
					apiclient.eliminarColaborador(sessionStorage.getItem("username"),project,sessionStorage.getItem("token"),colaborador,deleteColaborador);
				});
			}
			row.append(col);
			tab.append(row);
		}); 
		$("#idColaboradores").append(tab);
	}
	var deleteColaborador = function(error,user){
		if(error!=null){
			alert("No se pudo eliminar este colaborador");
			return;
		}
		$("#u-"+user.username).remove();
	}
    var updateProjects = function(error,data){
        if(error!=null){
            console.log(error);
            return ;
        } 
        console.log(data);
        if(data.length==0){
        	$("#cont").html("<h1>Actualmente No hay proyectos que mostrar</h1>");
        }else{
        	var cont = $("<div class='container'></div>");
        	$("#cont").append(cont);
        	var contador =1;
        	var row = null;
        	data.forEach(function(proyecto){
        		if(contador==1){
        			row = $("<div class='row'></div>");
        		}
        		console.log(contador);
        		var div = $("<div class='col'></div>");
        		var str = "<div class='card text-white bg-dark mb-3' style='width: 18rem;'>"+
        					"<div class='card-body'>"+
        					"<h5 class='card-title'>"+proyecto.nombre+"</h5>";
        					if(proyecto.publico){
        						str+="<p class='card-text' style='color:white;'>Publico</p>";
        					}else{
        						str+="<p class='card-text' style='color:white;'>Privado</p>";
        					}
        					if(proyecto.autor.username!=sessionStorage.getItem("username")){
        						str+="<p class='card-text' style='color:white;'>Autor: "+proyecto.autor.username+"</p>";
        					}
        					str+="<a href='version.html?usuario="+proyecto.autor.username+"&&version="+1+"&&proyecto="+proyecto.nombre+"' class='btn btn-primary'>Ver</a>";
        					if(proyecto.autor.username==sessionStorage.getItem("username")){
        						str+="<a href='compartir.html?proyecto="+proyecto.nombre+"' class='btn btn-primary'>Compartir</a>";
        						str+="<button class='btn btn-danger' id='pr-"+proyecto.id+"'>Borrar</button>";
        					}
    			str+="</div>"+
  				"</div>"
    			div.append($(str));
        		row.append(div);
        		if(contador==3){
        			contador=0;
        			cont.append(row);
        		}
        		contador+=1;
        	});
        	var ent = (contador!=1);
        	while(contador!=1 && contador!=4){
        		console.log("row added");
        		row.append("<div class='col'></div>");
        		console.log(contador);
        		contador+=1;
        	}
        	if(ent){
        		console.log("entro");
        		cont.append(row);
        	}
        	
        }
        data.forEach(function(proyecto){
        	$("#pr-"+proyecto.id).click(function(){
        		$('#mymodal').modal("show");
        		$("#mscont").text("Desea eliminar el proyecto "+proyecto.nombre);
        		$("#confButton").click(function(){
        			var user = sessionStorage.getItem("username");
        			app.deleteProyecto(user,proyecto);
        		});
    		});
        });
        
    };
    var redirProyecto = function(err,nombre){
    	if(err!=null){
    		alert("No se pudo registrar");
    	}else{
    		location.href = "version.html?version=1&&usuario="+sessionStorage.getItem("username")+"&&proyecto="+nombre;
    	}
    };
    var showModels = function(error,data){
    	if(error!=null){
    		return;
    	}
    	if(data.length==0){
    		$("#models").html("<h1>No tienes diagramas crea uno nuevo para iniciar.</h1>");
    		return;
    	}
    	console.log(data);
    	var cont = $("<div class='container'></div>");
    	var contador =1;
    	var row = null;
    	data.forEach(function(modelo){
    		if(contador==1){
    			row = $("<div class='row'></div>");
    		}
    		var url = new URL(document.URL);
    		var param = url.searchParams;
    		console.log(contador);
    		var div = $("<div class='col'></div>");
    		var mod = "<div class='card text-white bg-dark mb-3' style='width: 18rem;'>"+
    					"<div class='card-body'>"+
    					"<h5 class='card-title'>"+modelo.nombre+"</h5>"+
    					"<p class='card-text' style='color:white;'>Tipo de diagrama: "+modelo.tipo+"</p>";
    					if(modelo.tipo=="clases"){
							mod+="<a href='modelo.html?usuario="+param.get("usuario")+"&&version="+param.get("version")+"&&proyecto="+param.get("proyecto")+"&&modelo="+modelo.nombre+"' class='btn btn-primary'>Ver</a>";							
    					}else{
    						mod+="<a href='uso.html?usuario="+param.get("usuario")+"&&version="+param.get("version")+"&&proyecto="+param.get("proyecto")+"&&modelo="+modelo.nombre+"' class='btn btn-primary'>Ver</a>";
						}
						mod+="<button class='btn btn-danger' id ='idModelo-"+modelo.id+"'> Borrar </button>";	
								
			mod+="</div>"+
				"</div>";
    		div.append($(mod));
    		row.append(div);
    		
    		if(contador==3){
    			contador=0;
    			cont.append(row);
    		}
    		contador+=1;
    		console.log("foreach");
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
    	console.log("añade");
		$("#models").append(cont);

		data.forEach(function(modelo){
        	$("#idModelo-"+modelo.id).click(function(){
				$('#mymodal').modal("show");
				$("#mscont").text("¿Está seguro que desea eliminar el diagrama "+modelo.nombre + "?");
				$("#confButton").click(function(){
					var user = sessionStorage.getItem("username");
					app.deleteModelo(user, modelo);
				});
			});
        });
    };
    var redirectModel = function(error,usuario,proyecto,version,nombre,tipo){
    	if(error!=null){
    		alert("No se pudo registrar");
    		return ;
    	}
    	if(tipo!="uso"){
    		location.href = "modelo.html?usuario="+usuario+"&&proyecto="+proyecto+"&&version="+version+"&&modelo="+nombre;
    	}else{
    		location.href = "uso.html?usuario="+usuario+"&&proyecto="+proyecto+"&&version="+version+"&&modelo="+nombre;
    	}
    };
    var colaborator=function(err, colaborador){
    	if(err!=null){
    		alert("No fue posible añadir dicho colaborador");
    		return ;
		}
    	location.href = document.URL;
    };
    updateDisponibilidad = function(err,data){
    	var c = $("#disponibilidad");
    	if(data){
    		c.html("<span>Estado: </span><span style='color:green;'>Disponible</span>");
    	}else{
    		c.html("<span>Estado: </span><span style='Color: red;'>Ocupado</span>");
    	}
    };
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
                location.href = "proyectos.html";
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
        },redirectValidation:function(){
        	if(sessionStorage.getItem("email")==null){
                location.href = "login.html";
                return ;
            }
        	apiclient.userData(sessionStorage.getItem("token"),updateView);
        },loadModel:function(usuario,proyecto,version){
        	apiclient.getModels(usuario,proyecto,version,sessionStorage.getItem("token"),showModels);
        }
        ,registrarProyecto(nombre){
        	var publico = $("input[id='publico']:checked").val();
        	console.log(nombre,publico);
        	if(nombre==null || nombre==""){
        		alert("El nombre del proyecto no puede ser vacio!");
        		return;
        	}
        	if(publico=="on"){
        		apiclient.registrarPryecto(sessionStorage.getItem("token"),sessionStorage.getItem("username"),nombre,true,redirProyecto);
        	}else{
        		apiclient.registrarPryecto(sessionStorage.getItem("token"),sessionStorage.getItem("username"),nombre,false,redirProyecto);
        	}
        }, registrarModelo:function(usuario,proyecto,version,nombre,tipo){
			if(nombre==null || nombre==""){
        		alert("El nombre del diagrama no puede ser vacio!");
        		return;
        	}
        	apiclient.registrarModelo(usuario,proyecto,version,nombre,tipo,sessionStorage.getItem("token"),redirectModel);
        }, addColaborador:function(username,colaborador,proyecto){
			apiclient.addColaborador(username,colaborador,proyecto,sessionStorage.getItem("token"),colaborator);
        }, loadProyectosCompartidos:function(username){
        	apiclient.loadProyectosCompartidos(username,sessionStorage.getItem("token"),updateProjects);
        }, loadColaboradores: function(username, proyecto) {
			apiclient.loadColaboradores(username, proyecto, sessionStorage.getItem("token"), mostrarColaboradores);
		}, validarDisponibilidad:function(username){
			apiclient.validarDisponibilidad(username,updateDisponibilidad);
		}, deleteProyecto:function(usuario,proyecto){
		   	var fun = function(err){
				if(err!=null){
					alert("No se pudo eliminar el proyecto.");
					return;
				}
				location.href= "proyectos.html";
				
			}
			apiclient.deleteProyecto(usuario,proyecto,sessionStorage.getItem("token"), fun);
		}, deleteModelo: function(usuario, modelo) {
			var verify = function(error) {
				if (error != null) {
					alert("No se pudo eliminar el modelo.");
					return;
				}
				location.href= document.URL;
			}
			var url = new URL(document.URL);
			var params = url.searchParams;
			var project = params.get("proyecto");
			var version = params.get("version");
			apiclient.deleteModelo(usuario, modelo, project, version, sessionStorage.getItem("token"), verify);
		}, volver: function() {
			var url = new URL(document.URL);
			var params = url.searchParams;
			var proyecto = params.get("proyecto");
			var version = params.get("version");
			var username = params.get("usuario");

			var urlHref ="version.html?usuario="+username+"&&version="+version+"&&proyecto="+proyecto;
			location.href = urlHref;
		}
        
    }

})();