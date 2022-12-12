////////// AWS Code ///////////////////////////////////

const DATA_BUCKET = "task-data-sav";
const DIRECTORY = "ryanyan-daw2011-replication-project-psych251"; // -> Check this!

function saveDataToS3() {

  id = Global.ID
  csv = jsPsych.data.dataAsCSV()

  // Initialize the Amazon Cognito credentials provider
  AWS.config.region = 'us-west-2'; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-west-2:e45fff22-73bb-4fad-89e1-e26705840bfa',
});

 const filename = `${DIRECTORY}/${id}.csv`;

 const bucket = new AWS.S3({
    params: { Bucket: DATA_BUCKET },
    apiVersion: "2012-10-17",
  })

 const objParams = {
    Key: filename,
    Body: csv
  }

 bucket.putObject(objParams, function(err, data) {
    if (err) {
      console.log("Error: ", err.message);
    } else {
      console.log("Data: ", data);
    }
  });
}

var welcome = function(){
	var instructions = [
		"<div align=center> <h1 font-size: 24px;> Welcome! <br> You will play a game and then fill out a survey, which takes around 15 minutes in total.</h1><br><br>Please read all following instructions for the game very carefully. <br> You can use the buttons below or use the <b>F</b> and <b>J</b> keys to navigate through the introduction.",
		 "<div align=center> In this study, you will see some Tibetan characters on a colored background, and you have to make a choice between them. <br> If the character you choose is 'good', you will get a coin. </div>",
		 "<div align=center> Each trial has two stages. First, you will see two of them on each screen, shown here in pink. <br> You need to use the <b>F</b> and <b>J</b> keys on your keyboard to select one of them. </br>\
		 <div align=center style='width:800px;height:400px;'> <div style='float: left;'><img src='img/prac_stage1_stim_1.png'></img><p><strong>Press the F key</strong></p></div><div style='float: right;'><img src='img/prac_stage1_stim_2.png'></img><p><strong>Press the J key</strong></p></div></div>",
		 "<div align=center> Second, after the choice, another two characters will appear on the screen. <br> There are two different possible sets, one set in brown and the other set in yellow. <br> \
		 Both sets may appear after you made your choice, but <b> choosing one pink character is more likely to lead you to one set, <br> and choosing the other pink character is more likely to lead you to another set. </b> <br> This probability that choosing one character leads to a certain colored set is fixed throughout the game. <br> <div align=center><img src='img/demo_stage2sets.png'></img></div></div>",
		 		 "<div align=center> After the second choice, you will either get a coin or nothing. <br> <b> How likely you get a coin depends on how 'good' the second-stage character is. </b> <div align=center> <img src='img/dollar.png'> </img> <br> </div> </div>",
			"<div>Let's see an example now!</div>",
			"<div align=center> On the first stage, you saw these two characters. You decided to choose the left one. </br>\
 		 <div align=center style='width:800px;height:400px;'> <div style='float: left;'><img src='img/prac_stage1_stim_1.png'></img><p><strong>You chose this one</strong></p></div><div style='float: right;'><img src='img/prac_stage1_stim_2.png'></img><p><strong></strong></p></div></div>",
		 "<div align=center> A red square will appear on the character you have chosen. </br>\
			<div align=center style='width:800px;height:400px;'> <div style='float: left;'><img src='img/demo_chosen_first_stage.png'></img></div><div style='float: right'><img src='img/prac_stage1_stim_2.png'></img></div></div>",
		 "<div align=center> On this particular trial, your first-stage choice have led you to the yellow set. <br> Again, you need to use F and J keys to select one of them. <div align=center> <img src='img/prac_stage1_stim_1_deact.png'></img></div>\
		 <div align=center style='width:800px;height:400px;'> <div style='float: left;'><img src='img/yellow_stim_1.png'></img><p><strong>Press the F key</strong></p></div>\
		 <div style='float: right;'><img src='img/yellow_stim_2.png'></img><p><strong>Press the J key</strong></p></div></div>",
		 "<div align=center> This time, you chose the character on the right. <div align=center> <img src='img/prac_stage1_stim_1_deact.png'></img></div>\
		 <div align=center style='width:800px;height:400px;'> <div style='float: left;'><img src='img/yellow_stim_1.png'></img></div>\
		 <div style='float: right;'><img src='img/demo_chosen_second_stage.png'></img><p><strong>You chose this one</strong></p></div></div>",
		 "<div>Awesome! You earned a coin from choosing this character. <br> <img src='img/yellow_stim_1_deact.png'></img> <br> <img src='img/dollar.png'></img> </div>",
	 		"<div> <b>The probability that choosing a character earns you money may change over time.</b> <br> Pay attention to the task to earn as much money as possible! </div>"];
	return instructions
};


var practice_intro = function(){
	var instructions = ["<div align=center>Now you will do some practice using the characters you just saw. </div>"];
	return instructions
};

var formal_intro = function(){
	var instructions = ["<div align=center>Great, you've finished all practice phases. <br>In the real game, you will see some new characters, but the rules will be the same.<br> Let's review everything we've learned and then begin playing.<br>\
	<br>Remember, one of the first-stage character is more likely to lead you to one colored set, and the other character to the other colored set. This probability is fixed. <br> you want to earn as many coins as you can by finding out which second-stage characters are 'good'. <br> The chance that choosing a character will earn you money changes slowly over time, <br> so you need to concentrate and be flexible to keep track of which characters are good right now.</div>",
	"<div align=center>You will get a bonus payment of 0.01 dollar for every coin you earn. <br>The game lasts for 201 trials and you will have two seconds for each choice, and that takes most people about 15 minutes.<br> Good luck!</div>"];
	return instructions
}

function createMemberInNormalDistribution(mean,std_dev){
	return mean + (gaussRandom()*std_dev);
}


function gaussRandom() {
	var u = Math.random(); //0 ~ 1
	var v = Math.random(); //0 ~ 1
	if(u == 0 || v == 0) return gaussRandom();

	var x = Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v); //gaussian distribution from -1 to 1

	return x;

	/* todo: optimize this algorithm by caching (v*c)
	* and returning next time gaussRandom() is called.
	* left out for simplicity */
}

function shuffle(o){
	o = jsPsych.randomization.repeat(o, 1);
	return o;
}

var images = [
'img/prac_stage1_stim_1.png',
'img/prac_stage1_stim_2.png',
'img/prac_stage1_stim_1_deact.png',
'img/prac_stage1_stim_2_deact.png',
'img/brown_stim_1.png',
'img/brown_stim_1_deact.png',
'img/brown_stim_2.png',
'img/brown_stim_2_deact.png',
'img/yellow_stim_1.png',
'img/yellow_stim_1_deact.png',
'img/yellow_stim_2.png',
'img/yellow_stim_2_deact.png',
'img/stage1_stim_1.png',
'img/stage1_stim_2.png',
'img/stage1_stim_1_deact.png',
'img/stage1_stim_2_deact.png',
'img/pink_stim_1.png',
'img/pink_stim_1_deact.png',
'img/pink_stim_2.png',
'img/pink_stim_2_deact.png',
'img/blue_stim_1.png',
'img/blue_stim_1_deact.png',
'img/blue_stim_2.png',
'img/blue_stim_2_deact.png',
'img/dollar.png',
'img/demo_chosen_first_stage.png',
'img/demo_chosen_second_stage.png',
'img/demo_stage2sets.png',
];


function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

function saveData(name, data){
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'write_data.php'); // 'write_data.php' is the path to the php file described above.
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({filedata: data}));
}
