var draw = (function(){
	var clases = [];
	var cont = [];
	var lines = [];
	var graphicslines = [];
	var stompClient = null;
	var idModelo = null;
	var selected = null;
	var origin = null;
	var originDeleteRelation = null;
	var toaddline = false;
	var canv = $("#dib");
	var url = "https://class-modeler.herokuapp.com";
	var lineas = 0;
	var flagDeleteRelation = false;
	var flagCrearClase = false;
	var cambiarBotones = function() {
		if (toaddline) {
			$("#idLinea").text("Cancelar");

			$("#idDivCrearClase").css("display", "none");
			$("#idDivBorrar").css("display", "none");
								
		} else {
			$("#idLinea").text("Nueva Relación");

			$("#idDivCrearClase").css("display", "inline-block");
			$("#idDivBorrar").css("display", "inline-block");
		}

		if (flagDeleteRelation) {
			$("#idBorrar").text("Cancelar"); 

			$("#idDivLinea").css("display", "none");
			$("#idCrearClase").css("display", "none");
		} else {
			$("#idBorrar").text("Borrar Relación");

			$("#idCrearClase").css("display", "inline-block");
			$("#idDivLinea").css("display", "inline-block");
		}

		if (flagCrearClase) {
			$("#idCrearClase").text("Cancelar");
			$("#idClase").css("display", "inline-block");

			$("#idLinea").css("display", "none");
			$("#idBorrar").css("display", "none");
		} else {
			$("#idCrearClase").text("Crear Clase");
			$("#idClase").css("display", "none");

			$("#idLinea").css("display", "inline-block");
			$("#idBorrar").css("display", "inline-block");
		}

	}

	var drawClases = function(err,data){
		if(err!=null){
			console.log("No se han podido cargar las clases, revise su conexion o contactese con el administrador");
			return;
		}
		console.log(data);
		var canv = $("#dib");
		console.log(data.id);
		if(stompClient==null){
			loadSocket(data.id);
		}
		data.rectangulos.forEach(function(rectangulo){
			var clase = $("<div style='z-index:9000; width:"+rectangulo.ancho+"px; height:"+rectangulo.alto+"px; background:black; margin:0px; color:white; text-align:center; padding:0px;' id='"+clases.length+"'></div>");
			clase.css("position","relative");
			clase.text(rectangulo.nombre);
			clase.css("left",(rectangulo.x-11)+"px");
	    	clase.css("top",rectangulo.y-(50*clases.length)+"px");
	    	clase.click(function(ev){
	    		ev.stopPropagation();
	    		if(toaddline && origin==null){
	    			origin = getClaseByName($(this).text()).id;
	    		}else if(toaddline){
	    			var id2 = getClaseByName($(this).text()).id;
	    			console.log("Points: "+origin+" "+id2);
	    			createLineIntoClases(origin,id2);
	    			origin = null;
	    			toaddline = false;
	    			cambiarBotones();
				}
				if(flagDeleteRelation && originDeleteRelation==null){
					originDeleteRelation = getClaseByName($(this).text()).id;
	    		}else if(flagDeleteRelation){
					var id2 = getClaseByName($(this).text()).id;
	    			deleteRelationIntoClases(originDeleteRelation, id2);
	    			originDeleteRelation = null;
	    			flagDeleteRelation = false;
	    			cambiarBotones();
				}					
	    	});
	    	clase.draggable({containment:"parent",
	    		drag:function(drev){
	    				if(selected==null){
	    					selected = rectangulo;
	    				}
		    			var y = parseInt($(this).css("top").substring(0,$(this).css("top").length-2))+50*parseInt($(this).attr("id"));
		    			var x = parseInt($(this).css("left").substring(0,$(this).css("left").length-2))+11;
		    			rectangulo.x = x;
		    			rectangulo.y = y;
		    			rectangulo.relaciones = [];
		    			stompClient.send('/app/updaterectangle.'+idModelo,{},JSON.stringify(rectangulo));
	    			}
	    	});
	    	clase.mouseup(function() {
	    		  if(selected!= null && selected.id==rectangulo.id){
	    			  selected = null;
	    		  }
	    		});
	    	clases.push(rectangulo);
	    	if(cont.length==0){
	    		canv.append(clase);
	    	}else{
	    		cont[cont.length-1].after(clase);
	    	}
	    	cont.push(clase);
		});
		dibujarRelaciones();
	};
	
	var getClaseByName=function(name){
		for(var i=0;i<clases.length;i++){
			if(clases[i].nombre==name){
				return clases[i];
			}
		}
		return null;
	};

	var deleteLines = function() {
		for (var i = 0; i < lines.length; i++) {
			lines[i].remove();
		}
		lines = [];
		lineas = 0;
	}

	var dibujarRelaciones = function() {
		lineas = 0;
		deleteLines();
		for (var i = 0; i < clases.length; i++) {
			for (var j = 0; j < clases[i].relaciones.length; j++) {
				pintarRelacionEntreClases(clases[i], clases[i].relaciones[j]);
				lineas += 1;
			}
		}
	};

	var createLineIntoClases = function(id1,id2){
		lineas+=1;
		var r1 = getRectangleById(id1);
		var r2 = getRectangleById(id2);
		console.log(r1);
		console.log(r2);
		//var l = {"x1":parseInt(r1.x+(r1.ancho/2)),"y1":parseInt(r1.y+(r1.alto/2)),"x2":parseInt(r2.x+(r2.ancho/2)),"y2":parseInt(r2.y+(r2.alto/2)),"nombre1":$("#attr1").val(),"nombre2":$("#attr2").val()};
		stompClient.send('/app/newrelation.'+idModelo,{},JSON.stringify([{"id":r1.id},{"id":r2.id}]));		
		toaddline = !toaddline;
		cambiarBotones();
	}

	var deleteRelationIntoClases = function(id1, id2) {
		lineas -= 1;
		var r1 = getRectangleById(id1);
		var r2 = getRectangleById(id2);
		console.log(r1);
		console.log(r2);
		stompClient.send('/app/deleteRelation.'+idModelo,{},JSON.stringify([{"id": r1.id}, {"id": r2.id}]));		
		flagDeleteRelation = !flagDeleteRelation;
		cambiarBotones();
	}

	var pintarRelacionEntreClases = function (r1, r2) {
		console.log("------ Pintar relacion ---------");
		var r3 = getRectangleById(r1.id);
		var r4 = getRectangleById(r2.id);
		r1 = r3;
		r2 = r4;
		console.log("------ Creando linea ---------");
		console.log(r1);
		console.log(r2);
		console.log("------ linea creada ---------");
		canv = $("#dib");
		var line = createLine(r1.x+(r1.ancho/2), r1.y+(r1.alto/2), r2.x+(r2.ancho/2), r2.y+(r2.alto/2));		
		line.attr("id","line"+ r1.id + "-" + r2.id);
		canv.append(line);
		lines.push(line);
	}

	var getRectangleById= function(id){
		for(var i=0;i<clases.length;i++){
			console.log("Clase "+i);
			if(clases[i].id==id){
				console.log("encontro "+id);
				return clases[i];
			}
		}
		return null;
	}
	var createLineElement =function(x, y, length, angle) {
	    var line = $("<div></div>");
	    line.css("border","1px solid blue");
	    line.css("width",length + 'px');
	    line.css("height",'0px');
	    line.css("position",'relative');
	    line.css("transform","rotate(" + angle + "rad)");
	    console.log("Linea #:" +lineas);
	    line.css("top",y+(-50*clases.length-2*lineas)+"px");
	    line.css("left",(x-11)+"px");
	    line.attr("class","linea");
	    return line;
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
	var loadSocket = function(id){
		idModelo = id;
		console.log(idModelo);
		var socket = new SockJS(url+'/modeler');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/shape/newrectangle.'+idModelo, function (eventbody) {
            	//alert("recibio algo");
            	//console.log(JSON.parse(eventbody.body));
            	drawClases(null,{rectangulos:[JSON.parse(eventbody.body)]});
            });
            stompClient.subscribe('/shape/updaterectangle.'+idModelo, function (eventbody) {
            	var rect = JSON.parse(eventbody.body);
				updateRectangle(rect);
            });
            stompClient.subscribe('/shape/newrelation.'+idModelo, function (eventbody) {
            	var r1 = JSON.parse(eventbody.body)[0];
				var r2 = JSON.parse(eventbody.body)[1];
				updateCollectionRectangle(r1);
				updateCollectionRectangle(r2);
				pintarRelacionEntreClases(r1, r2);
			});
			
			stompClient.subscribe('/shape/deleteRelation.'+idModelo, function (eventbody) {
            	var r1 = JSON.parse(eventbody.body)[0];
				var r2 = JSON.parse(eventbody.body)[1];
				console.log(r1);
				updateCollectionRectangle(r1);
				updateCollectionRectangle(r2);
				dibujarRelaciones();
            });
        });
	};
	
	var updateCollectionRectangle = function(rect){
		for(var i=0;i<clases.length;i++){
			if(clases[i].id==rect.id){
				clases[i] = rect;
			}
		}
	};
	var updateRectangle = function(rect){
    	for(var i=0;i<cont.length;i++){
    		if(clases[i].id == rect.id){
    			clases[i] = rect;
    			if(selected!=null && selected.id==rect.id){
    				dibujarRelaciones();
            		return;
            	};
    			cont[i].css("left", (clases[i].x-11)+"px");
    			cont[i].css("top",(clases[i].y-(50*parseInt(cont[i].attr("id"))))+"px");
    			console.log("update location");
    			console.log(cont[i]);
    		}
		}
		dibujarRelaciones();
	};
	return {
		draw: function(event){
			if (!flagCrearClase) return;

        	console.log(event);
			event.stopPropagation();					
			var val = $("#idClase").val();
			if(val==null || val==""){
				alert("Debes dar nombre a una clase para crearla");
				return;
			}
        	var x = (event.pageX-275+11);
        	var y = event.pageY;
        	var rectangulo = {"x":x,"y":y,"ancho":200,"alto":50,"nombre":val};
        	var url = new URL(document.URL);
        	var params = url.searchParams;
        	console.log
        	stompClient.send("/app/newrectangle."+idModelo,{},JSON.stringify(rectangulo));
        	//apiclient.registrarRectangulo(params.get("usuario"),params.get("proyecto"),params.get("version"),params.get("modelo"),sessionStorage.getItem("token"),rectangulo,createRectangle);
			$("#idClase").val("");
			flagCrearClase = false;
	    	cambiarBotones();
        }, getRectangulos(){
        	var url = new URL(document.URL);
        	var params = url.searchParams;
        	apiclient.getRectangulos(params.get("usuario"),params.get("proyecto"),params.get("version"),params.get("modelo"),sessionStorage.getItem("token"),drawClases);
        }, setAddLine:function(){
			
        	if(toaddline){
        		origin=null;
			}
			
			toaddline = !toaddline;
			cambiarBotones();
        }, borrarRelacion: function(id) {
			if (flagDeleteRelation) {
				originDeleteRelation = null;
			}
			flagDeleteRelation = !flagDeleteRelation;
			cambiarBotones();
		}, crearClase: function() {
			flagCrearClase = !flagCrearClase;
			cambiarBotones();
		}
	};
})();