var draw = (function(){
	var clases = [];
	var createRectangle = function(error,rectangulo){
		if(error!=null){
			alert("No fue posible registrar la nueva clase");
			return ;
		}
		var canv = $("#dib");
		var clase = $("<div style='width:"+rectangulo.ancho+"px; height:"+rectangulo.alto+"px; background:black; margin:0px; color:white; text-align:center; padding:0px;'></div>");
		clase.css("position","relative");
		clase.text(rectangulo.nombre);
		clase.css("left",(rectangulo.x-11)+"px");
    	clase.css("top",rectangulo.y-(50*clases.length)+"px");
    	clase.click(function(ev){
    		ev.stopPropagation();
    	});
    	clase.draggable({containment:"parent",
    		drag:function(drev){
    			//Send to Socket
    			var y = $(this).css("top");
    			var x = $(this).css("left");
    			console.log("X: "+x);
    			console.log("Y: "+y);
    			}
    	});
    	clases.push(rectangulo);
    	canv.append(clase);
	};
	var drawClases = function(err,data){
		if(err!=null){
			console.log("No se han podido cargar las clases, revise su conexion o contactese con el administrador");
			return;
		}
		console.log(data);
		var canv = $("#dib");
		data.forEach(function(rectangulo){
			var clase = $("<div style='width:"+rectangulo.ancho+"px; height:"+rectangulo.alto+"px; background:black; margin:0px; color:white; text-align:center; padding:0px;'></div>");
			clase.css("position","relative");
			clase.text(rectangulo.nombre);
			clase.css("left",(rectangulo.x-11)+"px");
	    	clase.css("top",rectangulo.y-(50*clases.length)+"px");
	    	clase.click(function(ev){
	    		ev.stopPropagation();
	    	});
	    	clase.draggable({containment:"parent",
	    		drag:function(drev){
	    			//Send to Socket
	    			var y = $(this).css("top");
	    			var x = $(this).css("left");
	    			console.log("X: "+x);
	    			console.log("Y: "+y);
	    			}
	    	});
	    	clases.push(rectangulo);
	    	canv.append(clase);
			
		});
	}
	return {
		draw:function(event){
        	console.log(event);
        	event.stopPropagation();
        	var val = $("#clasen").val();
        	if(val==null || val==""){
        		alert("Debes dar nombre a una clase para crearla");
        		return;
        	}
        	var clase = $("<div style='width:200px; height:50px; background:black; margin:0px; color:white; text-align:center; padding:0px;'></div>");
        	var x = (event.pageX-275+11);
        	var y = event.pageY;
        	var rectangulo = {"x":x,"y":y,"ancho":200,"alto":50,"nombre":val};
        	var url = new URL(document.URL);
        	var params = url.searchParams;
        	apiclient.registrarRectangulo(params.get("usuario"),params.get("proyecto"),params.get("version"),params.get("modelo"),sessionStorage.getItem("token"),rectangulo,createRectangle);
        	$("#clasen").val("");
        },getRectangulos(){
        	var url = new URL(document.URL);
        	var params = url.searchParams;
        	apiclient.getRectangulos(params.get("usuario"),params.get("proyecto"),params.get("version"),params.get("modelo"),sessionStorage.getItem("token"),drawClases);
        }
	};
})();