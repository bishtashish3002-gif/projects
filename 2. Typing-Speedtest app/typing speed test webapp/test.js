
var timer = document.getElementById("timer");
var timeRemaining = 60;
var testPara = document.getElementById("testPara");
var textArea = document.getElementById("textArea");
var startWindow = document.getElementById("startWindow");
var startButton = document.getElementById("startButton");
var newTestWindow = document.getElementById("newTestWindow");
var newTestButton = document.getElementById("newTestButton");
var score = 0;


var calculateScore = function() {
	var paraSubmitted = textArea.value;
	var submittedWords = paraSubmitted.split(" ");
	var wordCount = submittedWords.length; 

	var testWords = testPara.innerHTML.split(" ");
	console.log(testWords);

	return wordCount;
};


var generatePassage = function(){
	
	paraContainer.style.display = "inline-block";
	textArea.style.display = "inline-block";
	var passages = [passage1, passage2, passage3, passage4, passage5];
	testPara.innerHTML = passages[Math.floor(Math.random()*10/2)];

};

var displayTime = function () {

	var getTime = setInterval(function() {
		timeRemaining--;
		timer.innerHTML = "Time Remaining: " + timeRemaining + "s"; 

		console.log(timeRemaining);

		if(timeRemaining == 0){

			clearInterval(getTime);
			
			var wrapper = document.getElementById("wrapper");
			wrapper.remove();

			timer.remove();

			document.body.appendChild(newTestWindow);
			document.getElementById("finalScore").innerHTML = "Your speed: " + calculateScore() + " words per minute.";
			newTestWindow.style.display = "block";
		} 
	}, 1000);

	textArea.removeEventListener("keydown", displayTime);
};

var test = function() {
	
	startWindow.style.display = "none";

	timer.innerHTML = "Time Remaining: 60s";
	timer.style.display = "block";

	textArea.addEventListener("keydown", displayTime);

	generatePassage();

};

startButton.addEventListener("click", test);


newTestButton.addEventListener("click", function(){
	window.location.reload();
});

var passage1 = "Life is a journey filled with countless experiences that shape who we are from the moment we open our eyes to the world we begin to learn and grow every day brings new lessons some are joyful while others are challenging but each one teaches us something valuable about ourselves and the world around us as children we are curious and eager to explore we ask questions about everything we see and hear we run through fields play with friends and dream about the future as we grow older responsibilities begin to shape our days we go to school to gain knowledge and skills that will help us in life we meet people from different backgrounds and learn to understand and respect their perspectives sometimes we face difficulties that test our patience and strength but these moments also help us become stronger and wiser life is not always fair and we may not always get what we want but it is important to keep moving forward and never give up on our dreams success does not come overnight it requires hard work dedication and perseverance we must be willing to put in the effort even when the results are not immediate along the way we will encounter people who inspire us and others who may try to bring us down it is up to us to choose which voices we listen to and which paths we follow kindness is a quality that can change the world a simple smile or a helping hand can brighten someones day and create a ripple effect of positivity when we treat others with respect and compassion we build stronger relationships and a better community life is also about balance we must take time to rest and care for our health both physically and mentally we should enjoy the little things like watching a sunset listening to the sound of rain or sharing a meal with loved ones these moments remind us of the beauty that exists in everyday life our goals and ambitions are important but so is the journey toward achieving them we should celebrate small victories and learn from our mistakes because every step forward no matter how small brings us closer to where we want to be in the end life is not measured by the number of years we live but by the moments that take our breath away the love we share the kindness we give and the memories we create are what truly matter so let us live each day with gratitude courage and hope knowing that every sunrise is a new opportunity to grow and make a difference in the world";

var passage2 = "life moves in a way that often feels like a river flowing endlessly carrying with it moments memories and emotions that blend together without clear boundaries sometimes we wake up with the sun shining through the window and the sound of birds filling the air and we feel a sense of peace that is hard to explain other times the clouds gather and the rain falls and we are reminded that not every day will be bright yet even in those moments there is beauty to be found in the way the earth drinks the water and the plants grow stronger we walk through streets filled with people each carrying their own stories and dreams some rushing to work some laughing with friends some lost in thought and we realize that life is a tapestry woven from countless threads each one unique and important in its own way we remember the times we have fallen and the times we have risen again and we understand that both are part of the journey there are days when we feel unstoppable and days when we feel small but in both we are learning and growing we think about the people we have loved and the ones we have lost and we carry them with us in the quiet corners of our hearts we see children playing and we are reminded of the innocence and wonder that once filled our own days we watch the seasons change the leaves turning gold and red before falling to the ground the snow covering the world in a blanket of white the flowers blooming again in spring and we know that change is the only constant we can hold on to we find joy in small things a warm cup of tea a kind word from a stranger the sound of rain on the roof and we realize that happiness is not always in grand moments but in the simple ones we keep moving forward even when the path is unclear trusting that each step will lead us somewhere meaningful we learn to let go of what we cannot control and to embrace what we can we discover that strength is not the absence of fear but the courage to keep going despite it we understand that love is not just a feeling but a choice we make every day to care to listen to be present we see that the world is vast and full of possibilities and that our time here is precious so we try to live fully to be kind to ourselves and to others to forgive to dream to hope and to believe that no matter what happens there is always a reason to keep going and in this endless flow of moments we find that life is not about reaching a destination but about embracing the journey itself";

