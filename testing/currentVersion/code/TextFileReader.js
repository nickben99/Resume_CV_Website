ovnt.TextFileReader = function() {
	this.currentLine = -1;
}

ovnt.TextFileReader.prototype.currentLineOfFile = function()
{
	return this.lines[this.currentLine];
}	

// get the next line of a text file
ovnt.TextFileReader.prototype.getNextLine = function() {
	// traverse to next line which is not a comment or a blank line (and not end of file)
	this.currentLine++;
	var line = this.lines[this.currentLine];
	//alert( line.length + " ::: " + line.substring(0, 2) );
	while( ( line.length < 2 || line.substring(0, 2) == "//" ) && // not an empty line  containing just a new line character or end of file and not a commented line
		this.currentLine < this.lines.length - 1 ){ // not the end of the file
		this.currentLine++;
		line = this.lines[this.currentLine];
		//alert( line.length + " ::: " + line.substring(0, 2) );
	}
}

// open a text file for reading or writing
ovnt.TextFileReader.prototype.openFile = function(filename)
{
	this.closeFile(); // close file if its attached to an open file
	
	var txtFile = new XMLHttpRequest();
	txtFile.open("GET", filename, false); // false means blocking
	txtFile.send();
	
	var fileFound = 200;
	if (txtFile.status === fileFound) {  // Makes sure it's found the file.
		this.lines = txtFile.responseText.split("\n"); // Will separate each line into an array
		return true; // opened succesfully
	}
	else
	{
		return false; // file not found
	}
}

// get the next line of a text file
ovnt.TextFileReader.prototype.closeFile = function()
{
	if (this.lines) {
		this.lines = null;
	}
	this.currentLine = -1;
}