var ModelLoader={};

// loads a single model and returns it
ModelLoader.load = function(webgl, filename)
{
	var buffer = "../models/" + filename + ".txt";
	var fileReader = new ovnt.TextFileReader(); // used to read a text file
	
	if (!fileReader.openFile(buffer)){
		return null;} // return null if file could not be opened

	var aModel = new ovnt.Model();

	fileReader.getNextLine(); /*	returns the next line which is not blank or a comment line */
	
	// get total frames			
	aModel.totalFrames = parseInt( fileReader.currentLineOfFile().split(" ")[1] );

	fileReader.getNextLine();
	aModel.currentFrame = parseInt( fileReader.currentLineOfFile().split(" ")[1] ); // get current frame

	fileReader.getNextLine();
	aModel.meshNo = parseInt( fileReader.currentLineOfFile().split(" ")[1] ); // get number of meshes
	
	aModel.meshes = [];
	
	fileReader.getNextLine();

	var tempMostRemoteVirtex = vec3.create(); // keeps track of most remote virtex for sphere radius
	var tempBoundingBoxMostRemoteVertex = vec3.create(); // keeps track of the most remote x, y, z measurements for the model bounding box
	
	// go through all the meshes and set up parameters
	for (var mesh = 0; mesh < aModel.meshNo; mesh++)
	{
		aModel.meshes[aModel.meshes.length] = {};
		
		// get this meshes name, flags and material index.
		var values = fileReader.currentLineOfFile().split(" ");
		aModel.meshes[mesh].name = values[0].substring(1, values[0].length-1);
		aModel.meshes[mesh].flags = parseInt(values[1]);
		aModel.meshes[mesh].matIndex = parseInt(values[2]);
		//ovnt.myLog(aModel.meshes[mesh].name + " - " + aModel.meshes[mesh].flags + " - " + aModel.meshes[mesh].matIndex);
		
		fileReader.getNextLine();
		aModel.meshes[mesh].virticesNo = parseInt(fileReader.currentLineOfFile());
		
		//ovnt.myLog("(" + aModel.meshes[mesh].virticesNo + ")");
		
		aModel.meshes[mesh].vertices = [];
		fileReader.getNextLine();
		
		// get all the vertices for this mesh
		for (var vertex = 0; vertex < aModel.meshes[mesh].virticesNo; vertex++)
		{
			aModel.meshes[mesh].vertices[ aModel.meshes[mesh].vertices.length ] = {};
			
			var values = fileReader.currentLineOfFile().split(" ");
			aModel.meshes[mesh].vertices[vertex].flags = parseInt(values[0]);
			aModel.meshes[mesh].vertices[vertex].originalXYZ = vec3.create();
			aModel.meshes[mesh].vertices[vertex].currentXYZ = vec3.create();
			aModel.meshes[mesh].vertices[vertex].originalXYZ[0] = parseFloat(values[1]);
			aModel.meshes[mesh].vertices[vertex].originalXYZ[1] = parseFloat(values[2]); 
			aModel.meshes[mesh].vertices[vertex].originalXYZ[2] = parseFloat(values[3]);
			aModel.meshes[mesh].vertices[vertex].u = parseFloat(values[4]);
			aModel.meshes[mesh].vertices[vertex].v = parseFloat(values[5]);
			aModel.meshes[mesh].vertices[vertex].boneIndex = parseInt(values[6]);
			
			//ovnt.myLog(aModel.meshes[mesh].vertices[vertex].flags + " " + vec3.str(aModel.meshes[mesh].vertices[vertex].originalXYZ) + " " +
			//			aModel.meshes[mesh].vertices[vertex].u + " " + aModel.meshes[mesh].vertices[vertex].v + " " +
			//			aModel.meshes[mesh].vertices[vertex].boneIndex);

			fileReader.getNextLine();

			/*	set current to original xyz vertices (the original xyz vertices are inversely rotated (in setUpBones below) by their associated bone if they have one, the 
				current xyz is then updated at each frame of the programme.  If the vertex has no bone, current and original xyz will always stay the same */
			vec3.set(aModel.meshes[mesh].vertices[vertex].originalXYZ, aModel.meshes[mesh].vertices[vertex].currentXYZ);

			//	keep track of which virtex is the most remote in order to find the radius of the models bounding sphere
			if ( vec3.length(aModel.meshes[mesh].vertices[vertex].originalXYZ) > vec3.length(tempMostRemoteVirtex) ){
				vec3.set(aModel.meshes[mesh].vertices[vertex].originalXYZ, tempMostRemoteVirtex);}

			// find the models bounding box
			var tempPositive = vec3.create();
			vec3.set(aModel.meshes[mesh].vertices[vertex].originalXYZ, tempPositive);
			vec3.makeVectorPositive(tempPositive);
			if (tempPositive[0] > tempBoundingBoxMostRemoteVertex[0]){ 
				tempBoundingBoxMostRemoteVertex[0] = tempPositive[0];}
			if (tempPositive[1] > tempBoundingBoxMostRemoteVertex[1]){ 
				tempBoundingBoxMostRemoteVertex[1] = tempPositive[1];}
			if (tempPositive[2] > tempBoundingBoxMostRemoteVertex[2]){ 
				tempBoundingBoxMostRemoteVertex[2] = tempPositive[2];}
		}
		
		aModel.meshes[mesh].normalsNo = parseInt(fileReader.currentLineOfFile());
		//ovnt.myLog("latest num   " + aModel.meshes[mesh].normalsNo);
		
		// allocate memory for this meshes normal vectors
		aModel.meshes[mesh].normals = [];		
		fileReader.getNextLine();
		
		// get all the normals
		for (var normal = 0; normal < aModel.meshes[mesh].normalsNo; normal++)
		{
			aModel.meshes[mesh].normals[ aModel.meshes[mesh].normals.length ] = vec3.create();
			
			var values = fileReader.currentLineOfFile().split(" ");
			aModel.meshes[mesh].normals[normal][0] = parseFloat(values[0]);
			aModel.meshes[mesh].normals[normal][1] = parseFloat(values[1]);
			aModel.meshes[mesh].normals[normal][2] = parseFloat(values[2]);
			
			//ovnt.myLog("latest " + vec3.str(aModel.meshes[mesh].normals[normal]));

			fileReader.getNextLine();
		}

		// set triangle no
		aModel.meshes[mesh].trianglesNo = parseInt(fileReader.currentLineOfFile());

		// allocate memory for the triangles
		aModel.meshes[mesh].triangles = [];

		// allocate memory for the currentVirtices
		aModel.meshes[mesh].currentVirtices = [];
		
		aModel.meshes[mesh].PositionBuffer = webgl.gl.createBuffer(); ////// new
		aModel.meshes[mesh].currMeshVerts = []; /////new
		
		aModel.meshes[mesh].ColorBuffer = webgl.gl.createBuffer(); ////// new
		aModel.meshes[mesh].currMeshColors = []; //// new
		
		aModel.meshes[mesh].TexCoordBuffer = webgl.gl.createBuffer(); ///// new
		aModel.meshes[mesh].currMeshTexCoords = []; //// new
		
		fileReader.getNextLine();
		
		// get all the triangles
		for (var triangle = 0; triangle < aModel.meshes[mesh].trianglesNo; triangle++)
		{
			aModel.meshes[mesh].triangles[ aModel.meshes[mesh].triangles.length ] = {};
			var values = fileReader.currentLineOfFile().split(" ");
			aModel.meshes[mesh].triangles[triangle].flags = parseInt(values[0]);
			aModel.meshes[mesh].triangles[triangle].vert = []; 
			aModel.meshes[mesh].triangles[triangle].vert[0] = parseInt(values[1]); 
			aModel.meshes[mesh].triangles[triangle].vert[1] = parseInt(values[2]); 
			aModel.meshes[mesh].triangles[triangle].vert[2] = parseInt(values[3]);
			aModel.meshes[mesh].triangles[triangle].norm = [];			
			aModel.meshes[mesh].triangles[triangle].norm[0] = parseInt(values[4]); 
			aModel.meshes[mesh].triangles[triangle].norm[1] = parseInt(values[5]); 
			aModel.meshes[mesh].triangles[triangle].norm[2] = parseInt(values[6]);
			aModel.meshes[mesh].triangles[triangle].smoothinggroup = parseInt(values[7]);
			
			//ovnt.myLog("latest " + aModel.meshes[mesh].triangles[triangle].flags + " " +			
			//						aModel.meshes[mesh].triangles[triangle].vert[0] + " " +
			//						aModel.meshes[mesh].triangles[triangle].vert[1] + " " +
			//						aModel.meshes[mesh].triangles[triangle].vert[2] + " " +
			//						aModel.meshes[mesh].triangles[triangle].norm[0] + " " +
			//						aModel.meshes[mesh].triangles[triangle].norm[1] + " " +
			//						aModel.meshes[mesh].triangles[triangle].norm[2] + " " +
			//						aModel.meshes[mesh].triangles[triangle].smoothinggroup);
						
			fileReader.getNextLine();

			aModel.meshes[mesh].triangles[triangle].currentVertices = [];
			// initialise the current triangle vertex values
			for (var verts = 0; verts < 3; verts++)
			{
				aModel.meshes[mesh].triangles[triangle].currentVertices[verts] = vec3.create();
				vec3.set(aModel.meshes[mesh].vertices[aModel.meshes[mesh].triangles[triangle].vert[verts]].originalXYZ, 
						aModel.meshes[mesh].triangles[triangle].currentVertices[verts]);

				// fill in each vertex structure
				aModel.meshes[mesh].currentVirtices[(triangle*3)+verts] = {};
				aModel.meshes[mesh].currentVirtices[(triangle*3)+verts].vertex = vec3.create();
				 
				vec3.set(aModel.meshes[mesh].vertices[aModel.meshes[mesh].triangles[triangle].vert[verts]].originalXYZ, 
						aModel.meshes[mesh].currentVirtices[(triangle*3)+verts].vertex);
		
				aModel.meshes[mesh].currMeshVerts[(triangle*9)+(3*verts)] = aModel.meshes[mesh].vertices[aModel.meshes[mesh].triangles[triangle].vert[verts]].originalXYZ[0];
				aModel.meshes[mesh].currMeshVerts[(triangle*9)+(3*verts)+1] = aModel.meshes[mesh].vertices[aModel.meshes[mesh].triangles[triangle].vert[verts]].originalXYZ[1];
				aModel.meshes[mesh].currMeshVerts[(triangle*9)+(3*verts)+2] = aModel.meshes[mesh].vertices[aModel.meshes[mesh].triangles[triangle].vert[verts]].originalXYZ[2];
				
				aModel.meshes[mesh].currMeshColors[(triangle*12)+(4*verts)] = 1.0;
				aModel.meshes[mesh].currMeshColors[(triangle*12)+(4*verts)+1] = 1.0;
				aModel.meshes[mesh].currMeshColors[(triangle*12)+(4*verts)+2] = 1.0;
				aModel.meshes[mesh].currMeshColors[(triangle*12)+(4*verts)+3] = 1.0;				

				aModel.meshes[mesh].currentVirtices[(triangle*3)+verts].u = 
					aModel.meshes[mesh].vertices[aModel.meshes[mesh].triangles[triangle].vert[verts]].u;
				
				aModel.meshes[mesh].currentVirtices[(triangle*3)+verts].v = 
					aModel.meshes[mesh].vertices[aModel.meshes[mesh].triangles[triangle].vert[verts]].v;
					
				aModel.meshes[mesh].currMeshTexCoords[(triangle*6)+(2*verts)] = aModel.meshes[mesh].vertices[aModel.meshes[mesh].triangles[triangle].vert[verts]].u;
				aModel.meshes[mesh].currMeshTexCoords[(triangle*6)+(2*verts)+1] = aModel.meshes[mesh].vertices[aModel.meshes[mesh].triangles[triangle].vert[verts]].v;
			}
			
			aModel.initBuffer(webgl.gl, aModel.meshes[mesh].TexCoordBuffer, aModel.meshes[mesh].currMeshTexCoords, 2, aModel.meshes[mesh].trianglesNo*3);

			aModel.meshes[mesh].triangles[triangle].normals = [];
			aModel.meshes[mesh].triangles[triangle].currentNormals = [];
			
			aModel.meshes[mesh].NormalBuffer = webgl.gl.createBuffer(); // new
			aModel.meshes[mesh].currMeshNorms = []; ///// new
		
			// fill in normals and currentNormals in CVectors in triangle structure
			for (var norms = 0; norms < 3; norms++)
			{
				aModel.meshes[mesh].triangles[triangle].normals[norms] = vec3.create(); 
				vec3.set(aModel.meshes[mesh].normals[aModel.meshes[mesh].triangles[triangle].norm[norms]], 
							aModel.meshes[mesh].triangles[triangle].normals[norms]);

				aModel.meshes[mesh].triangles[triangle].currentNormals[norms] = vec3.create();
				vec3.set(aModel.meshes[mesh].triangles[triangle].normals[norms], 
						aModel.meshes[mesh].triangles[triangle].currentNormals[norms]);

				// fill in each vertex structure
				aModel.meshes[mesh].currentVirtices[(triangle*3)+norms].Normal = vec3.create();
				vec3.set(aModel.meshes[mesh].triangles[triangle].normals[norms], 
						aModel.meshes[mesh].currentVirtices[(triangle*3)+norms].Normal);
						
				aModel.meshes[mesh].currMeshNorms[(triangle*9)+(3*norms)] = aModel.meshes[mesh].triangles[triangle].normals[norms][0];
				aModel.meshes[mesh].currMeshNorms[(triangle*9)+(3*norms)+1] = aModel.meshes[mesh].triangles[triangle].normals[norms][1];
				aModel.meshes[mesh].currMeshNorms[(triangle*9)+(3*norms)+2] = aModel.meshes[mesh].triangles[triangle].normals[norms][2];
			} // end for normals
		}// end for triangles
		
		ovnt.myLog(aModel.meshes[mesh].currMeshTexCoords.length + ", " + aModel.meshes[mesh].trianglesNo*3 + ", " + aModel.meshes[mesh].TexCoordBuffer.numItems);	
	} // end for all the meshes			
		
	// set models bounding sphere and rectangle
	aModel.boundingSphereRadUnAnimated = vec3.length(tempMostRemoteVirtex);
	aModel.boundingRectangleUnAnimated = vec3.create();
	vec3.scale(tempBoundingBoxMostRemoteVertex, 2.0, aModel.boundingRectangleUnAnimated);
	
	// set material number
	aModel.materialNo = parseInt(fileReader.currentLineOfFile().split(" ")[1]);
	//ovnt.myLog("fileReader.currentLineOfFile(): " + fileReader.currentLineOfFile());
	//ovnt.myLog("aModel.materialNo: " + aModel.materialNo);
	if (aModel.materialNo > 0) // alloc memory for the materials
	{
		aModel.materials = [];
	} 

	fileReader.getNextLine();
	
	var stripQuotationMarksPattern=new RegExp("\"([^\"]*)");
	// get all the materials
	for (var material = 0; material < aModel.materialNo; material++)
	{ 
		aModel.materials[material] = {}
		// get material name							
		//ovnt.myLog("fileReader.currentLineOfFile(): " + fileReader.currentLineOfFile());
		aModel.materials[material].name = stripQuotationMarksPattern.exec(fileReader.currentLineOfFile())[1];
		//ovnt.myLog("latest ... " + aModel.materials[material].name);
		fileReader.getNextLine();

		//get ambient values
		var values = fileReader.currentLineOfFile().split(" "); 
		aModel.materials[material].ambient = [];
		aModel.materials[material].ambient[0] = parseFloat(values[0]);
		aModel.materials[material].ambient[1] = parseFloat(values[1]);
		aModel.materials[material].ambient[2] = parseFloat(values[2]);
		aModel.materials[material].ambient[3] = parseFloat(values[3]);
		fileReader.getNextLine();
		
		//ovnt.myLog("latest ... " + aModel.materials[material].ambient[0] + " " +
		//							aModel.materials[material].ambient[1] + " " +
		//							aModel.materials[material].ambient[2] + " " +
		//							aModel.materials[material].ambient[3]);
		
		//get diffuse values
		values = fileReader.currentLineOfFile().split(" ");
		aModel.materials[material].diffuse = [];
		aModel.materials[material].diffuse[0] = parseFloat(values[0]);
		aModel.materials[material].diffuse[1] = parseFloat(values[1]);
		aModel.materials[material].diffuse[2] = parseFloat(values[2]);
		aModel.materials[material].diffuse[3] = parseFloat(values[3]);
		fileReader.getNextLine();
		
		//ovnt.myLog("latest ... " + aModel.materials[material].diffuse[0] + " " +
		//							aModel.materials[material].diffuse[1] + " " +
		//							aModel.materials[material].diffuse[2] + " " +
		//							aModel.materials[material].diffuse[3]);		
		
		//get specular values
		values = fileReader.currentLineOfFile().split(" ");
		aModel.materials[material].specular = [];
		aModel.materials[material].specular[0] = parseFloat(values[0]);
		aModel.materials[material].specular[1] = parseFloat(values[1]);
		aModel.materials[material].specular[2] = parseFloat(values[2]);
		aModel.materials[material].specular[3] = parseFloat(values[3]);
		fileReader.getNextLine();		
		
		//ovnt.myLog("latest ... " + aModel.materials[material].specular[0] + " " +
		//							aModel.materials[material].specular[1] + " " +
		//							aModel.materials[material].specular[2] + " " +
		//							aModel.materials[material].specular[3]);			

		//get emissive values
		values = fileReader.currentLineOfFile().split(" ");
		aModel.materials[material].emissive = [];
		aModel.materials[material].emissive[0] = parseFloat(values[0]);
		aModel.materials[material].emissive[1] = parseFloat(values[1]);
		aModel.materials[material].emissive[2] = parseFloat(values[2]);
		aModel.materials[material].emissive[3] = parseFloat(values[3]);
		fileReader.getNextLine();		
		
		//ovnt.myLog("latest ... " + aModel.materials[material].emissive[0] + " " +
		//							aModel.materials[material].emissive[1] + " " +
		//							aModel.materials[material].emissive[2] + " " +
		//							aModel.materials[material].emissive[3]);			

		// get shinniness value
		aModel.materials[material].shinnines = parseFloat(fileReader.currentLineOfFile());
		fileReader.getNextLine();		
		//ovnt.myLog("latest ... " + aModel.materials[material].shinnines);			
		
		// get transparency value
		aModel.materials[material].transparency = parseFloat(fileReader.currentLineOfFile());
		fileReader.getNextLine();
		//ovnt.myLog("latest ... " + aModel.materials[material].transparency);			

		// if the transparency value is less than 1.0, the model will be at least partially transparent
		if (aModel.materials[material].transparency < 1.0){
			aModel.transparency = true;} // model is partially transparent
												
		aModel.materials[material].clrMapTex = stripQuotationMarksPattern.exec(fileReader.currentLineOfFile())[1];
		var backSlashPattern = new RegExp("\\\\"); // matches a single backslash
		if ( backSlashPattern.test(aModel.materials[material].clrMapTex) ) // is there a backslash
		{
			var subStrings = aModel.materials[material].clrMapTex.split("\\");
			aModel.materials[material].clrMapTex = subStrings[subStrings.length-1];
		}																
		fileReader.getNextLine();
		//ovnt.myLog("latest ... " + aModel.materials[material].clrMapTex);			

		// get alpha map texture
		aModel.materials[material].alphaMapTex = stripQuotationMarksPattern.exec(fileReader.currentLineOfFile())[1];		
		fileReader.getNextLine();				
	} // end for all materials
	
	if (!this.reloadTextures(aModel)){ // if all the textures did not load succesfully
		return null;} // delete model and return false
	
	// set the number of bones
	values = fileReader.currentLineOfFile().split(" ");
	aModel.bonesNo = parseInt(values[1]);
						
	if (aModel.bonesNo > 0) // allocate memory for bone structs
	{
		aModel.bones = [];
	}
	//ovnt.myLog("latest ... " + aModel.bonesNo);	
	
	fileReader.getNextLine();
	
	// go through all the bones
	for (var bone = 0; bone < aModel.bonesNo; bone++)
	{
		aModel.bones[bone] = {}
		// get bone name
		aModel.bones[bone].name = stripQuotationMarksPattern.exec(fileReader.currentLineOfFile())[1];								
		//ovnt.myLog("latest ... " + aModel.bones[bone].name);					
		fileReader.getNextLine();

		// get parent name, initially set to null
		aModel.bones[bone].parentName = stripQuotationMarksPattern.exec(fileReader.currentLineOfFile())[1];
		fileReader.getNextLine();
		
		// get bone information
		values = fileReader.currentLineOfFile().split(" ");
		aModel.bones[bone].posXYZ = vec3.create();
		aModel.bones[bone].flags = parseInt(values[0]);
		aModel.bones[bone].posXYZ[0] = parseFloat(values[1]);
		aModel.bones[bone].posXYZ[1] = parseFloat(values[2]);
		aModel.bones[bone].posXYZ[2] = parseFloat(values[3]);
		aModel.bones[bone].rotXYZ = vec3.create();
		aModel.bones[bone].rotXYZ[0] = parseFloat(values[4]);
		aModel.bones[bone].rotXYZ[1] = parseFloat(values[5]);
		aModel.bones[bone].rotXYZ[2] = parseFloat(values[6]);

		fileReader.getNextLine();
		// get number of position keys
		aModel.bones[bone].positionKeysAmt = parseInt(fileReader.currentLineOfFile());
		if (aModel.bones[bone].positionKeysAmt > 0)
		{	
			aModel.bones[bone].posKeyFrames = [];
		}

		fileReader.getNextLine();
		// get all the position keys
		for (var posKey = 0; posKey < aModel.bones[bone].positionKeysAmt; posKey++)
		{
			aModel.bones[bone].posKeyFrames[posKey] = {};
			
			values = fileReader.currentLineOfFile().split(" ");
			aModel.bones[bone].posKeyFrames[posKey].time = parseFloat(values[0]);
			aModel.bones[bone].posKeyFrames[posKey].xyz = vec3.create();
			aModel.bones[bone].posKeyFrames[posKey].xyz[0] = parseFloat(values[1]);
			aModel.bones[bone].posKeyFrames[posKey].xyz[1] = parseFloat(values[2]);
			aModel.bones[bone].posKeyFrames[posKey].xyz[2] = parseFloat(values[3]);

			fileReader.getNextLine();
		}

		// get number of rotation keys
		aModel.bones[bone].rotationKeysAmt = parseInt(fileReader.currentLineOfFile());
		// allocate memory for the rotation keys
		if (aModel.bones[bone].rotationKeysAmt > 0)
		{		
			aModel.bones[bone].rotKeyFrames = [];
		}

		fileReader.getNextLine();

		// get all the rotation keys
		for (var rotKey = 0; rotKey < aModel.bones[bone].rotationKeysAmt; rotKey++)
		{
			aModel.bones[bone].rotKeyFrames[rotKey] = {};
			
			values = fileReader.currentLineOfFile().split(" ");
			aModel.bones[bone].rotKeyFrames[rotKey].time = parseFloat(values[0]);
			aModel.bones[bone].rotKeyFrames[rotKey].xyz = vec3.create();
			aModel.bones[bone].rotKeyFrames[rotKey].xyz[0] = parseFloat(values[1]);
			aModel.bones[bone].rotKeyFrames[rotKey].xyz[1] = parseFloat(values[2]);
			aModel.bones[bone].rotKeyFrames[rotKey].xyz[2] = parseFloat(values[3]);

			fileReader.getNextLine();
		}
	}// end for bones
	
	// go through all the bones to set up parent child relationships
	for (var bone = 0; bone < aModel.bonesNo; bone++)
	{
		aModel.bones[bone].parentBone = -1; // initially -1 (this will be updated unless this is the parent bone) 
		if (aModel.bones[bone].parentName.length > 0) // if this bone holds a parent name
		{	// go through all the bones looking for this bones parent bone
			for (var i = 0; i < aModel.bonesNo; i++ )
			{	// compare this bones name with the parent bone name being sought
				if (aModel.bones[i].name == aModel.bones[bone].parentName)
				{
					aModel.bones[bone].parentBone = i; // set the index as this is the parent bone
					break; // parent found so break out of for loop
				}
			}
			if (-1 == aModel.bones[bone].parentBone){ /*	this bone has a parent name which
															cannot be found, therefore return 
															false */
				return null;}
		}
	}// end for bones (setting up parent child relationships)
		
	this.setUpBones(aModel);

	// create the models display list if required
	aModel.createDisplayList();

	fileReader.closeFile();
	
    return aModel;
}

