var drawer = (function(){
	var idModelo = null;
	var stompClient = null;
	var ovalos = [];
	var url = "https://class-modeler.herokuapp.com";
	//var url = "http://localhost:4444";
	var drawComponentes = function(err,data){
		if(err!=null){
			alert("Hubo un error");
			return;
		}
		if(stompClient==null){
			loadSocket(data.id);
		}
		console.log(data);
		drawOvals(data.componentes);
	};
	var drawOvals = function(ovalos){
		ovalos.forEach(function(ovalo){
			console.log(ovalo);
		});
	};
	var loadSocket = function(id){
		idModelo = id;
		var socket = new SockJS(url+'/modeler');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/shape/newcomponent.'+idModelo, function (eventbody) {
            	drawComponentes(null,{componentes:[JSON.parse(eventbody.body)]});
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
			var ovalo = {"@type":"Ovalo","nombre":text,"x":x,"y":y};
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