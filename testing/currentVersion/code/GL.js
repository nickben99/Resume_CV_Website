ovnt.GL = function(canvas) {
	this.canvas = canvas;
	this.mvMatrix = mat4.create();
	this.pMatrix = mat4.create();
	this.mvMatrixStack = [];
}

ovnt.GL.prototype.mvPushMatrix = function() {
	var copy = mat4.create();
	mat4.set(this.mvMatrix, copy);
	this.mvMatrixStack.push(copy);
}

ovnt.GL.prototype.mvPopMatrix = function() {
	if (this.mvMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	this.mvMatrix = this.mvMatrixStack.pop();
}
	
ovnt.GL.prototype.setMatrixUniforms = function() {
	this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
    this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
			
	var normalMatrix = mat3.create();
    mat4.toMat3(this.mvMatrix, normalMatrix);
    this.gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
}
	
ovnt.GL.prototype.getShader = function(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		alert("shader could not be found");
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

ovnt.GL.prototype.initShaders = function(gl, vertShader, fragShader) {
	var fragmentShader = this.getShader(gl, fragShader);
	var vertexShader = this.getShader(gl, vertShader);

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	// get location of the vertex position variable
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	
	// get location of the vertex color variable
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
	
	// get location of the texture coord variable
	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
	
	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix"); // projection matrix
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix"); // model view matrix
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix"); // normal matrix
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler"); // texture sampler
	shaderProgram.useTextureUniform = gl.getUniformLocation(shaderProgram, "uUseTexture");
    shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
    
	shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
	shaderProgram.showSpecularHighlightsUniform = gl.getUniformLocation(shaderProgram, "uShowSpecularHighlights");
	shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
	shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");
				
	return shaderProgram;
}

function handleLoadedTexture(texture) {
	var gl = ovnt.webgl.gl;
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

ovnt.GL.prototype.initTexture = function(fileName) {
	var tex = this.gl.createTexture();
	tex.image = new Image();
	tex.image.onload = function () {
		handleLoadedTexture(tex);
	}
	tex.image.src = fileName;
	return tex;
}
	
ovnt.GL.prototype.init = function(canvas) {
	var gl;
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
		
	this.gl = gl;
	this.vertShaderProgram = this.initShaders(gl, "vert-shader-vs", "vert-shader-fs");
	this.fragShaderProgram = this.initShaders(gl, "frag-shader-vs", "frag-shader-fs");
	
	this.shaderProgram = this.fragShaderProgram;
	gl.useProgram(this.shaderProgram);
	
	gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE); // back face culling on
}