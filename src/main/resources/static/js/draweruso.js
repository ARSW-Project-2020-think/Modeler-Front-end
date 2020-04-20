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
		drawComponentesn(data.componentes);
		validateLocationsOvalos();
		validateLocationsActor();
	};
	validateLocationsOvalos = function(){
		for(var i=0;i<ovalos.length;i++){
			var y = ovalos[i].y-50*parseInt(ovalosShape[i].attr("id"));
			var x = ovalos[i].x-11;
			if(y+"px"!=ovalosShape[i].css("top")){
				ovalosShape[i].css("top",y+"px");
			}
			if(x+"px"!=ovalosShape[i].css("left")){
				ovalosShape[i].css("left",x+"px");
			}
		}
	};
	var validateLocationsActor = function(){
		for(var i=0;i<usuario.length;i++){
			var y = usuario[i].y-50*ovalos.length-200*parseInt(usuarioShape[i].attr("id"));
			var x = usuario[i].x-11;
			if(y+"px"!=usuarioShape[i].css("top")){
				console.log("update actor y");
				usuarioShape[i].css("top",y+"px");
				console.log("update actor x");
			}
			if(x+"px"!=usuarioShape[i].css("left")){
				
				usuarioShape[i].css("left",x+"px");
			}
		}
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
		if(ovalosShape.length==0 && usuarioShape.length==0){
			$("#dib").append(shape);
		}else if(ovalosShape.length>0){
			ovalosShape[ovalosShape.length-1].after(shape);
		}else{
			usuarioShape[usuarioShape.length-1].before(shape);
		}
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
            	drawComponentes(null,{componentes:[c]});
            });
            stompClient.subscribe('/shape/updatecomponent.'+idModelo, function (eventbody) {
            	var comp = JSON.parse(eventbody.body);
            	updateShape(JSON.parse(eventbody.body));
            	if(comp.id == selectTedComponent){
            		return;
            	}
            	validateLocationsOvalos();
            	validateLocationsActor();
            });
        });
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
		},crearRelacion:function(){
			
		}
	}
})();