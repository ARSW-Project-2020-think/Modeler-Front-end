var draw = (function(){
	var clases = [];
	var cont = [];
	var lines = [];
	var graphicslines = [];
	var stompClient = null;
	var idModelo = null;
	var selected = null;
	var origin = null;
	var toaddline = false;
	var url = "https://class-modeler.herokuapp.com";
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
		data.lineas.forEach(function(linea){
			console.log(linea);
			lines.push(linea);
        	console.log("recibio linea");
        	var obj = createLine(linea.x1,linea.y1,linea.x2,linea.y2);
        	obj.attr("id","line"+linea.id);
        	canv.append(obj);
		});
		data.rectangulos.forEach(function(rectangulo){
			var clase = $("<div style='z-index:9000; width:"+rectangulo.ancho+"px; height:"+rectangulo.alto+"px; background:black; margin:0px; color:white; text-align:center; padding:0px;' id='"+clases.length+"'></div>");
			clase.css("position","relative");
			clase.text(rectangulo.nombre);
			clase.css("left",(rectangulo.x-11)+"px");
	    	clase.css("top",rectangulo.y-(50*clases.length)+"px");
	    	clase.click(function(ev){
	    		ev.stopPropagation();
	    		if(toaddline && origin==null){
	    			origin = parseInt($(this).attr("id"));
	    		}else if(toaddline){
	    			var id2 = parseInt($(this).attr("id"));
	    			console.log("Points: "+origin+" "+id2);
	    			createLineIntoClases(origin,id2);
	    			origin=null;
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
		    			stompClient.send('/app/updaterectangle.'+idModelo,{},JSON.stringify(rectangulo));
	    			}
	    	});
	    	clase.mouseup(function() {
	    		  if(selected!= null && selected.id==rectangulo.id){
	    			  selected = null;
	    		  }
	    		});
	    	clases.push(rectangulo);
	    	cont.push(clase);
	    	canv.append(clase);
		});
		var line = createLine(0,0,200,5);
		//canv.append(line);
		//line = createLine(0,0,700,100);
		//canv.append(line);
		//line = createLine(0,0,1000,112);
		//canv.append(line);
		//line = createLine(0,0,2000,112);
		//canv.append(line);
	};
	var createLineIntoClases = function(id1,id2){
		var r1 = getRectangleById(id1);
		var r2 = getRectangleById(id2);
		console.log(r1);
		console.log(r2);
		var l = {"x1":parseInt(r1.x+(r1.ancho/2)),"y1":parseInt(r1.y+(r1.alto/2)),"x2":parseInt(r2.x+(r2.ancho/2)),"y2":parseInt(r2.y+(r2.alto/2)),"nombre1":$("#attr1").val(),"nombre2":$("#attr2").val()};
		stompClient.send('/app/newline.'+idModelo,{},JSON.stringify(l));
	}
	var getRectangleById= function(id){
		for(var i=0;i<clases.length;i++){
			console.log("Clase "+i);
			if(cont[i].attr("id")==id){
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
	    line.css("top",y+(-50*clases.length)+"px");
	    line.css("left",(x-11)+"px");
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
            	drawClases(null,{rectangulos:[JSON.parse(eventbody.body)]});
            });
            stompClient.subscribe('/shape/updaterectangle.'+idModelo, function (eventbody) {
            	var rect = JSON.parse(eventbody.body);
            	if(selected!=null && selected.id==rect.id){
            		return;
            	};
            	updateRectangle(rect);
            });
            stompClient.subscribe('/shape/newline.'+idModelo, function (eventbody) {
            	var linea = JSON.parse(eventbody.body);
            	lines.push(linea);
            	console.log("recibio linea");
            	var obj = createLine(linea.x1,linea.y1,linea.x2,linea.y2);
            	obj.attr("id","line"+linea.id);
            	$("#dib").append(obj);
            });
        });
	};
	var updateRectangle = function(rect){
		console.log(rect);
    	for(var i=0;i<cont.length;i++){
    		if(clases[i].id==rect.id && clases[i].x != rect.x && clases[i].y != rect.y){
    			clases[i].x = rect.x;
    			clases[i].y = rect.y;
    			cont[i].css("left", (clases[i].x-11)+"px");
    			cont[i].css("top",(clases[i].y-(50*parseInt(cont[i].attr("id"))))+"px");
    			console.log("update location");
    			console.log(cont[i]);
    		}
    	}
	};
	return {
		draw:function(event){
        	console.log(event);
        	event.stopPropagation();
        	var val = $("#clasen").val();
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
        	$("#clasen").val("");
        },getRectangulos(){
        	var url = new URL(document.URL);
        	var params = url.searchParams;
        	apiclient.getRectangulos(params.get("usuario"),params.get("proyecto"),params.get("version"),params.get("modelo"),sessionStorage.getItem("token"),drawClases);
        },setAddLine:function(){
        	toaddline=!toaddline;
        }
	};
})();