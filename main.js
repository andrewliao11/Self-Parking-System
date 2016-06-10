function car()
{
	x_init = 50;
	y_init = 50;
	x = x_init;
	y = y_init;
	x_tem = 50;
	y_tem = 50;
	speed = 2;
	speed_init = speed;
	angle = 0;
	mod = 0;
	t = 0;
	var batch=10;
    	samples=batch;
    	timecycle=0;
    	requestCounter = 0;
    	interval = 0;
    	nodata = 0;
    	serverAddressBase = "xdata.";
    	serverAddress = "xdata.0"; //default file to get from server
	var sel = document.getElementById("mode");
	mode = sel.options[sel.selectedIndex].value;
	window.addEventListener("keydown", keypress_handler, false);
   	window.addEventListener("keyup", keyup_handler, false);
	if (mode=="Backward"){
	    x_park = Math.floor((Math.random() * 250) + 100); // 100~350
	    y_park = Math.floor((Math.random() * 300) + 150); // 150~450
	    //x_park = 350;
	    //y_park = 150;
	    back_dist = x_park+(y_park-y_init-75);
	    okay_b = 0;
	}
	else if (mode=="Shortest"){
	    x_park = Math.floor((Math.random() * 300) + 150); // 150~400
	    y_park = Math.floor((Math.random() * 300) + 150); // 150~450
	}
	else if (mode=="Forward"){
	    x_park = Math.floor((Math.random() * 250) + 150); // 150~400
	    y_park = Math.floor((Math.random() * 300) + 150); // 150~450
	    //x_park = 350;
	    //y_park = 150;
	    for_dist = x_park-(y_park-y_init-75)-20;
	    okay_f = 0;
	}
	else {
	    x_park = Math.floor((Math.random() * 300) + 100); // 100~400
	    y_park = Math.floor((Math.random() * 300) + 150); // 150~450
	}
	back_t = x_park*0.28*2.5;
	for_t = x_park*0.13*2.5;
	canvas = document.getElementById("canvas");
	trace = document.getElementById("trace");
	context = canvas.getContext("2d");
	car = new Image();
    	car.src="myimage.png";

	d1 = new Array();
	d2 = new Array();
	d3 = new Array();
	d4 = new Array();

	var batch=10;
    	samples=batch;
    	timecycle=0;
    	requestCounter = 0;
    	interval = 0;
    	nodata = 0;
    	serverAddressBase = "xdata.";
    	serverAddress = "xdata.0"; //default file to get from server
	xmlHttp = createXmlHttpRequestObject();	
    	var changeHandler = function() {
		location.reload(); 
	}
	window.addEventListener("change", changeHandler, false);
	
	var move = setInterval(function()
	{
		if (mode=="Shortest"){
		    shortest_handler();
		}
		else if (mode=="Backward"){
		    backward_handler();
		}
		else if (mode=="Forward"){
		    forward_handler();
		}
		else if (mode=="Manual"){
		    serverAddress=serverAddressBase+requestCounter;
		    GetJsonData();
		    if(!nodata){ //Keep the file counter
			requestCounter=(requestCounter+1)%2; 
		    }
		    if (d4[0]>0.7) speed += 0.3;
		    if (d4[0]<0.2 && d4[0]!=-1) speed -= 0.3;
		    manual_handler();
		}
		t += 1;
		draw();
	}, 70);
};
function draw(){
	context = canvas.getContext("2d");
	context.clearRect(0, 0, 500, 600);

	// draw line
	context.moveTo(x_park-50,y_park-75);	
	context.lineTo(x_park-50,y_park+75);
        context.strokeStyle = '#ffffff';
	context.stroke();

	context.moveTo(x_park-50,y_park+75);
        context.lineTo(x_park+50,y_park+75);
        context.strokeStyle = '#ffffff';
        context.stroke();

	context.moveTo(x_park+50,y_park+75);
        context.lineTo(x_park+50,y_park-75);
        context.strokeStyle = '#ffffff';
        context.stroke();

        context.moveTo(x_park+50,y_park-75);
        context.lineTo(x_park-50,y_park-75);
        context.strokeStyle = '#ffffff';
        context.stroke();

	x += (speed*mod) * Math.cos(Math.PI/180 * angle);
 	if (x>500){
		x = 500;
	}
	if (x<0){
		x = 0;
	}
	y += (speed*mod) * Math.sin(Math.PI/180 * angle);
	if (y>600){
		y = 600;
	}
	if (y<0){
		y = 0;
	}
	var dist_x = x_park - x;
	var dist_y = y_park - y;
	var dist = Math.sqrt(Math.pow(dist_x,2)+Math.pow(dist_y,2));
	if (dist<20){
	    context.fillStyle="#FFFF66";
	    context.fillRect(x_park-50,y_park-75,100,150); 
	}

	context.save();
	context.translate(x, y);
	context.rotate(Math.PI/180 * angle);
	context.drawImage(car, -(car.width/2), -(car.height/2));	
	context.restore();
	
	if (mode=="Backward"||mode=="Forward"){
	    var img1 = document.getElementById("obs");
	    context.drawImage(img1,x_park-150,y_park-75);
	    context.drawImage(img1,x_park+50,y_park-75);
	}

	
	context_tr = trace.getContext("2d");
	context_tr.moveTo(x_tem,y_tem);	
	x_tem = x;
	y_tem = y;
	context_tr.lineTo(x_tem, y_tem);
        context_tr.strokeStyle = '#ffffff';
	context_tr.stroke();

}
function keyup_handler(event)
{
	if (mode=="Keyboard"){
	if(event.keyCode == 87 || event.keyCode == 83)
	{
		mod = 0;
	}
	}
}