var passage3 = "My school is a place where I feel safe happy and inspired every single day it is surrounded by tall green trees and a beautiful garden that blooms with colorful flowers in every season the morning starts with the sound of the school bell and the cheerful voices of students rushing to their classes the classrooms are bright and filled with charts drawings and books that make learning exciting my teachers are kind and patient they explain every topic in a way that makes it easy to understand and they always encourage us to ask questions and explore new ideas the library is my favorite place it is full of books on every subject and I love spending time there reading stories and learning about the world the playground is another place where we have so much fun during recess we play games run around and laugh with our friends the school also has a computer lab where we learn about technology and practice our skills in typing coding and creating presentations apart from studies my school organizes many activities like debates quizzes art competitions and sports events these activities help us discover our talents and build confidence we also celebrate festivals and important days with great enthusiasm decorating the school and performing cultural programs my school teaches us not only subjects like mathematics science and languages but also important values like honesty kindness and respect for others our principal is a great leader who motivates us to work hard and be disciplined yet always reminds us to enjoy learning and be creative the staff members are friendly and helpful making sure that the school runs smoothly and that every student feels cared for the canteen serves healthy and tasty food which we enjoy during lunch breaks my friends are like a second family to me we study together share our lunch and support each other in every situation the school also takes us on educational trips to museums historical places and nature parks which makes learning even more interesting we have morning assemblies where we sing the national anthem share news and listen to inspiring thoughts that set a positive tone for the day my school is not just a building with classrooms it is a place where dreams are nurtured and where every student is given the opportunity to grow and shine it is a place where I have learned the value of hard work teamwork and perseverance I feel proud to be a student of my school because it has shaped me";

var passage4 = "My school is a place where I feel safe happy and inspired every single day it is surrounded by tall green trees and a beautiful garden that blooms with colorful flowers in every season the morning starts with the sound of the school bell and the cheerful voices of students rushing to their classes the classrooms are bright and filled with charts drawings and books that make learning exciting my teachers are kind and patient they explain every topic in a way that makes it easy to understand and they always encourage us to ask questions and explore new ideas the library is my favorite place it is full of books friends the school also has a computer lab where we learn about technology and practice our skills in typing coding and creating presentations apart from studies my school organizes many activities like debates quizzes art competitions and sports events these activities help us discover our talents and build confidence we also celebrate festivals and important days with great enthusiasm decorating the school and performing cultural programs my school teaches us not only subjects like mathematics science and languages but also important values like honesty kindness and respect for others our principal is a great leader who motivates us to work hard and be disciplined yet always reminds us to enjoy learning and be creative the staff members are friendly and helpful making sure that the school runs smoothly and that every student feels cared for the canteen serves healthy and tasty food which we enjoy during lunch breaks my friends are like a second family to me we study together share our lunch and support each other in every situation the school also takes us on educational trips to museums historical places and nature parks which makes learning even more interesting we have morning assemblies where we sing the national anthem share news and listen to inspiring thoughts that set a positive tone for the day my school is not just a building with classrooms it is a place where dreams are nurtured and where every student is given the opportunity to grow and shine it is a place where I have learned the value of hard work teamwork and perseverance I feel proud to be a student of my school because it has shaped me into a confident and responsible person I know that the lessons I learn here will guide me throughout my life and I will always cherish the memories of my school days";

var passage5 = "My favourite book is The Alchemist by Paulo Coelho it is a story that has touched my heart in many ways and continues to inspire me every time I read it the book follows the journey of Santiago a young shepherd who dreams of finding a hidden treasure in the Egyptian pyramids his journey is not just about gold or riches but about discovering the meaning of life and understanding his own purpose the way the author describes the deserts the towns and the people Santiago meets makes me feel as if I am travelling alongside him I can almost feel the heat of the sun the cool breeze of the night and the endless stretch of golden sand the book teaches that when you truly desire something the whole universe conspires to help you achieve it this idea fills me with hope and courage whenever I face challenges in my own life Santiago meets many characters along the way each teaching him valuable lessons the crystal merchant teaches him about patience and hard work the Englishman teaches him about the importance of learning and the alchemist himself teaches him about listening to his heart and understanding the language of the world I love how the story blends adventure philosophy and spirituality into one seamless journey it makes me think deeply about my own dreams and whether I am brave enough to follow them the book also shows that the treasure we seek is often not far away but within us and around us in the form of experiences relationships and self discovery the writing style is simple yet powerful making it easy to read but hard to forget every time I finish the book I feel a renewed sense of motivation to pursue my goals no matter how difficult the path may seem I also admire how the story emphasizes the importance of faith and perseverance Santiago faces many obstacles from thieves to harsh weather but he never gives up because he believes in his dream this reminds me that life will always have challenges but if we keep moving forward with determination we can overcome them the Alchemist is more than just a book to me it is a guide a friend and a source of endless inspiration it has taught me to trust my instincts to embrace change and to see every setback as a step toward my destiny";