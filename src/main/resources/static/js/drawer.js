var draw = (function(){
	var clases = [];
	var cont = [];
	var lines = [];
	var graphicslines = [];
	var stompClient = null;
	var idModelo = null;
	var selected = null;
	var claseEdicion = null;
	var origin = null;
	var originDeleteRelation = null;
	var toaddline = false;
	var canv = $("#dib");
	var url = "https://class-modeler.herokuapp.com";
	//var url = "http://localhost:4444";
	var lineas = 0;
	var flagDeleteRelation = false;
	var flagCrearClase = false;
	var flagBorrarClase = false;
	var flagEditarClase = false;
	var cambiarBotones = function() {
		if (toaddline) {
			$("#idLinea").text("Cancelar");
			$("#idDivCrearClase").css("display", "none");
			$("#idDivBorrar").css("display", "none");
			$("#idDivBorrarClase").css("display","none");
			$("#idDivEditar").css("display","none")
		} else if (flagDeleteRelation) {
			$("#idBorrar").text("Cancelar"); 
			$("#idDivLinea").css("display", "none");
			$("#idDivCrearClase").css("display", "none");
			$("#idDivBorrarClase").css("display","none");
			$("#idDivEditar").css("display","none")
		} else if (flagCrearClase) {
			$("#idCrearClase").text("Cancelar");
			$("#idClase").css("display", "inline-block");
			$("#idDivLinea").css("display", "none");
			$("#idDivBorrar").css("display", "none");
			$("#idDivBorrarClase").css("display","none");
			$("#idDivEditar").css("display","none")
		}else if(flagBorrarClase){
			$("#idBorrarClase").text("Cancelar");
			$("#idDivCrearClase").css("display","none");
			$("#idDivLinea").css("display","none");
			$("#idDivBorrar").css("display","none");
			$("#idDivEditar").css("display","none")
		}else if(flagEditarClase){
			$("#idEditar").text("Cancelar");
			$("#idDivCrearClase").css("display","none");
			$("#idDivLinea").css("display","none");
			$("#idDivBorrar").css("display","none");
			$("#idDivBorrarClase").css("display","none")
		} 
		else {
			$("#idClase").css("display", "inline-bock");
			$("#idDivLinea").css("display", "inline-block");
			$("#idDivBorrar").css("display", "inline-block");
			$("#idDivCrearClase").css("display","inline-block");
			$("#idDivBorrarClase").css("display", "inline-block");
			$("#idDivEditar").css("display","inline-block")
			$("#idClase").css("display", "none");
			$("#idCrearClase").text("Crear Clase");
			$("#idLinea").text("Nueva Relacion");
			$("#idBorrar").text("Borrar Relacion");
			$("#idBorrarClase").text("Borrar Clase");
			$("#idEditar").text("Editar Clase");
			
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
		data.componentes.forEach(function(rectangulo){
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
				if(flagBorrarClase){
					stompClient.send('/app/deleteComponent.'+idModelo,{},JSON.stringify(rectangulo));
					flagBorrarClase = false;
					cambiarBotones();
				}
				if(flagEditarClase){
					claseEdicion = rectangulo;
					showClaseData();
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
		    			rectangulo["@type"]="Rectangulo";
		    			stompClient.send('/app/updatecomponent.'+idModelo,{},JSON.stringify(rectangulo));
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
	var showClaseData = function(){
		var rectangulo = getClaseByName(claseEdicion.nombre);
		$("#claseModal").modal("show");
		$("#classNameModal").text(rectangulo.nombre);
		showAtributes(rectangulo);
		showMetodos(rectangulo);
		$("#natributoIn").click(function(){
			var q = $("#natributo").val();
			stompClient.send('/app/newAtribute.'+idModelo,{},JSON.stringify({"@type":"Rectangulo","id":rectangulo.id,atributos:[{"atributo":q}]}));
		});
		$("#nmetodoIn").click(function(){
			var q = $("#nmetodo").val();
			stompClient.send('/app/newMethod.'+idModelo,{},JSON.stringify({"@type":"Rectangulo","id":rectangulo.id,metodos:[{"metodo":q}]}));
		});
		$("#closeClase").click(function(){
			claseEdicion=null;
		});
		$("#bclose").click(function(){
			console.log("entro");
			claseEdicion=null;
		});
		$("#dragmodal").draggable();
	};
	var showMetodos = function(rectangulo){
		var metodos = rectangulo.metodos;
		var mt = $("#methodClase"); 
		if(metodos.length==0){
			mt.html("<b>No hay metodos, añade uno nuevo para iniciar</b>");
			return;
		}
		mt.html("");
		metodos.forEach(function(met){
			console.log("Draw metodos")
			var row = $("<div class='row'></div>");
			var col = $("<div class='col-8'>"+met.metodo+"</div>")
			row.append(col);
			col = $("<div class='col-4'></div>")
			var button = $("<button class='btn btn-danger'>Eliminar</button>");
			col.append(button);
			button.click(function(){
				stompClient.send('/app/deleteMethod.'+idModelo,{},JSON.stringify(met));
			});
			row.append(col);
			mt.append(row);
			row = $("<div class='row' style='heigth:3px;width:100%;'></div>");
			mt.append(row);
		});
	}
	var showAtributes = function(rectangulo){
		var atributes = rectangulo.atributos;
		var at = $("#attrClase");
		at.html("");
		if(atributes.length==0){
			at.html("<b>No hay atributos, añade uno nuevo para iniciar</b>");
			return;
		}
		//console.log(atributes);
		atributes.forEach(function(atr){
			console.log(atr);
			var row = $("<div class='row'></div>");
			var col = $("<div class='col-8'>"+atr.atributo+"</div>")
			row.append(col);
			col = $("<div class='col-4'></div>")
			var button = $("<button class='btn btn-danger'>Eliminar</button>");
			col.append(button);
			button.click(function(){
				stompClient.send('/app/deleteAtribute.'+idModelo,{},JSON.stringify(atr));
			});
			row.append(col);
			at.append(row);
			row = $("<div class='row' style='heigth:3px;width:100%;'></div>");
			at.append(row);
		});
	}
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
		stompClient.send('/app/newrelation.'+idModelo,{},JSON.stringify([{"@type":"Rectangulo","id":r1.id},{"@type":"Rectangulo","id":r2.id}]));		
		toaddline = !toaddline;
		cambiarBotones();
	}

	var deleteRelationIntoClases = function(id1, id2) {
		lineas -= 1;
		var r1 = getRectangleById(id1);
		var r2 = getRectangleById(id2);
		console.log(r1);
		console.log(r2);
		stompClient.send('/app/deleteRelation.'+idModelo,{},JSON.stringify([{"@type":"Rectangulo","id": r1.id}, {"@type":"Rectangulo","id": r2.id}]));		
		flagDeleteRelation = !flagDeleteRelation;
		cambiarBotones();
	}

	var pintarRelacionEntreClases = function (r1, r2) {
		console.log("------ Pintar relacion ---------");
		var r3 = getRectangleById(r1.id);
		var r4 = getRectangleById(r2.id);
		if(r3!=null && r4!=null){
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
            stompClient.subscribe('/shape/newcomponent.'+idModelo, function (eventbody) {
            	//alert("recibio algo");
            	//console.log(JSON.parse(eventbody.body));
            	drawClases(null,{componentes:[JSON.parse(eventbody.body)]});
            });
            stompClient.subscribe('/shape/updatecomponent.'+idModelo, function (eventbody) {
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
			stompClient.subscribe('/shape/deleteComponent.'+idModelo, function (eventbody) {
            	var r1 = JSON.parse(eventbody.body);
				console.log(r1);
				removeRectangle(r1);
				dibujarRelaciones();
            });
			stompClient.subscribe('/shape/newAtribute.'+idModelo, function (eventbody) {
            	var rect = JSON.parse(eventbody.body);
            	updateCollectionRectangle(rect);
            	if(claseEdicion!= null && rect.id==claseEdicion.id){
            		showAtributes(rect);
            	}
            });
			stompClient.subscribe('/shape/deleteAtribute.'+idModelo, function (eventbody) {
            	var rect = JSON.parse(eventbody.body);
            	console.log("Delete");
            	console.log(rect);
            	updateCollectionRectangle(rect);
            	if(claseEdicion!= null && rect.id==claseEdicion.id){
            		showAtributes(rect);
            	}
            });
			stompClient.subscribe('/shape/newMethod.'+idModelo, function (eventbody) {
            	var rect = JSON.parse(eventbody.body);
            	console.log(rect);
            	updateCollectionRectangle(rect);
            	if(claseEdicion!= null && rect.id==claseEdicion.id){
            		showMetodos(rect);
            	}
            });
			stompClient.subscribe('/shape/deleteMethod.'+idModelo, function (eventbody) {
            	var rect = JSON.parse(eventbody.body);
            	console.log(rect);
            	updateCollectionRectangle(rect);
            	if(claseEdicion!= null && rect.id==claseEdicion.id){
            		showMetodos(rect);
            	}
            });
        });
	};
	var removeRectangle= function(rect){
		var li = [];
		var shape = [];
		var c = 0;
		for(var i=0;i<clases.length;i++){
			if(clases[i].id!=rect.id){
				li.push(clases[i]);
				cont[i].attr("id",c);
				shape.push(cont[i]);
				c+=1;
			}else{
				cont[i].remove();
			}
		}
		clases = li;
		cont = shape;
		validLocation();
	};
	var validLocation = function(){
		for(var i=0;i<cont.length;i++){
			var x = clases[i].x-11;
			var y = clases[i].y-50*i;
			if(cont[i].css("top")!=y+"px"){
				cont[i].css("top",y+"px");
			}
			if(cont[i].css("left")!=x+"px"){
				cont[i].css("left",x+"px");
			}
		}
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
			if(getClaseByName(val)!=null){
				$("#idClase").val("");
				alert("Ya existe una clase con este nombre");
				return;
			}
        	//var x = (event.pageX-275+11);
			var x = event.offsetX-4;
        	//var y = event.pageY;
			var y = event.offsetY;
        	var rectangulo = {"@type":"Rectangulo","x":x,"y":y,"ancho":200,"alto":50,"nombre":val};
        	var url = new URL(document.URL);
        	var params = url.searchParams;
        	stompClient.send("/app/newcomponent."+idModelo,{},JSON.stringify(rectangulo));
        	//apiclient.registrarRectangulo(params.get("usuario"),params.get("proyecto"),params.get("version"),params.get("modelo"),sessionStorage.getItem("token"),rectangulo,createRectangle);
			$("#idClase").val("");
			flagCrearClase = false;
	    	cambiarBotones();
        }, getRectangulos:function(){
        	var url = new URL(document.URL);
        	var params = url.searchParams;
        	apiclient.getComponentes(params.get("usuario"),params.get("proyecto"),params.get("version"),params.get("modelo"),sessionStorage.getItem("token"),drawClases);
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
		},borrarClase:function(){
			flagBorrarClase = !flagBorrarClase;
			cambiarBotones();
		},editarClase:function(){
			if(flagEditarClase){
				claseEdicion=null;
			}
			flagEditarClase = !flagEditarClase;
			cambiarBotones();
		}
	};
})();