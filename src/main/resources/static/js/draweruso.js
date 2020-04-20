var drawer = (function(){
	var idModelo = null;
	var stompClient = null;
	var ovalos = [];
	var ovalosShape = [];
	var usuario = [];
	var usuarioShape = [];
	var lineShape = [];
	var origin = null;
	var flagRelacion = false;
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
			$("#idDivCrearRelacion").css("display", "none");
		} else {
			$("#idCrearActor").text("Crear Actor");
			$("#nactor").css("display", "none");
			
			$("#idCrearCaso").css("display", "inline-block");
			$("#idDivCrearRelacion").css("display", "inline-block");
		}

		if (flagCrearCaso) {
			$("#idCrearCaso").text("Cancelar");
			$("#novalo").css("display", "inline-block");

			$("#idCrearActor").css("display", "none");
			$("#idDivCrearRelacion").css("display", "none");
		} else {
			$("#idCrearCaso").text("Crear Caso");
			$("#novalo").css("display", "none");
			$("#idCrearActor").css("display", "inline-block");
			$("#idDivCrearRelacion").css("display", "inline-block");
		}
		
		if (flagRelacion) {
			$("#idCrearRelacion").text("Cancelar");
			$("#novalo").css("display", "none");
			$("#idDivCrearCaso").css("display","none");
			$("#idCrearActor").css("display", "none");
			//$("#idDivCrearRelacion").css("display", "none");
		} else {
			$("#idCrearRelacion").text("Crear Relacion");
			//$("#novalo").css("display", "none");
			$("#idCrearActor").css("display", "inline-block");
			$("#idDivCrearRelacion").css("display", "inline-block");
			$("#idDivCrearCaso").css("display","inline-block");
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
		console.log("Validando localizacion");
		validateLocationsOvalos();
		validateLocationsActor();
		console.log("Validando lineas");
		linesComponentes();
	};
	validateLocationsOvalos = function(){
		for(var i=0;i<ovalosShape.length;i++){
			var y = ovalos[i].y-50*i;
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
		for(var i=0;i<usuarioShape.length;i++){
			var y = usuario[i].y-50*ovalosShape.length-200*i;
			var x = usuario[i].x-11;
			if(y+"px"!=usuarioShape[i].css("top")){
				usuarioShape[i].css("top",y+"px");
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
		//shape.css("top",(ovalo.y-50*(ovalos.length))+"px");
		//shape.css("left",(ovalo.x-11)+"px");
		shape.css("border-radius","50%");
		shape.click(function(ev){
			ev.stopPropagation();
			ovalo["@type"]="Ovalo";
			if(flagRelacion && origin==null){
				origin = ovalo;
			}else if(flagRelacion){
				var li = [origin,ovalo];
				stompClient.send('/app/newrelation.'+idModelo,{},JSON.stringify(li));
				flagRelacion=false;
				cambiarBotones();
			}
		});
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
			console.log("1");
		}else if(ovalosShape.length>0){
			ovalosShape[ovalosShape.length-1].after(shape);
			console.log("2");
		}else{
			usuarioShape[0].before(shape);
			console.log("3");
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
		shape.click(function(ev){
			ev.stopPropagation();
			actor["@type"]="Actor";
			if(flagRelacion && origin==null){
				origin = actor;
			}else if(flagRelacion){
				var li = [origin,actor];
				stompClient.send('/app/newrelation.'+idModelo,{},JSON.stringify(li));
				flagRelacion=false;
				cambiarBotones();
			}
		});
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
	};
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
	};
	
	
	var createLineElement =function(x, y, length, angle) {
	    var line = $("<div></div>");
	    line.css("border","1px solid blue");
	    line.css("width",length + 'px');
	    line.css("height",'0px');
	    line.css("position",'relative');
	    line.css("transform","rotate(" + angle + "rad)");
	    console.log("Linea #:" +lineas);
	    line.css("top",y+(-50*ovalos.length-200*usuario.length-2*lineas)+"px");
	    line.css("left",(x-11)+"px");
	    line.attr("class","linea");
	    return line;
	};
	
	var getComponenteById=function(id){
		for(var i=0;i<usuario.length;i++){
			if(usuario[i].id == id){
				return usuario[i];
			}
		}
		for(var i=0;i<ovalos.length;i++){
			if(ovalos[i].id == id){
				return ovalos[i];
			}
		}
		
	};

	var createLine =function(x1, y1, x2, y2) {
	    var a = x1 - x2,
	        b = y1 - y2,
	        c = Math.sqrt(a * a + b * b);

	    var sx = (x1 + x2) / 2,
	        sy = (y1 + y2) / 2;

	    var x = sx - c / 2,
	        y = sy;

	    var alpha = Math.PI - Math.atan2(-b, a);
	    return createLineElement(x, y, c, alpha);
	};
	
	var linesComponentes=function(){
		ovalos.forEach(function(ovalo){
			var x1 = ovalo.x+(ovalo.ancho/2);
			var y1	 = ovalo.y+(ovalo.alto/2);
			ovalo.relaciones.forEach(function(rel){
				var rel2 = getComponente(rel);
				rel = rel2;
				var x2 = rel.x+(rel.ancho/2);
				var y2 = rel.y+(rel.alto/2);
				var ln =createLine(x1,y1,x2,y2);
				lineShape.push(ln);
				$("#dib").append(ln);
			});
		});
		usuario.forEach(function(user){
			var x1 = user.x+(user.ancho/2);
			var y1	 = user.y+(user.alto/2);
			user.relaciones.forEach(function(rel){
				var rel2 = getComponente(rel);
				rel = rel2;
				var x2 = rel.x+(rel.ancho/2);
				var y2 = rel.y+(rel.alto/2);
				var ln =createLine(x1,y1,x2,y2);
				lineShape.push(ln);
				$("#dib").append(ln);
			});
		});
	};
	
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
		},setRelacion:function(){
			if(flagRelacion){
				origin = null;
			}
			flagRelacion= !flagRelacion;
			cambiarBotones();
		}
	}
})();