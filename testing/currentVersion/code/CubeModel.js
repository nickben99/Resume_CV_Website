ovnt.CubeModel = function(webgl, shaderProgram, texture) {
	this.gl = webgl.gl;
	this.shaderProgram = shaderProgram;
   
	this.initPositionBuffer(this.gl);
	this.initColorBuffer(this.gl);
	this.initTexCoordBuffer(this.gl);
	this.initNormalBuffer(this.gl);
	this.initVertexIndexBuffer(this.gl);
	
	this.texture = ovnt.texLoad.TextureLoad(texture);
}

ovnt.CubeModel.prototype.initPositionBuffer = function(gl) {
	this.PositionBuffer = gl.createBuffer();
	
	var size = 30.0;
	vertices = [
		// Front face
		-size, -size,  size,
		 size, -size,  size,
		 size,  size,  size,
		-size,  size,  size,

		// Back face
		-size, -size, -size,
		-size,  size, -size,
		 size,  size, -size,
		 size, -size, -size,

		// Top face
		-size,  size, -size,
		-size,  size,  size,
		 size,  size,  size,
		 size,  size, -size,

		// Bottom face
		-size, -size, -size,
		 size, -size, -size,
		 size, -size,  size,
		-size, -size,  size,

		// Right face
		 size, -size, -size,
		 size,  size, -size,
		 size,  size,  size,
		 size, -size,  size,

		// Left face
		-size, -size, -size,
		-size, -size,  size,
		-size,  size,  size,
		-size,  size, -size,
	];
	
	this.initArrayBuffer(this.gl, this.PositionBuffer, vertices, 3, 24);
}

ovnt.CubeModel.prototype.initColorBuffer = function(gl) {
	this.ColorBuffer = gl.createBuffer();
	var colors = [
		// Front face
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,

		// back face
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,

		// top face
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,

		// bottom face
		1.0, 1.0, 0.0, 1.0,
		1.0, 1.0, 0.0, 1.0,
		1.0, 1.0, 0.0, 1.0,
		1.0, 1.0, 0.0, 1.0,
		
		// right face
		0.0, 1.0, 1.0, 1.0,
		0.0, 1.0, 1.0, 1.0,
		0.0, 1.0, 1.0, 1.0,
		0.0, 1.0, 1.0, 1.0,
		
		// left face
		0.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 0.0, 1.0,
	];
	
	this.initArrayBuffer(this.gl, this.ColorBuffer, colors, 4, 24);
}

ovnt.CubeModel.prototype.initNormalBuffer = function(gl) {
	this.NormalBuffer = gl.createBuffer();
	var normals = [
		// Front face
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,

		// back face
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,

		// top face
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,

		// bottom face
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		
		// right face
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		
		// left face
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
	];
	
	this.initArrayBuffer(this.gl, this.NormalBuffer, normals, 3, 24);
}

ovnt.CubeModel.prototype.initTexCoordBuffer = function(gl) {
	this.TexCoordBuffer = gl.createBuffer();
	var textureCoords = [
		// Front face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,

		// Back face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,

		// Top face
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,

		// Bottom face
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,

		// Right face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,

		// Left face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
	];
	
	this.initArrayBuffer(this.gl, this.TexCoordBuffer, textureCoords, 2, 24);
}

ovnt.CubeModel.prototype.initVertexIndexBuffer = function(gl) {
	this.VertexIndexBuffer = gl.createBuffer();
	var cubeVertexIndices = [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 5, 6,      4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23  // Left face
	];
	
	this.initElementArrayBuffer(this.gl, this.VertexIndexBuffer, cubeVertexIndices, 1, 36);
}

ovnt.CubeModel.prototype.initArrayBuffer = function(gl, buffer, data, itemSize, numItems) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	buffer.itemSize = itemSize;
	buffer.numItems = numItems;
}

ovnt.CubeModel.prototype.initElementArrayBuffer = function(gl, buffer, data, itemSize, numItems) {
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
	buffer.itemSize = itemSize;
	buffer.numItems = numItems;
}

ovnt.CubeModel.prototype.draw = function(frameData) {
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
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);	
    gl.uniform1i(frameData.webgl.shaderProgram.samplerUniform, 0);
	gl.uniform1i(frameData.webgl.shaderProgram.useTextureUniform, true);
	gl.uniform1i(frameData.webgl.shaderProgram.useLightingUniform, true);
	gl.uniform1i(frameData.webgl.shaderProgram.showSpecularHighlightsUniform, true);
	gl.uniform1f(frameData.webgl.shaderProgram.materialShininessUniform, 100);
			
	// draw	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.VertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, this.VertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}