var timer =document.getElementById("timer");
var timeRemaining =60;
var testPara = document.getElementById("typepara");
var textArea = document.getElementById("textArea");
var startWindow = document.getElementById("startWindow");
var startButton = document.getElementById("startButton");
var newTestWindow = document.getElementById("newTestWindow");
var newtestButton = document.getElementById("newtestButton");
var score = 0;

var calculateScore = function(){
    var paraSubmitted = textArea.value;
    var submittedWorks = paraSubmitted.split(" ");
    var wordCount = submittedWorks.length;

    var testWords = testPara.innerHTML.split(" ");
    console.log(testWords);
    return wordCount;
};