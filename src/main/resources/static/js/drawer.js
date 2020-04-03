var draw = (function(){
	var clases = [];
	var cont = [];
	var stompClient = null;
	var idModelo = null;
	var selected = null;
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
		data.rectangulos.forEach(function(rectangulo){
			var clase = $("<div style='width:"+rectangulo.ancho+"px; height:"+rectangulo.alto+"px; background:black; margin:0px; color:white; text-align:center; padding:0px;' id='"+clases.length+"'></div>");
			clase.css("position","relative");
			clase.text(rectangulo.nombre);
			clase.css("left",(rectangulo.x-11)+"px");
	    	clase.css("top",rectangulo.y-(50*clases.length)+"px");
	    	clase.click(function(ev){
	    		ev.stopPropagation();
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
	};
	var loadSocket = function(id){
		idModelo = id;
		console.log(idModelo);
		var socket = new SockJS(url+'/modeler');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/shape/newrectangle.'+idModelo, function (eventbody) {
            	alert("recibio algo");
            	drawClases(null,{rectangulos:[JSON.parse(eventbody.body)]});
            });
            stompClient.subscribe('/shape/updaterectangle.'+idModelo, function (eventbody) {
            	var rect = JSON.parse(eventbody.body);
            	//alert("recibio update");
            	if(selected!=null && selected.id==rect.id){
            		return;
            	};
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
            });
        });
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
        }
	};
})();