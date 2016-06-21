mat4.createXYZRotationMatrix = function(x, y, z) {
	var m=new glMatrixArrayType(16);
	
	var cX = Math.cos( x );
	var sX = Math.sin( x );
	var cY = Math.cos( y );
	var sY = Math.sin( y );
	var cZ = Math.cos( z );
	var sZ = Math.sin( z );

	m[0] = ( cY*cZ );
	m[1] = ( cY*sZ );
	m[2] = ( -sY );

	var sXsY = sX*sY;
	var cXsY = cX*sY;

	m[4] = ( sXsY*cZ-cX*sZ );
	m[5] = ( sXsY*sZ+cX*cZ );
	m[6] = ( sX*cY );

	m[8] = ( cXsY*cZ+sX*sZ );
	m[9] = ( cXsY*sZ-sX*cZ );
	m[10] = ( cX*cY );

	return m;
}

// set the translation part of the matrix
mat4.setMatrixTranslation = function(a, v)
{
	a[12] = v[0];
	a[13] = v[1];
	a[14] = v[2];
}

// get the inverse of the matrix
mat4.getInverse = function(a, b)
{
	var inverseMat = mat4.create();

	inverseMat[0] = a[0];
	inverseMat[1] = a[4];
	inverseMat[2] = a[8];
	inverseMat[3] = 0.0;

	inverseMat[4] = a[1];
	inverseMat[5] = a[5];
	inverseMat[6] = a[9];
	inverseMat[7] = 0.0;
	
	inverseMat[8] = a[2];
	inverseMat[9] = a[6];
	inverseMat[10] = a[10];
	inverseMat[11] = 0.0;

	inverseMat[12] = (-a[12]*inverseMat[0]) + (-a[13]*inverseMat[4]) + (-a[14]*inverseMat[8]);
	inverseMat[13] = (-a[12]*inverseMat[1]) + (-a[13]*inverseMat[5]) + (-a[14]*inverseMat[9]);
	inverseMat[14] = (-a[12]*inverseMat[2]) + (-a[13]*inverseMat[6]) + (-a[14]*inverseMat[10]);
	inverseMat[15] = 1.0;
		
	b||(b=a);
	mat4.set(inverseMat, b);
	return b;
}

// multiply vector by the inverse of this matrix
mat4.multiplyVec3InverseMatrix=function(a,b,c)
{
	var inverseMat = mat4.create();
	mat4.getInverse(a, inverseMat);
	return mat4.multiplyVec3(inverseMat, b, c);
}

mat4.rotateVec3=function(a,b,c)
{
	c||(c=b);
	var d=b[0],e=b[1],g=b[2];

	c[0]=a[0]*d+a[4]*e+a[8]*g;
	c[1]=a[1]*d+a[5]*e+a[9]*g;
	c[2]=a[2]*d+a[6]*e+a[10]*g;
	c[3]=a[3]*d+a[7]*e+a[11]*g;
	return c
};

// rotate vector by the inverse of this matrix
mat4.rotateVec3InverseMatrix=function(a,b,c)
{
	var inverseMat = mat4.create();
	mat4.getInverse(a, inverseMat);
	return mat4.rotateVec3(inverseMat, b, c);
}