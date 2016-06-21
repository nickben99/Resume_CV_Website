ovnt.Sprite = function(x, y, model) {
	this.position = vec3.create([x, y, 0.0]);
	this.rotation = 0;
	this.model = model;
	this.totalSpeed = 5
	this.xSpeed = this.totalSpeed; 
	this.ySpeed = 0;
	this.transform = mat4.create();
	mat4.identity(this.transform);
	this.debug = 0;
	
	this.currentFrame = 0.0; // start at frame 0;
	this.loopingAnimation = true // the animation will loop
	this.framesPerSecond = 20 /* 20 actual animation frames will be interpolated 
								through each second */
}

ovnt.Sprite.prototype.tick = function(frameData) {
	// move the rectangle on x and y axis
	this.position[0] += this.xSpeed;
	this.position[1] += this.ySpeed;
	
	this.rotation += 0.05;
	
	// restrict the rectangle on the x axis
	if ( (this.xSpeed > 0 && this.position[0] >= (frameData.canvas.width*0.5)) || (this.xSpeed < 0 && this.position[0] <= -(frameData.canvas.width*0.5)) )
	{
		this.xSpeed = -this.xSpeed;
	}
	
	// restrict the rectangle on the y axis
	if ( (this.ySpeed > 0 && this.position[1] >= (frameData.canvas.height*0.5)) || (this.ySpeed < 0 && this.position[1] <= -(frameData.canvas.height*0.5)) )
	{
		this.ySpeed = -this.ySpeed;
	}
	
	// check if any of the arrow keys are down
	if (frameData.keysDown[37] || frameData.keysDown[38] || frameData.keysDown[39] || frameData.keysDown[40])
	{
		this.xSpeed = 0;
		this.ySpeed = 0;
		
		if (frameData.keysDown[37]) // left
		{
			this.position[0] -= this.totalSpeed;
		}
		if (frameData.keysDown[38]) // up
		{
			this.position[1] += this.totalSpeed;
		}
		if (frameData.keysDown[39]) // right
		{
			this.position[0] += this.totalSpeed;
		}
		if (frameData.keysDown[40]) // down
		{
			this.position[1] -= this.totalSpeed;
		}				
	}
	
	if (frameData.mouseDown[0]) // left mouse button
	{		
		// this function makes the rectangle travel towards the mouse click pos
		var targetX = -(frameData.canvas.width*0.5) + frameData.mousePos.x;
		var targetY = (frameData.canvas.height*0.5) - frameData.mousePos.y;
		
		var xSpeed = targetX - this.position[0];
		var ySpeed = targetY - this.position[1];
		
		var length = Math.sqrt(xSpeed*xSpeed + ySpeed*ySpeed);
		var tol = 0.01;
		if (length > tol)
		{	// normalize x and y speed
			this.xSpeed = xSpeed / length;
			this.ySpeed = ySpeed / length;
			
			this.xSpeed *= this.totalSpeed;
			this.ySpeed *= this.totalSpeed;					
		}
	}
}

ovnt.Sprite.prototype.draw = function(frameData) {
	frameData.webgl.mvPushMatrix();
		mat4.identity(this.transform);
		mat4.translate(this.transform, this.position);
		mat4.rotate(this.transform, this.rotation, [1, 1, 1]);
		mat4.multiply(frameData.webgl.mvMatrix, this.transform);		
		frameData.webgl.setMatrixUniforms();
		if (typeof this.model.advanceFrame == 'function')
		{
			var amtOver;
			this.model.advanceFrame(this.timeChange, this.currentFrame, this.framesPerSecond, this.loopingAnimation, 0, -1, amtOver);
		}
		this.model.draw(frameData);
	frameData.webgl.mvPopMatrix(); // restore the matrix
}