function keypress_handler(event)
{
	if (mode=="Keyboard"){
	console.log(event.keyCode);
	if(event.keyCode == 87)
	{
		mod = 1;
	}
	if(event.keyCode == 83)
	{
		mod = -1;
	}
	if(event.keyCode == 65)
	{
		angle -= 2;
	}
	if(event.keyCode == 68)
	{
		angle+=2;
	}}
}

function forward_handler(){

	var dist_x = x_park - x;
	var dist_y = y_park - y;
	var dist = Math.sqrt(Math.pow(dist_x,2)+Math.pow(dist_y,2));
	var desired_angle = Math.atan(dist_y/dist_x)*180/Math.PI;


	if ((y_park-y_init<300)||(x_park-x_init<250)){
	    if (okay_f==0){
	    	if (x<for_dist) mod = 1;
	    	else if (x>for_dist) {
		    okay_f =1; 
		    //alert("succcess");
		    if (y_park-y_init<300)
		        speed = 1.5*(y_park-y_init)*0.01;
		    else
			speed = 1*(y_park-y_init)*0.01;
	    	}
	    }
	    else if (dist>20){
	    mod = 1;
	    if (dist_x>0 && dist_y>0){
		if (angle<desired_angle && angle>(desired_angle-180))	angle += 1.5; 
		else 	angle -= 1.5; 
	    }
	    else if (dist_x<0 && dist_y>0){
		if (angle>desired_angle && angle<(desired_angle+180))	angle += 1.5;  
		else 	angle -= 1.5; 
	    }
	    else if (dist_x>0 && dist_y<0){
		if (angle>desired_angle && angle<(desired_angle+180))	angle -= 1.5; 
		else 	angle += 1.5;  
	    }
	    else if (dist_x<0 && dist_y<0){
		if (angle<desired_angle && angle>(desired_angle-180))	angle -= 1.5; 
		else 	angle += 1.5; 
	    }
	    else if (Math.abs(dist_x)<2 && dist_y>0){
		desired_angle = 90;
		if (angle<desired_angle && angle>(desired_angle-180))	angle += 1.5; 
		else 	angle -= 1.5;  
	    }
	    else if (Math.abs(dist_x)<2 && dist_y<0){
		desired_angle = -90;
		if (angle<desired_angle && angle>(desired_angle+180))	angle -= 1.5; 
		else 	angle += 1.5; 
	    }	    
	    }
	    else{
	    mod=0;
	    angle=angle;
	    }
	}
	else{
	    if (t<for_t){
	    	mod = 1;
		angle = angle;
	    }
	    else if (dist>20){
	    mod = 1;
	    if (dist_x>0 && dist_y>0){
		if (angle<desired_angle && angle>(desired_angle-180))	angle += 1.5; 
		else 	angle -= 1.5; 
	    }
	    else if (dist_x<0 && dist_y>0){
		if (angle>desired_angle && angle<(desired_angle+180))	angle += 1.5;  
		else 	angle -= 1.5; 
	    }
	    else if (dist_x>0 && dist_y<0){
		if (angle>desired_angle && angle<(desired_angle+180))	angle -= 1.5; 
		else 	angle += 1.5;  
	    }
	    else if (dist_x<0 && dist_y<0){
		if (angle<desired_angle && angle>(desired_angle-180))	angle -= 1.5; 
		else 	angle += 1.5; 
	    }
	    else if (Math.abs(dist_x)<2 && dist_y>0){
		desired_angle = 90;
		if (angle<desired_angle && angle>(desired_angle-180))	angle += 1.5; 
		else 	angle -= 1.5;  
	    }
	    else if (Math.abs(dist_x)<2 && dist_y<0){
		desired_angle = -90;
		if (angle<desired_angle && angle>(desired_angle+180))	angle -= 1.5; 
		else 	angle += 1.5; 
	    }	    
	    }
	    else{
	    mod=0;
	    angle=angle;
	    }
	}
	
	
	// angle = -pi/2 ~ pi/2
	if (angle>180)	angle = 360-angle;
	if (angle<-180)	angle = 360+angle;

}
function backward_handler(){

	var dist_x = x_park - x;
	var dist_y = y_park - y;
	var dist = Math.sqrt(Math.pow(dist_x,2)+Math.pow(dist_y,2));
	var desired_angle = Math.atan(dist_y/dist_x)*180/Math.PI;

	if ((y_park-y_init)<300){
	    if (okay_b==0){
	    	if (x<back_dist) mod = 1;
	    	else if (x>back_dist) {
		    okay_b =1; 
		    //alert("succcess");
		    speed = 1.5*(y_park-y_init)*0.01;
	    	}
	    }
	    else if (dist>20){
	    mod = -1;
	    if (dist_x>0 && dist_y>0){
		if (angle<desired_angle && angle>(desired_angle-180))	angle -= 1.5; 
		else 	angle += 1.5; 
	    }
	    else if (dist_x<0 && dist_y>0){
		if (angle>desired_angle && angle<(desired_angle+180))	angle -= 1.5;  
		else 	angle += 1.5; 
	    }
	    else if (dist_x>0 && dist_y<0){
		if (angle>desired_angle && angle<(desired_angle+180))	angle += 1.5; 
		else 	angle -= 1.5;  
	    }
	    else if (dist_x<0 && dist_y<0){
		if (angle<desired_angle && angle>(desired_angle-180))	angle += 1.5; 
		else 	angle -= 1.5; 
	    }
	    else if (Math.abs(dist_x)<2 && dist_y>0){
		desired_angle = 90;
		if (angle<desired_angle && angle>(desired_angle-180))	angle -= 1.5; 
		else 	angle += 1.5;  
	    }
	    else if (Math.abs(dist_x)<2 && dist_y<0){
		desired_angle = -90;
		if (angle<desired_angle && angle>(desired_angle+180))	angle += 1.5; 
		else 	angle -= 1.5; 
	    }	    
	    }
	    else{
	    mod=0;
	    angle=angle;
	    }
	}
	else{ 
	if (t < back_t){
	    angle = angle;
	    mod = 1;
	}
	else if (dist>20){
	    if (dist<150) speed = 2*0.7;
	    mod = -1;
	    if (dist_x>0 && dist_y>0){
		if (angle<desired_angle && angle>(desired_angle-180))	angle -= 1.5;  
		else 	angle += 1.5; 
	    }
	    else if (dist_x<0 && dist_y>0){
		if (angle>desired_angle && angle<(desired_angle+180))	angle -= 1.5; 
		else 	angle += 1.5; 
	    }
	    else if (dist_x>0 && dist_y<0){
		if (angle>desired_angle && angle<(desired_angle+180))	angle += 1.5; 
		else 	angle -= 1.5; 
	    }
	    else if (dist_x<0 && dist_y<0){
		if (angle<desired_angle && angle>(desired_angle-180))	angle += 1.5; 
		else 	angle -= 1.5; 
	    }
	    else if (Math.abs(dist_x)<2 && dist_y>0){
		desired_angle = 90;
		if (angle<desired_angle && angle>(desired_angle-180))	angle -= 1.5; 
		else 	angle += 1.5; 
	    }
	    else if (Math.abs(dist_x)<2 && dist_y<0){
		desired_angle = -90;
		if (angle<desired_angle && angle>(desired_angle+180))	angle += 1.5; 
		else 	angle -= 1.5; 
	    }	    
	}
	else{
	    mod=0;
	    angle=angle;
	}
	}
	// angle = -pi/2 ~ pi/2
	if (angle>180)	angle = 360-angle;
	if (angle<-180)	angle = 360+angle;

}
function shortest_handler(){

	var dist_x = x_park - x;
	var dist_y = y_park - y;
	var dist = Math.sqrt(Math.pow(dist_x,2)+Math.pow(dist_y,2));
	var desired_angle = Math.atan(dist_y/dist_x)*180/Math.PI;
	// move & rotate
	if (dist>20){
	    mod = 1;
	    if (dist_x>0 && dist_y>0){
		if (angle<desired_angle && angle>(desired_angle-180))	angle += 2; 
		else 	angle -= 2; 
	    }
	    else if (dist_x<0 && dist_y>0){
		if (angle>desired_angle && angle<(desired_angle+180))	angle += 2; 
		else 	angle -= 2;
	    }
	    else if (dist_x>0 && dist_y<0){
		if (angle>desired_angle && angle<(desired_angle+180))	angle -= 2; 
		else 	angle += 2; 
	    }
	    else if (dist_x<0 && dist_y<0){
		if (angle<desired_angle && angle>(desired_angle-180))	angle -= 2;
		else 	angle += 2; 
	    }
	    else if (Math.abs(dist_x)<2 && dist_y>0){
		desired_angle = 90;
		if (angle<desired_angle && angle>(desired_angle-180))	angle += 2;
		else 	angle -= 2; 
	    }
	    else if (Math.abs(dist_x)<2 && dist_y<0){
		desired_angle = -90;
		if (angle<desired_angle && angle>(desired_angle+180))	angle -= 2;
		else 	angle += 2; 
	    }	    
	}
	else{
	    mod=0;
	    angle=angle;
	}
	// angle = -pi/2 ~ pi/2
	if (angle>180)	angle = 360-angle;
	if (angle<-180)	angle = 360+angle;

}
function manual_handler(){


	if(d1[5] >= 1500){
		mod = 1;
	}
	else if(d1[5] <= -1500){
		mod = -1;
	}
	else{
		mod = 0;
	}
	if(d2[5] >= 1500){
		angle -= 2;
	}
	else if(d2[5] <= -1500){
		angle+=2;
	}
	else
		angle=angle;

	if (angle>180)	angle = 360-angle;
	if (angle<-180)	angle = 360+angle;
}
// creates XMLHttpRequest Instance
function createXmlHttpRequestObject(){

      // will store XMLHttpRequest object at here
      var xmlHttp;
      // works all exceprt IE6 and older  
      try{
	// try to create XMLHttpRequest object
	xmlHttp = new XMLHttpRequest();    
      }
      catch(e){
	// assume IE 6 or older
	try{
	  xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	catch(e){ }
      }
      
      // return object or display error
      if (!xmlHttp)
	alert("Error creating the XMLHttpRequest Object");
      else
	return xmlHttp;
}
function GetJsonData()
    {
      //debug
      //myDiv = document.getElementById("myDivElement"); 
      //myDiv.innerHTML += "Getting Json Data<br>"; 
      nodata=0;

      if(xmlHttp){
	try{
	  xmlHttp.open("Get", serverAddress, false);
	  //window.alert(serverAddress);
	  //xmlHttp.onreadystatechange = handleRequestStateChange; //We use synchronous data transfer, so we don't need this here
	  xmlHttp.send();
	  try{
		  handleJsonData();
	  }
	  catch(err){
	     if(err=="no data"){
	          //alert('Waiting '+serverAddressBase+requestCounter);
		  //setTimeout(GetJsonData,10); //Try again 10ms later
		  nodata=1; //record status
	     }
	  }
	}
	catch(e){
	    //document.write(serverAddress);
	   setTimeout(GetJsonData,10);
	  //alert("Can't connect to server\n" + e.toString());
	}
      }
}

function handleJsonData(){
      var result = xmlHttp.responseText;
      if(result==''){
        //alert('No data from xmlhttprequest object!');
	throw "no data";
      }
      else{
	      try{
		      var jobject = eval("(" + result + ")");
		      var i=0;
		      if(jobject.time>timecycle){
			      timecycle=jobject.time;
			      if(jobject.xarray.length==0){
				throw "no data";
			      }
			      else{
				      for (i=0;i<jobject.xarray.length;i++)
				      {
					  //debug
					  //myDiv.innerHTML += jobject.xarray[i][0] + ", " + jobject.xarray[i][1] + "<br>" ;
					  d1[i]=jobject.xarray[i][0];
					  d2[i]=jobject.xarray[i][1];
					  d3[i]=jobject.xarray[i][2];
					  d4[i]=jobject.xarray[i][3];
					  /*
					  d1.push(jobject.xarray[i][0]); 
					  d2.push(jobject.xarray[i][1]); 
					  d3.push(jobject.xarray[i][2]);
					  */
				      }
			      }
		      }
		      else{
			//Do nothing
		      }
	      }
	      catch(e){
		//Retry; ignore all json errors
	      }
      }
}

