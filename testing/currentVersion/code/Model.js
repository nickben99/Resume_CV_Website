ovnt.Model = function() {
	this.boundingSphereRadUnAnimated = 0.0;
	this.transparency = false; // will be changed to true if any of the model is transparent
}

// create the models display list
ovnt.Model.prototype.createDisplayList = function() 
{
}

// restart the animation
ovnt.Model.prototype.restart = function() 
{	// go through all the bones
	for (var bone = 0; bone < this.bonesNo; bone++) 
	{	// set back to key frame 0
		this.bones[bone].currentRotationKeyFrame = this.bones[bone].currentTranslationKeyFrame = 0;
		// set final matrix to absolute matrix, thus loosing the changes occuring during
		// the animation
		this.bones[bone].final = this.bones[bone].absolute;
	}// end for bones
}

ovnt.Model.prototype.initBuffer = function(gl, buffer, data, itemSize, numItems) 
{
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	buffer.itemSize = itemSize;
	buffer.numItems = numItems;
}

ovnt.Model.prototype.draw = function(frameData)
{
	this.drawArticulatedModel(frameData);
}

// private draw method, draws an articulated figure (one which has bones)
ovnt.Model.prototype.drawArticulatedModel = function(frameData)
{
	var gl = frameData.webgl.gl;

	// draw all the meshes
	for ( var aMesh = 0; aMesh < this.meshNo; aMesh++ )
	{ 
		var thisMesh = this.meshes[aMesh];

		// go through the vertices and translate and rotate them into position
		for (var aVertex = 0; aVertex < thisMesh.virticesNo; aVertex++)
		{
			var thisVertex = thisMesh.vertices[aVertex];
			var thisBone = thisVertex.boneIndex;
			// continue if no bone for vertex
			if (-1 == thisBone){ continue;}

			// translate and rotate the vertex by its bones rotation and transformation							
			mat4.multiplyVec3(this.bones[thisBone].final, thisVertex.originalXYZ, thisVertex.currentXYZ);
		}

		// go through all the triangles
		for ( var tri = 0; tri < thisMesh.trianglesNo; tri++ )
		{	// referance variable for speed and readability
			var thisTri	= thisMesh.triangles[tri]; 
			var triMultipliedByThree = (tri*3);
			// go through three triangle vertices
			for ( var aVertex = 0; aVertex < 3; aVertex++ )
			{	// referance variables for speed and readability
				var vertexRequired	= thisTri.vert[aVertex];
				var thisVertex = thisMesh.vertices[vertexRequired];
				// if their is a bone
				if (-1 != thisVertex.boneIndex)
				{	// referance variable
					var vert = thisMesh.currentVirtices[triMultipliedByThree+aVertex];
					//	get the current vertex (incorporating rotation and translation) from
					//	the vertex structure 
					vec3.set(thisVertex.currentXYZ, vert.vertex);
					thisMesh.currMeshVerts[(tri*9)+(aVertex*3)] = 30.0*thisVertex.currentXYZ[0];
					thisMesh.currMeshVerts[(tri*9)+(aVertex*3)+1] = 30.0*thisVertex.currentXYZ[1];
					thisMesh.currMeshVerts[(tri*9)+(aVertex*3)+2] = 30.0*thisVertex.currentXYZ[2];
						
					//	rotate this vertices normal according to the vertices associated bones final 
					//	matrix (no need to translate as normal has no position) 
					mat4.rotateVec3(this.bones[thisVertex.boneIndex].final, thisTri.normals[aVertex], vert.Normal);
					thisMesh.currMeshNorms[(tri*9)+(aVertex*3)] = thisTri.normals[aVertex][0];
					thisMesh.currMeshNorms[(tri*9)+(aVertex*3)+1] = thisTri.normals[aVertex][1];
					thisMesh.currMeshNorms[(tri*9)+(aVertex*3)+2] = thisTri.normals[aVertex][2];
					
					if (thisMesh.matIndex >= 0 ) // if their is a material for this mesh
					{
						var aMaterial = this.materials[thisMesh.matIndex]; // referance variable (speed and readability)						
						thisMesh.currMeshColors[(tri*12)+(aVertex*4)] = aMaterial.diffuse[0];
						thisMesh.currMeshColors[(tri*12)+(aVertex*4)+1] = aMaterial.diffuse[1];
						thisMesh.currMeshColors[(tri*12)+(aVertex*4)+2] = aMaterial.diffuse[2];
						thisMesh.currMeshColors[(tri*12)+(aVertex*4)+3] = aMaterial.diffuse[3];
					}
				}// end else a bone exists
			} // end for triangle vertices
		} // end for mesh triangles

		this.initBuffer(gl, thisMesh.PositionBuffer, thisMesh.currMeshVerts, 3, thisMesh.trianglesNo*3);
		this.initBuffer(gl, thisMesh.NormalBuffer, thisMesh.currMeshNorms, 3, thisMesh.trianglesNo*3);
		this.initBuffer(gl, thisMesh.ColorBuffer, thisMesh.currMeshColors, 4, thisMesh.trianglesNo*3);
		
		// bind positions
		gl.bindBuffer(gl.ARRAY_BUFFER, thisMesh.PositionBuffer);
		gl.vertexAttribPointer(frameData.webgl.shaderProgram.vertexPositionAttribute, thisMesh.PositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		// bind colors
		gl.bindBuffer(gl.ARRAY_BUFFER, thisMesh.ColorBuffer);
		gl.vertexAttribPointer(frameData.webgl.shaderProgram.vertexColorAttribute, thisMesh.ColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
		// bind texture
		gl.bindBuffer(gl.ARRAY_BUFFER, thisMesh.TexCoordBuffer);
		gl.vertexAttribPointer(frameData.webgl.shaderProgram.textureCoordAttribute, thisMesh.TexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
		// bind normals
		gl.bindBuffer(gl.ARRAY_BUFFER, thisMesh.NormalBuffer);
		gl.vertexAttribPointer(frameData.webgl.shaderProgram.vertexNormalAttribute, thisMesh.NormalBuffer.itemSize, gl.FLOAT, false, 0, 0);	
		
		if (thisMesh.matIndex >= 0 ) // if their is a material for this mesh
		{
			var aMaterial = this.materials[thisMesh.matIndex]; // referance variable (speed and readability)
			if (null != aMaterial.clrTexBnd)
			{
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, aMaterial.clrTexBnd);	
				gl.uniform1i(frameData.webgl.shaderProgram.samplerUniform, 0);
				gl.uniform1i(frameData.webgl.shaderProgram.useTextureUniform, true);
			}
			else
			{
				gl.uniform1i(frameData.webgl.shaderProgram.useTextureUniform, false);
			}
			gl.uniform1i(frameData.webgl.shaderProgram.useLightingUniform, true);
			gl.uniform1i(frameData.webgl.shaderProgram.showSpecularHighlightsUniform, true);
			gl.uniform1f(frameData.webgl.shaderProgram.materialShininessUniform, aMaterial.shinnines);
		}
		else
		{
			gl.uniform1i(frameData.webgl.shaderProgram.useTextureUniform, false);			
			gl.uniform1i(frameData.webgl.shaderProgram.useLightingUniform, false);
			gl.uniform1i(frameData.webgl.shaderProgram.showSpecularHighlightsUniform, false);
			gl.uniform1f(frameData.webgl.shaderProgram.materialShininessUniform, 0);
		}
		// draw	
		gl.drawArrays(gl.TRIANGLES, 0, thisMesh.PositionBuffer.numItems);
	}// end for meshes
} // end CModel::draw()

ovnt.Model.prototype.advanceFrame = function(elapsedTime, frame, frameRate, loop, startingFrame, endingFrame, amtOver)
{
	/*	if ending frame has the default parameter of -1, this means no parameter has been 
		explicitly given, in this case set ending frame to the total frames value of the 
		model */
	endingFrame = (-1 == endingFrame) ? this.totalFrames : endingFrame;

	// set frame to starting frame if it is less than starting frame
	frame = (frame < startingFrame) ? startingFrame : frame;

	/*	if the frame rate is not equal to 0 work out what frame the animation is now upto.
		if the frame rate is zero, no frames would have elapsed (also dividing by zero can 
		cause problems)*/
	if (0 != frameRate)
	{
		var frameTime = 1000.0/frameRate; //work out frame interval (in milliseconds)
		// add on the percentage of a frame which has elapsed 
		frame += elapsedTime/frameTime; 
	}

	// if e.g the frame has reached 30.5 and their are only 30 frames in this animation
	if (frame > endingFrame) // totalFrames) 
	{
		if (loop) // if the animation should loop
		{
			/*	start on the amount by which the ending frame value has been exceeded by
				e.g start on 0.5 if ending frame have been exceeded by 0.5 (30.5-30.0) 
				and startingFrame is 0 */
			frame = startingFrame + (frame-endingFrame);
		}
		else // not looping
		{
			// set the amount by which the end frame has been exceeded
			amtOver = (frame-endingFrame);			
			frame = endingFrame; // stay on last frame
		}
	}// end if total frames have been exceed
/*	
	// rotate and position all the bones
	for (var bone = 0; bone < this.bonesNo; bone++) 
	{
		CVector translation; // keeps the current translation at the current frame time
		CMatrix rotation;	// keeps the current rotation at the current frame time
		
		// if their are position keys 
		if (bones[bone].positionKeysAmt != 0)
		{
			// search for position keys
			int posKeyInterpolatingFrom = -1, posKeyInterpolatingTo = -1;
			//	go through the position keys to find the key interpolating from
			//	and the key interpolating to
		
			for (int posKey = 0; posKey < bones[bone].positionKeysAmt; posKey++)
			{	//	if this is the first key found which is after the current time 
				//	in the animation then this key is being interpolated towards 
				if (bones[bone].posKeyFrames[posKey].time >= frame)
				{
					posKeyInterpolatingTo = posKey; // set key
					break; // break out of for loop
				}
				posKeyInterpolatingFrom = posKey; //	this key is before the current stage in 
													//	the animation.  When the key interpolating
													//	to is found this will be left set as the
													//	key directly previous to the current stage
													//	in the animation
			}// end for posKeys

			//	if both keys have been set (i.e both not equal to -1) their are more than one key frames
			//	in the animation and interpolation between these frames can occur 
			if (posKeyInterpolatingFrom != -1 && posKeyInterpolatingTo != -1)
			{	// referance variables for readability
				keyFrame	&to = bones[bone].posKeyFrames[posKeyInterpolatingTo],
							&from = bones[bone].posKeyFrames[posKeyInterpolatingFrom];
	
				// work out difference in time between frames being interpolated between
				float delta = to.time - from.time;
				//	work out the percentage of the way between the interpolated frames the current 
				// frame is (ends with value between 0 - 1) 
				float perCent = (frame - from.time) / delta;
				// work out the x, y, z translation positions for the current time in the animation
				translation.setX(from.xyz.getX() + (to.xyz.getX() - from.xyz.getX()) * perCent);
				translation.setY(from.xyz.getY() + (to.xyz.getY() - from.xyz.getY()) * perCent);
				translation.setZ(from.xyz.getZ() + (to.xyz.getZ() - from.xyz.getZ()) * perCent);
			}// end if both keys set
			//	if their is only one key frame, the final frame has been passed or the first frame has not
			//	been reached, the animation will not move.  The following two else if 
			//	statements see which key frame has been set (to or from) and the translation
			//	vector is set accordingly
			else if (posKeyInterpolatingFrom == -1) //	if their is only one key frame and it is 
													//	after the current time in the animation (or the first
													//	frame has not been reached) 
			{	// from is not set so to must be
				translation = bones[bone].posKeyFrames[posKeyInterpolatingTo].xyz;
			} // end if to set
			else if (posKeyInterpolatingTo == -1) //	if their is only one frame and it is before 
													//	the current time in the animation (or the final frame 
													//	has been passed)
			{	// to is not set so from must be
				translation = bones[bone].posKeyFrames[posKeyInterpolatingFrom].xyz;
			}// end if from set
		}// enf if their are position keys

		// if their are rotation keys
		if (bones[bone].rotationKeysAmt != 0) 
		{
			// search for rotation keys
			int rotKeyInterpolatingFrom = -1, rotKeyInterpolatingTo = -1;
			// go through the rotation keys to find the key interpolating from
			// and the key interpolating to
			for (int rotKey = 0; rotKey < bones[bone].rotationKeysAmt; rotKey++)
			{	//	if this is the first key found which is after the current time 
				//	in the animation then this key is being interpolated towards
				if (bones[bone].rotKeyFrames[rotKey].time >= frame)
				{
					rotKeyInterpolatingTo = rotKey; // set key
					break; // break out of for loop
				}
				rotKeyInterpolatingFrom = rotKey; //	this key is before the current stage in 
													//	the animation.  When the key interpolating
													//	to is found this will be left set as the
													//	key directly previous to the current stage
													//	in the animation
			}// end for rotKeys
	
			//	if both keys have been set (i.e both not equal to -1) their are more than one key 
			//	frames in the animation and interpolation between these frames can occur
			if (rotKeyInterpolatingFrom != -1 && rotKeyInterpolatingTo != -1)
			{	// referance variables for readability
				keyFrame	&to = bones[bone].rotKeyFrames[rotKeyInterpolatingTo],
							&from = bones[bone].rotKeyFrames[rotKeyInterpolatingFrom];

				// work out difference in time between frames being interpolated between
				float delta = to.time - from.time;
				//	work out the percentage of the way between the interpolated frames the current 
				//	frame is (ends with value between 0 - 1)
				float perCent = (frame - from.time) / delta;
	
				CQuaternion lastQuat, toQuat, finalQuat;
				// make a quaternion representing the 'from' frames rotation
				lastQuat.makeQuaternionFromEularAngles(&from.xyz);
				// make a quaternion representing the 'to' frmaes rotation
				toQuat.makeQuaternionFromEularAngles(&to.xyz);
				// slerp between the 'from' and 'to' quaternions
				finalQuat.quaternionSlerp(&lastQuat, &toQuat, perCent);
				// turn the final quaternion resulting from the slerp to a matrix
				rotation.quaternionToMatrix(&finalQuat);
			}// end if both keys set
	
			else if (rotKeyInterpolatingFrom == -1){ //	if their is only one key frame and it is 
													//	after the current time in the animation
				// from is not set so to must be
				rotation.createXYZRotationMatrix(&bones[bone].rotKeyFrames[rotKeyInterpolatingTo].xyz);}
			else if (rotKeyInterpolatingTo == -1){	//	if their is only one key frame and it is 
													//	before the current time in the animation
				// to is not set so from must be
				rotation.createXYZRotationMatrix(&bones[bone].rotKeyFrames[rotKeyInterpolatingFrom].xyz);}
		}// end if their are rotation keys

		rotation.setMatrixTranslation(&translation);

		CMatrix relativeFinal = bones[bone].relative;
		relativeFinal*=&rotation; // add in the additional rotation and translation
	
		//	the following if statement relies on the assumption that the rotation and 
		//	translation of bones higher in the bone hierarchy will be computed before 
		//	bones lower in the hierarchy.  This is so bones lower in the hierarchy will
		//	be able to multiply in the final matrices of its parent bone, which in turn 
		//	will be an accumulation of its parent bones, which should all be correct for 
		//	the current frame

		if ( bones[bone].parentBone == -1 ){ // no parent
			bones[bone].final = relativeFinal;} // no parent matrix to multiply in
		else{ // this bone has a parent
			// multiply by parents final matrix
			bones[bone].final = bones[bones[bone].parentBone].final;
			//multiply in the relativeFinal matrix
			bones[bone].final*=&relativeFinal;}
	}// for bones
	*/
}