ModelLoader.setUpBones = function(model)
{	// go through all the bones
	for (var bone = 0; bone < model.bonesNo; bone++ ) 
	{	// set initial rotation and translation for the relative bone matrix
		model.bones[bone].relative = mat4.createXYZRotationMatrix(model.bones[bone].rotXYZ[0], model.bones[bone].rotXYZ[1], model.bones[bone].rotXYZ[2]);
		mat4.setMatrixTranslation(model.bones[bone].relative, model.bones[bone].posXYZ);

		model.bones[bone].absolute = mat4.create();
		if (-1 != model.bones[bone].parentBone) // if the bone has a parent bone
		{	// set the absolute matrix to the parents absolute matrix		
			mat4.set(model.bones[model.bones[bone].parentBone].absolute, model.bones[bone].absolute);
			/*	multiply bone absolute matrix by bone relative matrix
				i.e multiply the parents absolute matrix by this bones relative matrix
				to get this bones absolute matrix */
			mat4.multiply(model.bones[bone].absolute, model.bones[bone].relative); 
		}
		else{ /*	this bone has no parent therefore the bones relative and absolute matrices
					will be the same.  This is the root bone and its matrices define the bones
					offset in terms of position and rotation from the identity matrix */									
			mat4.set(model.bones[bone].relative, model.bones[bone].absolute);						
		}
	}// end for bones 

	// go through the meshes and move all the vertices and normals into position
	for (var mesh = 0; mesh < model.meshNo; mesh++)
	{	// go through this mesh's vertices
		for (var vertex = 0; vertex < model.meshes[mesh].virticesNo; vertex++) 
		{	// if this vertex has an associated bone
			var joint = model.meshes[mesh].vertices[vertex].boneIndex
			if (joint != -1) 
			{	// referance variable used for readability
				var m = model.bones[joint].absolute;
				
				// inversely rotate and translate the virtex
				mat4.multiplyVec3InverseMatrix(m, model.meshes[mesh].vertices[vertex].originalXYZ);
			}// end if bone
		}// end for vertices

		// go through the meshes triangles
		for (var triangles = 0; triangles < model.meshes[mesh].trianglesNo; triangles++ ) 
		{	// referance variable for readability
			var aTriangle = model.meshes[mesh].triangles[triangles];
			// go through triangle vertices
			for (var j = 0; j < 3; j++) 
			{	// get the bone index of the first triangle vertex
				var theBone = model.meshes[mesh].vertices[aTriangle.vert[j]].boneIndex;
				// if this vertex has an associated bone
				if (theBone != -1) 
				{	// referance variable for readability
					var m = model.bones[theBone].absolute;
					// rotate the normal by the absolute matrix of the normals associated
					// vertices associated bone
					mat4.rotateVec3InverseMatrix(m, aTriangle.normals[j]);
				}// end if bone
			}// end for triangle vertices
		}// end for triangles
	}// end for mesh's
	model.restart();
}// end setUpBones

// load model textures
ModelLoader.reloadTextures = function(thisModel)
{
	for (var material = 0; material < thisModel.materialNo; material++ )
	{
		var filename = "../models/modeltextures/";
		if ( thisModel.materials[material].clrMapTex.length > 0)
		{ // if theirs a texture
			thisModel.materials[material].clrTexBnd = // bind the texture
				ovnt.texLoad.TextureLoad(filename + thisModel.materials[material].clrMapTex); 

			if (null == thisModel.materials[material].clrTexBnd){ // if the texture did not load properly
				return false;} // loading error
		}
		else{ // no colour map diffuse texture
			thisModel.materials[material].clrTexBnd = null;}
	}// end for materials

	return true; // everything loaded ok
}

// up to writing TextureLoad function in texture.js