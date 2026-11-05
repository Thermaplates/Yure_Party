var fso = new ActiveXObject("Scripting.FileSystemObject");
var ForReading = 1, ForWriting = 2;

// Load file
var f = fso.OpenTextFile("plugins.js", ForReading, false, 0); // Read as ASCII/System Default
var raw = f.ReadAll();
f.Close();

var startIdx = raw.indexOf("var $plugins =");
var endIdx = raw.lastIndexOf("]");

if (startIdx === -1 || endIdx === -1) {
    WScript.Echo("Cannot find JSON");
    WScript.Quit(1);
}

var header = raw.substring(0, startIdx);
var jsonPart = raw.substring(startIdx + 14, endIdx + 1);

// We don't have JSON in WSH natively, but we can evaluate it if we modify it properly
// Or we can just use regex to split the array elements and add newlines!
// It's a JSON array of objects: [{"name":...},{"name":...}]
// Let's replace "},{"name":" with "},\r\n{\"name\":\"
var formattedJson = jsonPart.replace(/\},\{"name":/g, "},\r\n{\"name\":");

var out = header + "var $plugins =\r\n" + formattedJson + ";\r\n";

var fw = fso.OpenTextFile("plugins.js", ForWriting, true, 0);
fw.Write(out);
fw.Close();
WScript.Echo("Done");
