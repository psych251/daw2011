/**
* jspsych-space-daw-stim
* Wouter Kool
*
* plugin for displaying a space and aliens version of the Daw 2-step task
*
**/

(function($) {
	jsPsych["daw_two_step"] = (function() {

		var plugin = {};

		var score = 0;

		plugin.create = function(params) {

			params = jsPsych.pluginAPI.enforceArray(params, ['stimuli', 'choices']);

			var trials = new Array(params.nrtrials);

			for (var i = 0; i < trials.length; i++) {

				trials[i] = {};
				trials[i].practice = params.practice || 0;
				trials[i].reward_prob = params.reward_prob;

				trials[i].subid = params.subid;
				trials[i].block = params.block;
				trials[i].transition_prob = params.transition_prob || 0.7;
				//trials[i].fixed_time = params.fixed_time || false;

				// timing parameters
				trials[i].feedback_time = params.feedback_time || 500; //time with the red box
				trials[i].ITI = 500+1000*Math.random(); // jittered ITI
				trials[i].timeout_time = params.timeout_time || 2000; //the time that the crosses stay on the screen during the time-out
				trials[i].timing_response = params.timing_response || -1; // 2000 if -1, then wait for response forever
				trials[i].score_time = params.score_time || 1000; //time with the coin
				trials[i].totalscore_time = params.totalscore_time || 0;

			}
			return trials;

		};

		plugin.trial = function(display_element, trial) {

			// if any trial variables are functions
			// this evaluates the function and replaces
			// it with the output of the function

			trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

			progress = jsPsych.progress();
			if (progress.current_trial_global == 0) {
				score = 0;
			}

			var stims1 = shuffle([1,2]);
			var stims2 = shuffle([1,2]);
			var stims = stims1;

			var part = -1;
			var choice1 = -1;
			var choice2 = -1;
			var state2 = -1;
			var win = -1;
			var common = -1;

			var points = 0;

			if (trial.practice == 1) {
				var state_names = ["prac_stage1","brown","yellow"];
			} else {
				var state_names = ["stage1","pink","blue"];
			}
				var state_colors = [
					[255, 0, 0],
				];


			// store responses
			var setTimeoutHandlers = [];

			var keyboardListener = new Object;

			var response = new Array(2);
			for (var i = 0; i < 2; i++) {
				response[i] = {rt: -1, key: -1};
			}

			var state = 0;

			var choices = ["F","J"];

			// function to end trial when it is time
			var end_trial = function() {

				kill_listeners();
				kill_timers();

				// gather the data to store for the trial
				var trial_data = {
					"subid": trial.subid,
					"key_press":response[part].key,
					"stim_s1_left": stims1[0],
					"stim_s1_right": stims1[1],
					"stim_s1_left_img":state_names[0]+'_stim_'+stims1[0]+'.png',
					"stim_s1_right_img":state_names[0]+'_stim_'+stims1[1]+'.png',
					"rt_1": response[0].rt,
					"choice1": choice1,
					"stim_s2_left": stims2[0],
					"stim_s2_right": stims2[1],
					"state2_color":state_name,
					"stim_s2_left_img":state_names[state2]+'_stim_'+stims2[0]+'.png',
					"stim_s2_right_img":state_names[state2]+'_stim_'+stims2[1]+'.png',
					"rt_2": response[1].rt,
					"choice2": choice2,
					"win": win,
					"state2_id": state2,
					"common": common,
					"score": score,
					"practice": trial.practice,
					"reward_prob1": trial.reward_prob[0][0],
					"reward_prob2": trial.reward_prob[0][1],
					"reward_prob3": trial.reward_prob[1][0],
					"reward_prob4": trial.reward_prob[1][1],
					"block":trial.block,
				};

				jsPsych.data.write(trial_data);

				var handle_totalscore = setTimeout(function() {
					// clear the display
					display_element.html('');

					// move on to the next trial
					var handle_ITI = setTimeout(function() {
						jsPsych.finishTrial();
					}, trial.ITI);
					setTimeoutHandlers.push(handle_ITI);
				}, trial.totalscore_time);
				setTimeoutHandlers.push(handle_totalscore);

			};

			// function to handle responses by the subject
			var after_response = function(info) {
				kill_listeners();
				kill_timers();

				// only record the first response
				if (response[part].key == -1){
					response[part] = info;
				}

				display_stimuli(2); //feedback

				var extra_time = 0;

				if (state == 0) {
					if (String.fromCharCode(response[part].key)==choices[0]) { // left response
						choice1 = stims[0];
					} else {
						choice1 = stims[1];
					}
					if (choice1==1) {
						if (Math.random()<trial.transition_prob) {
							state2 = 1;
							common = 1;
						} else {
							state2 = 2;
							common = 0; //rare transition
						}
					} else { //choice1 == 2
						if (Math.random()<trial.transition_prob) {
							state2 = 2;
							common = 1;
						} else {
							state2 = 1;
							common = 0;//rare transition
						}
					}
					state = state2;
					stims = stims2;

					var handle_feedback = setTimeout(function() {
						display_element.html('');
						next_part();
					}, trial.feedback_time);
					setTimeoutHandlers.push(handle_feedback);

				} else {
					if (String.fromCharCode(response[part].key)==choices[0]) { // left response
						choice2 = stims2[0];
					} else {
						choice2 = stims2[1];
					}

					win = Math.random()<trial.reward_prob[state-1][choice2-1];
					
					if (trial.practice == 1){
						score = score;
					} else {
						score = score + win;
					};


					display_stimuli(2);
					var handle_feedback = setTimeout(function() {
						display_stimuli(3);
						var handle_score = setTimeout(function() {
							display_stimuli(4);
							end_trial();
						}, trial.score_time);
						setTimeoutHandlers.push(handle_score);
					}, trial.feedback_time);
					setTimeoutHandlers.push(handle_feedback);
				}
				// show feedback

			};

			var display_stimuli = function(stage){

				kill_timers();
				kill_listeners();

				state_name = state_names[state];

				if (stage==-1) { // timeout	at first level
					$('#jspsych-space-daw-bottom-stim-left').html('<br><br><br>X');
					$('#jspsych-space-daw-bottom-stim-right').html('<br><br><br>X');
				}

				if (stage==1) { // choice stage
					display_element.html('');

					display_element.append($('<div>', {
						id: 'jspsych-space-daw-top-stim-left',
					}));
					if (state>0) {
						display_element.append($('<div>', {
						style: 'background-image: url(img/'+state_names[0]+'_stim_'+choice1+'_deact.png)',
							id: 'jspsych-space-daw-top-stim-middle',
						}));
					} else {
						display_element.append($('<div>', {
							id: 'jspsych-space-daw-top-stim-middle',
						}));
					}
					display_element.append($('<div>', {
						id: 'jspsych-space-daw-top-stim-right',
					}));

					display_element.append($('<div>', {
						style: 'clear:both',
					}));

					display_element.append($('<div>', {
						style: 'background-image: url(img/'+state_name+'_stim_'+stims[0]+'.png)',
						id: 'jspsych-space-daw-bottom-stim-left',
					}));
					display_element.append($('<div>', {
						id: 'jspsych-space-daw-bottom-stim-middle',
					}));
					display_element.append($('<div>', {
						style: 'background-image: url(img/'+state_name+'_stim_'+stims[1]+'.png)',
						id: 'jspsych-space-daw-bottom-stim-right',
					}));

				}

				if (stage==2) { // feedback
					if (String.fromCharCode(response[part].key)==choices[0]) { // left response
						$('#jspsych-space-daw-bottom-stim-right').css('background-image', 'url(img/'+state_name+'_stim_'+stims[1]+'_deact.png)');
						$('#jspsych-space-daw-bottom-stim-left').addClass('jspsych-space-daw-bottom-stim-border');
						$('#jspsych-space-daw-bottom-stim-left').css('border-color');
					} else {
						$('#jspsych-space-daw-bottom-stim-left').css('background-image', 'url(img/'+state_name+'_stim_'+stims[0]+'_deact.png)');
						$('#jspsych-space-daw-bottom-stim-right').css('border-color');
						$('#jspsych-space-daw-bottom-stim-right').addClass('jspsych-space-daw-bottom-stim-border');
					}
				}


				if (stage==3) { // reward
					display_element.html('');
					display_element.append($('<div>', {
						id: 'jspsych-space-daw-top-stim-left',
					}));
					display_element.append($('<div>', {
					style: 'background-image: url(img/'+state_name+'_stim_'+choice2+'_deact.png)',
						id: 'jspsych-space-daw-top-stim-middle',//'jspsych-space-daw-top-stim-middle'
					}));
					const elem = document.getElementById("move-element");
					// console.log(elem);
					display_element.append($('<div>', {
						id: 'jspsych-space-daw-top-stim-right',
					}));

					display_element.append($('<div>', {
						style: 'clear:both',
					}));
					display_element.append($('<div>', {
						id: 'jspsych-space-daw-bottom-stim-left',
					}));

					if (win==1) {

						display_element.append($('<div>', {
							id: 'jspsych-space-daw-bottom-stim-middle',
							style: 'background-image: url(img/dollar.png)',
						}));
					} else {
						display_element.append($('<div>', {
							id: 'jspsych-space-daw-bottom-stim-middle',
						}));
					};

					display_element.append($('<div>', {
						id: 'jspsych-space-daw-bottom-stim-right',
					}));


						// if (String.fromCharCode(response[part].key)==choices[0]) { // left response
						// 	$('#jspsych-space-daw-top-stim-left').css('background-image', 'url(img/dollar.jpg)')
						// } else {
						// 	$('#jspsych-space-daw-top-stim-right').css('background-image', 'url(img/dollar.jpg)')
						// }

				}


			}

			var start_response_listener = function(){

				if(JSON.stringify(choices) != JSON.stringify(["none"])) {
					var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
						callback_function: after_response,
						valid_responses: choices,
						rt_method: 'date',
						persist: false,
						allow_held_key: false
					});
				}
			}

			var kill_timers = function(){
				for (var i = 0; i < setTimeoutHandlers.length; i++) {
					clearTimeout(setTimeoutHandlers[i]);
				}
			}



			var kill_listeners = function(){
				// kill keyboard listeners
				if(typeof keyboardListener !== 'undefined'){
					//jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
					jsPsych.pluginAPI.cancelAllKeyboardResponses();
				}
			}

			var next_part = function(){

				part = part + 1;
				// console.log(part);

				kill_timers();
				kill_listeners();

				display_stimuli(1);

				start_response_listener();

				if (trial.timing_response>0) {
					var handle_response = setTimeout(function() {
						kill_listeners();
						display_stimuli(-1);
						var handle_timeout = setTimeout(function() {
							end_trial();
						}, trial.timeout_time);
						setTimeoutHandlers.push(handle_timeout);
					}, trial.timing_response);
					setTimeoutHandlers.push(handle_response);
				}
			}

			next_part();

		};

		return plugin;
	})();
})(jQuery);
