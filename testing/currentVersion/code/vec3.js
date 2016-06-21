vec3.makeVectorPositive = function(a, b) {
	b||(b=a); // if we have no b, we make a positive
	
	b[0] = Math.abs(a[0])
	b[1] = Math.abs(a[1])
	b[2] = Math.abs(a[2])
}