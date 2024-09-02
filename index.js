
import groups from "./data/groups.json" assert { type: "json" };
import { getTeams, groupsKeys, groupStageMatches, pots, stagesDefinitions, teamInitStatistics } from "./definitions/definitions.js";
import {    displayEliminationPhase, 
            displayGroupStageMatches, 
            displayGroupStageStats, 
            displayPots, 
            displayStandings,
            match, 
            pairTeams, 
            sortGroupTeams, 
            sortTeams
         } from "./utils/utils.js";



const tournament = {
    tournament: "Olympic Games Basketball 2024",
    startDate: "2024-07-05",
    endDate: "2024-08-08",
    totalTeam: 12,
    winner: "",
    stages: {
        groupStage: [], 
        quarterfinals: [],
        semifinals: [],
        finals: [] 
    }, 
    teams: JSON.parse(JSON.stringify(getTeams()))
}

 
// Play tournament 
// Executes the entire basketball tournament, from the group stage to the finals, 
const playTournament = (tournament) => {
    const teams = getTeams();
    // Play all group stage matches
    groupStageMatches.forEach((round,i) => {
        round.forEach((positions) => 
            groupsKeys.forEach(g => 
                match(
                    groups[g][positions[0]-1], 
                    groups[g][positions[1]-1], 
                    tournament, 
                    {stage: stagesDefinitions.groupStage, round:i+1, group:g }
                )
            )
        )
    })
    // Sort teams within each group based on group stage performance
    const sortedGroupTeams = sortGroupTeams(tournament)

    displayGroupStageMatches(tournament.stages.groupStage)
    displayGroupStageStats(sortedGroupTeams);
    
    // Extract the top three teams from each group
    const firstInGroups = [];
    const secondInGroups = [];
    const thirdInGroups = [];
    sortedGroupTeams.forEach(g => {
        firstInGroups.push(g[0]);
        secondInGroups.push(g[1]);
        thirdInGroups.push(g[2]);
    })
    
    //Organize teams for elimination phase
    const storedBetweenGroups = [firstInGroups,secondInGroups,thirdInGroups];
    const groupStageList = {};
    let i = 1;
    storedBetweenGroups.forEach(g => {
        let sortedTeams = sortTeams(g);
        sortedTeams.forEach(s => {
            groupStageList[i]=s;
            i++;
        })
    })
     
    displayPots(pots, groupStageList)

    // Pair teams for the quarterfinals and play the matches
    const quarterFinalsMatches = pots.map(pairPots => pairTeams(pairPots, groupStageList, tournament.stages.groupStage))
    quarterFinalsMatches.forEach((pot,i) => {
        pot.forEach(m => {
            let team1 = groupStageList[m[0]]
            let team2 = groupStageList[m[1]]
            match(team1,team2,tournament,{pot:i+1, stage: stagesDefinitions.quarterfinals})
        })
    })

    displayEliminationPhase("Eliminaciona faza",tournament.stages.quarterfinals,false);
    displayEliminationPhase("Četvrtfinale",tournament.stages.quarterfinals,true);
    
    // Determine semifinalists based on quarterfinals results
    const semifinalists1=[];
    const semifinalists2=[];
    tournament.stages.quarterfinals.forEach(match => {
        if(match.info.pot===1){
            semifinalists1.push(teams[match.winner.ISOCode])
        }else{
            semifinalists2.push(teams[match.winner.ISOCode])
        }
    })
    // Play semifinal matches
    match(...semifinalists1, tournament, {stage:stagesDefinitions.semifinals})
    match(...semifinalists2, tournament, {stage:stagesDefinitions.semifinals})
    displayEliminationPhase("Polufinale",tournament.stages.semifinals,true);

    // Determine finalists and the third-place match participants
    const finalists = [];
    const thirdPlace = [];
    tournament.stages.semifinals.forEach(match => {
        finalists.push(teams[match.winner.ISOCode]);
        thirdPlace.push(teams[match.looser.ISOCode]);
    })
    // Play the final and third-place matches
    match(...finalists, tournament, {stage: stagesDefinitions.finals})
    match(...thirdPlace, tournament, {stage: stagesDefinitions.finals, thirdPlace:true})
    // Display final standings and match results
    const finals = tournament.stages?.finals;
    const thirdPlaceMatch = finals.filter(f => f.info?.thirdPlace)
    const finalsMatch = finals.filter(f => !f.info?.thirdPlace)
    displayEliminationPhase("Utakmica za treće mesto",thirdPlaceMatch,true);
    displayEliminationPhase("Finale",finalsMatch,true);
    displayStandings(finals);
}

playTournament(tournament)