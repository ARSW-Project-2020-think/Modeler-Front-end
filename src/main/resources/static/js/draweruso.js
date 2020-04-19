var drawer = (function(){
	var idModelo = null;
	var stompClient = null;
	var ovalos = [];
	var ovalosShape = [];
	var usuario = [];
	var selectTedComponent = null;
	var url = "https://class-modeler.herokuapp.com";
	//var url = "http://localhost:4444";
	var orderByType = function(data){
		var li = [];
		["Ovalo","Actor"].forEach(function(tipo){
			for(var i=0;i<data.length;i++){
				if(data[i]["@type"]==tipo){
					li.push(data[i]);
				}
			}
		});
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
		//console.log(data);
		drawComponentesn(data.componentes);
	};
	var drawComponentesn = function(componentes){
		componentes.forEach(function(componente){
			if(componente["@type"]=="Ovalo"){
				drawOvalo(componente);
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
	var removeGraphicsOvals = function(){
		ovalosShape.forEach(function(ovalo){
			ovalo.remove();
		});
		ovalosShape = [];
	};
	var updateOval=function(ovalo){
		for(var i=0;i<ovalos.length;i++){
			if(ovalo.id == ovalos[i].id){
				ovalos[i] = ovalo;
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
            	console.log(JSON.parse(eventbody.body));
            	drawComponentes(null,{componentes:[JSON.parse(eventbody.body)]});
            });
            stompClient.subscribe('/shape/updatecomponent.'+idModelo, function (eventbody) {
            	var comp = JSON.parse(eventbody.body);
            	if(comp.id == selectTedComponent){
            		return;
            	}
            	removeGraphicsOvals();
            	updateOval(JSON.parse(eventbody.body));
            	ovalos2 = ovalos;
            	ovalos = [];
            	drawComponentes(null,{componentes:ovalos2});
            });
        });
	}
	return{
		draw:function(event){
			console.log(event);
			var text = $("#novalo").val();
			console.log(text);
			var x = (event.pageX-275+11);
        	var y = event.pageY;
			var ovalo = {"@type":"Ovalo","nombre":text,"x":x,"y":y,"ancho":300,"alto":50};
			stompClient.send("/app/newcomponent."+idModelo,{},JSON.stringify(ovalo));
			$("#novalo").val("");
		},
		getComponents:function(){
			var url = new URL(document.URL);
        	var params = url.searchParams;
        	apiclient.getComponentes(params.get("usuario"),params.get("proyecto"),params.get("version"),params.get("modelo"),sessionStorage.getItem("token"),drawComponentes);
		}
	}
})();