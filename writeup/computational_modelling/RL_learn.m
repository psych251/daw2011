function [Q_TD_stage12, Q_MB_stage1]=RL_learn(outcome,choice,alpha1,alpha2,lumbda,transition_mat)

%inputs 
        %outcome: vector of size trialNum
        %choice: matrix of size trialNum * 2
        %alpha1 / alpha2: values of stage1 and stage2 alphas
        %transition matrix: 2*2

    trialNum = length(choice);

    Q_TD = zeros(3,4,trialNum); %stage*states*trials
    Q_MB = zeros(2,4,trialNum); %stage*states*trials
    PE = zeros(2,trialNum); %stage*trials
    
    for t = 1:trialNum
        %pre-set some values by definition
        r1 = 0;
        r2 = outcome(t);
        
        choice1 = choice(t,1);
        choice2 = (choice1-1)*2 + choice(t,2);
        
        if t == 1 % start is assumed to be 0.5
            Q_TD(1:2,:,t) = 0.5;
            Q_MB(1:2,:,t) = 0.5;
        else
            Q_TD(1:2,:,t) = Q_TD(1:2,:,t-1);
            %Bellman equation to update chosen first-stage option
            Q_MB(1,1,t) = transition_mat(1,1).* max(Q_MB(2,1:2,t-1))+transition_mat(1,2).* max(Q_MB(2,3:4,t-1)); %set1
            Q_MB(1,2,t) = transition_mat(2,1).* max(Q_MB(2,1:2,t-1))+transition_mat(2,2).* max(Q_MB(2,3:4,t-1)); %set2
        end
        
        Q_TD(3,1:2,t) = 0; % by definition
        
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

    
    Q_TD_stage12 = squeeze(Q_TD(1:2,:,1:trialNum));
    Q_MB_stage1 = squeeze(Q_MB(1,1:2,1:trialNum));
    
end
