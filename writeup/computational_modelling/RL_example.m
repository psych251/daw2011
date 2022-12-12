%import data
% clc; clear;
cd('/Users/rh/Desktop/first_year/PSYCH251_MF/daw2011/writeup/');
data_path = 'data/wrapper/';

data = readtable([data_path,'df_MATLAB.csv']);

participant_list = unique(data.participant_id);
participant_list = participant_list(14);
tWindow = [63 81];

alpha1 = 0.54; 
alpha2 = 0.42;
lumbda = 0.57;
transition_mat = [.7 .3; .3 .7]; 

for p = 1:length(participant_list)
    sub = participant_list(p);
    temp_data = data(data.participant_id == sub,:);
    trialNum = max(temp_data.trial_index_global);

    Q_TD = zeros(3,4,trialNum); %stage states trials
    Q_MB = zeros(2,4,trialNum); %stage states trials
    PE = zeros(2,trialNum);
    outcome = zeros(1,trialNum);
    choices = zeros(2,trialNum);
    
    for t = 1:trialNum
        temp_trial_data = temp_data(temp_data.trial_index_global == t,:);
        choice1 = temp_trial_data.choice(1);
        choice2 = (choice1-1)*2 + temp_trial_data.choice(2);
        choices(:,t) = [choice1,choice2];
        
        %pre-set some values by definition
        r1 = 0;
        
        r2 = temp_trial_data.win(2);
        outcome(1,t) = r2;
        
        if t == 1
            Q_TD(1:2,:,t) = 0.5;
            Q_MB(1:2,:,t) = 0.5;
        else
            Q_TD(1:2,:,t) = Q_TD(1:2,:,t-1);
            %Bellman equation to update chosen first-stage option
            Q_MB(1,1,t) = transition_mat(1,1).* max(Q_MB(2,1:2,t-1))+transition_mat(1,2).* max(Q_MB(2,3:4,t-1)); %set1
            Q_MB(1,2,t) = transition_mat(2,1).* max(Q_MB(2,1:2,t-1))+transition_mat(2,2).* max(Q_MB(2,3:4,t-1)); %set2
        end
        
        Q_TD(3,1:2,t) = 0;

        
        % the TD part
        
        %stage1

        PE(1,t) = r1 + Q_TD(2,choice2,t) - Q_TD(1,choice1,t);
        Q_TD(1,choice1,t) = Q_TD(1,choice1,t) + alpha1 * PE(1,t); %update
        Q_TD(1,setdiff([1,2,3,4],choice1),t) = Q_TD(1,setdiff([1,2,3,4],choice1),t);%not update
        
        %stage 2
        PE(2,t)= r2 + Q_TD(3,1,t) - Q_TD(2,choice2,t);
        Q_TD(2,choice2,t) = Q_TD(2,choice2,t) + alpha2 * PE(2,t); %update
        Q_TD(2,setdiff([1,2,3,4],choice2),t) = Q_TD(2,setdiff([1,2,3,4],choice2),t);%not update
        %Q_MB = Q_TD in the second stage
        Q_MB(2,:,t) = Q_TD(2,:,t);
        
        %stage-skipping update of the first-stage action by the second-stage RPE
        Q_TD(1,choice1,t) = Q_TD(1,choice1,t) + alpha1 * lumbda * PE(2,t); %update
    end
    
    outcome(outcome==0)=NaN;
    
    subplot(length(participant_list),2,p); hold on;
    axs = subplot(length(participant_list),2,p);
    
    for i = 1:2
        plot(1:trialNum,squeeze(Q_TD(1,i,:)),'lineWidth',2); hold on;
    end
    scatter(1:trialNum,(choices(1,:)-1),25,choices(1,:),'filled')
    colormap jet
    plot(1:trialNum,(outcome)/2, 'kx');
    area(tWindow, [axs.YLim(1) axs.YLim(1)],'FaceColor','k','FaceAlpha',0.06,'LineStyle','none');
    area(tWindow, [axs.YLim(2) axs.YLim(2)],'FaceColor','k','FaceAlpha',0.06,'LineStyle','none');
    title(["model-free, "+"participant "+participant_list]);
     
    subplot(length(participant_list),2,length(participant_list)+p); hold on;
    axs = subplot(length(participant_list),2,length(participant_list)+p);
    
    for i = 1:2
        plot(1:trialNum,squeeze(Q_MB(1,i,:)),'lineWidth',2); hold on;
    end
    scatter(1:trialNum,(choices(1,:)-1),25,choices(1,:),'filled')
    colormap jet
    plot(1:trialNum,(outcome)/2, 'kx');
    area(tWindow, [axs.YLim(1) axs.YLim(1)],'FaceColor','k','FaceAlpha',0.06,'LineStyle','none');
    area(tWindow, [axs.YLim(2) axs.YLim(2)],'FaceColor','k','FaceAlpha',0.06,'LineStyle','none');
    title(["model-based, "+"participant "+participant_list]);
    
end


set(gcf,'Position',[50 50 600 300])

exportgraphics(gcf,'/Users/rh/Desktop/first_year/PSYCH251_MF/daw2011/writeup/writeup_resources/simulation.png','Resolution',300);
