var drawer = (function(){
	var idModelo = null;
	var stompClient = null;
	var ovalos = [];
	var ovalosShape = [];
	var usuario = [];
	var usuarioShape = [];
	var selectTedComponent = null;
	var flagCrearActor = false;
	var flagCrearCaso = false;
	var url = "https://class-modeler.herokuapp.com";
	//var url = "http://localhost:4444";

	var cambiarBotones = function() {
		if (flagCrearActor) {
			$("#idCrearActor").text("Cancelar");
			$("#nactor").css("display", "inline-block");

			$("#idCrearCaso").css("display", "none");
		} else {
			$("#idCrearActor").text("Crear Actor");
			$("#nactor").css("display", "none");
			
			$("#idCrearCaso").css("display", "inline-block");
		}

		if (flagCrearCaso) {
			$("#idCrearCaso").text("Cancelar");
			$("#novalo").css("display", "inline-block");

			$("#idCrearActor").css("display", "none");
		} else {
			$("#idCrearCaso").text("Crear Caso");
			$("#novalo").css("display", "none");
			
			$("#idCrearActor").css("display", "inline-block");
		}
	}


	var orderByType = function(data){
		console.log("Organiza");
		var li = [];
		["Ovalo","Actor"].forEach(function(tipo){
			for(var i=0;i<data.length;i++){
				if(data[i]["@type"]==tipo){
					li.push(data[i]);
				}
			}
		});
		console.log(li);
		return li;
	}
	var drawComponentes = function(err,data){
		if(err!=null){
			alert("Hubo un error");
			return;
		}
		if(stompClient==null){
			loadSocket(data.id);
		}
		//console.log("data");
		console.log(data);
		drawComponentesn(orderByType(data.componentes));
		//validateLocations();
	};
	var drawComponentesn = function(componentes){
		componentes.forEach(function(componente){
			if(componente["@type"]=="Ovalo"){
				drawOvalo(componente);
			}else{
				console.log("Entro actor");
				drawActor(componente);
			}
		});
	};
	var drawOvalo = function(ovalo){
		var shape = $("<div style='width:"+ovalo.ancho+"; height:"+ovalo.alto+"; background:#F0E68C; text-align:center' id='"+ovalos.length+"'>"+ovalo.nombre+"</div>");
		shape.css("background","#F0E68C");
		shape.css("position","relative");
		shape.css("border-color","black");
		shape.css("border-style","solid");
		shape.css("top",(ovalo.y-50*(ovalos.length))+"px");
		shape.css("left",(ovalo.x-11)+"px");
		shape.css("border-radius","50%");
		shape.draggable({containment:"parent",
    		drag:function(drev){
    				selectTedComponent = ovalo.id;
	    			var y = parseInt($(this).css("top").substring(0,$(this).css("top").length-2))+50*parseInt($(this).attr("id"));
	    			var x = parseInt($(this).css("left").substring(0,$(this).css("left").length-2))+11;
	    			ovalo.x = x;
	    			ovalo.y = y;
	    			ovalo.relaciones = [];
	    			ovalo["@type"]="Ovalo";
	    			stompClient.send('/app/updatecomponent.'+idModelo,{},JSON.stringify(ovalo));
    			}
    	});
		$("#dib").append(shape);
		ovalos.push(ovalo);
		ovalosShape.push(shape);
		
	};
	var drawActor = function(actor){
		var shape = $("<div style='width:"+actor.ancho+"; height:"+actor.alto+"; text-align:center' id='"+usuario.length+"'></div>");
		shape.css("background-image","url('cases/user.png')");
		shape.html("<img src='cases/user.png' style='width:100%; height:80%;'><div style='text-align:center;'>"+actor.nombre+"</div>")
		shape.css("position","relative");
		shape.css("top",(actor.y-50*(ovalos.length)-200*usuario.length)+"px");
		shape.css("left",(actor.x-11)+"px");
		shape.draggable({containment:"parent",
    		drag:function(drev){
    				selectTedComponent = actor.id;
	    			var y = parseInt($(this).css("top").substring(0,$(this).css("top").length-2))+50*ovalos.length+200*parseInt($(this).attr("id"));
	    			var x = parseInt($(this).css("left").substring(0,$(this).css("left").length-2))+11;
	    			actor.x = x;
	    			actor.y = y;
	    			actor.relaciones = [];
	    			actor["@type"]="Actor";
	    			stompClient.send('/app/updatecomponent.'+idModelo,{},JSON.stringify(actor));
    			}
    	});
		$("#dib").append(shape);
		usuario.push(actor);
		usuarioShape.push(shape);
	};
	var removeGraphicsComponents = function(){
		for(var i=0;i<ovalosShape.length;i++){
			ovalosShape[i].remove();
		}
		for(var i=0;i<usuarioShape.length;i++){
			usuarioShape[i].remove();
		}
		ovalosShape = [];
		usuarioShape = [];
	};
	var updateShape=function(cm){
		for(var i=0;i<ovalos.length;i++){
			if(cm.id == ovalos[i].id){
				ovalos[i] = cm;
			}
		}
		for(var i=0;i<usuario.length;i++){
			if(cm.id == usuario[i].id){
				usuario[i] = cm;
			}
		}
	}
	var loadSocket = function(id){
		idModelo = id;
		var socket = new SockJS(url+'/modeler');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/shape/newcomponent.'+idModelo, function (eventbody) {
            	var c =JSON.parse(eventbody.body);
            	if(c["@type"]=="Ovalo"){
            		ovalos.push(c);
            	}else{
            		usuario.push(c);
            	}
            	removeGraphicsComponents();
            	var dat = joinArrays(ovalos,usuario)
            	ovalos = [];
            	usuario = []; 
            	
            	drawComponentes(null,{componentes:dat});
            });
            stompClient.subscribe('/shape/updatecomponent.'+idModelo, function (eventbody) {
            	var comp = JSON.parse(eventbody.body);
            	if(comp.id == selectTedComponent){
            		return;
            	}
            	updateShape(JSON.parse(eventbody.body));
            	var dat = joinArrays(ovalos,usuario);
            	ovalos = [];
            	usuario = []; 
            	removeGraphicsComponents();
            	drawComponentes(null,{componentes:dat});
            });
        });
	}
	var joinArrays=function(arr1,arr2){
		arr2.forEach(function(dat){
			arr1.push(dat);
		});
		return arr1;
	}

	var validarYDibujar = function(event) {
		if (!flagCrearActor && !flagCrearCaso) return;
		console.log(event);
		event.stopPropagation();
		var text = null;
		var type=null;
		var ancho = 0;
		var alto = 0;
		if (flagCrearActor) {
			text = $("#nactor").val();
			if(text == null || text == ""){
				alert("Debes dar nombre al actor para crearlo");
				return;
			}
			type="Actor";
			ancho = 50;
			alto = 200;
		} else if (flagCrearCaso) {
			text = $("#novalo").val();
			if(text == null || text == ""){
				alert("Debes escribir la historia del caso de uso para poder crearlo");
				return;
			}
			type="Ovalo";
			ancho = 300;
			alto = 50;
		}
		console.log(text);
		var x = (event.pageX-275+11);
		var y = event.pageY;
		var com = {"@type":type,"nombre":text,"x":x,"y":y,"ancho":ancho,"alto":alto};		
		console.log("\n --------------------------------------JSON QUE GENERA ------------------------------------- \n");
		console.log(com);
		console.log("\n --------------------------------------JSON QUE GENERA ------------------------------------- \n");
		return com;	
	}
	return{
		draw:function(event){			
			var com = validarYDibujar(event);
			if (com == null || com == "") return;			
			stompClient.send("/app/newcomponent."+idModelo,{},JSON.stringify(com));
			$("#novalo").val("");
			$("#nactor").val("");
			flagCrearActor = false;
			flagCrearCaso = false;
	    	cambiarBotones();			
		},
		getComponents:function(){
			var url = new URL(document.URL);
        	var params = url.searchParams;
        	apiclient.getComponentes(params.get("usuario"),params.get("proyecto"),params.get("version"),params.get("modelo"),sessionStorage.getItem("token"),drawComponentes);
		}, crearActor: function() {
			flagCrearActor = !flagCrearActor;
			cambiarBotones();
		}, crearCaso: function() {
			flagCrearCaso = !flagCrearCaso;
			cambiarBotones();
		}
	}
})();