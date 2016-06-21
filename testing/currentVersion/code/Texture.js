ovnt.Texture = function() {
	this.loadedTextures = {}
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

ovnt.Texture.prototype.TextureLoad = function(fileName) {	
	if (this.loadedTextures[fileName]) {
		return this.loadedTextures[fileName];
	}
	ovnt.myLog("to load... " + fileName);
	
	var tex = ovnt.webgl.gl.createTexture();
	tex.image = new Image();
	tex.image.onload = function () {
		handleLoadedTexture(tex);
	}
	tex.image.src = fileName;
	
	this.loadedTextures[fileName] = tex;
	return tex;
}