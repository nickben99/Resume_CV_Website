ovnt.TriangleModel = function(gl, shaderProgram) {
	this.gl = gl;
	this.shaderProgram = shaderProgram;
   
	this.initPositionBuffer(this.gl);
	this.initColorBuffer(this.gl);
	this.initTexCoordBuffer(this.gl);
	this.initNormalBuffer(this.gl);
}

ovnt.TriangleModel.prototype.initPositionBuffer = function(gl) {
	this.PositionBuffer = gl.createBuffer();
	
	var size = 30.0
	var vertices = [
		// Front face
		 0.0,  size,  0.0,
		-size, -size,  size,
		 size, -size,  size,

		// Right face
		 0.0,  size,  0.0,
		 size, -size,  size,
		 0.0, -size, -size,

		// bottom face
		 0.0,  -size, -size,
		size, -size, size,
		-size, -size, size,

		// Left face
		 0.0,  size,  0.0,
		0.0, -size, -size,
		-size, -size,  size
	];
	
	this.initBuffer(this.gl, this.PositionBuffer, vertices, 3, 12);
}

ovnt.TriangleModel.prototype.initColorBuffer = function(gl) {
	this.ColorBuffer = gl.createBuffer();
	var colors = [
		// Front face
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,

		// Right face
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,

		// Bottom face
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,

		// Left face
		1.0, 1.0, 0.0, 1.0,
		1.0, 1.0, 0.0, 1.0,
		1.0, 1.0, 0.0, 1.0
	];
	
	this.initBuffer(this.gl, this.ColorBuffer, colors, 4, 12);
}

ovnt.TriangleModel.prototype.initNormalBuffer = function(gl) {
	this.NormalBuffer = gl.createBuffer();
	var normals = [
		// Front face
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,

		// Right face
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,

		// Bottom face
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,

		// Left face
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,
	];
	
	this.initBuffer(this.gl, this.NormalBuffer, normals, 3, 12);
}

ovnt.TriangleModel.prototype.initTexCoordBuffer = function(gl) {
	this.TexCoordBuffer = gl.createBuffer();
	var textureCoords = [
		// Front face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,

		// Bottom face
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,

		// Right face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,

		// Left face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
	];
	
	this.initBuffer(this.gl, this.TexCoordBuffer, textureCoords, 2, 12);
}

ovnt.TriangleModel.prototype.initBuffer = function(gl, buffer, data, itemSize, numItems) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	buffer.itemSize = itemSize;
	buffer.numItems = numItems;
}

ovnt.TriangleModel.prototype.draw = function(frameData) {
	var gl = frameData.webgl.gl;
	// bind positions
	gl.bindBuffer(gl.ARRAY_BUFFER, this.PositionBuffer);
	gl.vertexAttribPointer(frameData.webgl.shaderProgram.vertexPositionAttribute, this.PositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// bind colors
	gl.bindBuffer(gl.ARRAY_BUFFER, this.ColorBuffer);
    gl.vertexAttribPointer(frameData.webgl.shaderProgram.vertexColorAttribute, this.ColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// bind texture
	gl.bindBuffer(gl.ARRAY_BUFFER, this.TexCoordBuffer);
    gl.vertexAttribPointer(frameData.webgl.shaderProgram.textureCoordAttribute, this.TexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// bind normals
	gl.bindBuffer(gl.ARRAY_BUFFER, this.NormalBuffer);
    gl.vertexAttribPointer(frameData.webgl.shaderProgram.vertexNormalAttribute, this.NormalBuffer.itemSize, gl.FLOAT, false, 0, 0);		
	
	gl.uniform1i(frameData.webgl.shaderProgram.useTextureUniform, false);
	gl.uniform1i(frameData.webgl.shaderProgram.useLightingUniform, false);
	gl.uniform1i(frameData.webgl.shaderProgram.showSpecularHighlightsUniform, false);
	gl.uniform1f(frameData.webgl.shaderProgram.materialShininessUniform, 0);
	
	// draw	
	gl.drawArrays(gl.TRIANGLES, 0, this.PositionBuffer.numItems);
}