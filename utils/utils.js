import groups from "../data/groups.json" assert { type: "json" };

export const groupsKeys = Object.keys(groups)

export const findMatchResults = (team1,team2,groupStage) => {
    let match = groupStage.find(match => match.hasOwnProperty(team1) && match.hasOwnProperty(team2)) 
    if(match){
        if(match[team1].score > match[team2].score){
            return -1
        }else if(match[team1].score < match[team2].score){
            return 1
        }
    }
    return 0;
}

export const sortGroupTeams = (tournament) => {
    return groupsKeys.map(key => {
        let group = Object.values(tournament.teams).filter(t => t.group===key)
        group.sort((a,b) => {
            if(a.groupStageStats.points < b.groupStageStats.points) return 1;
            if(a.groupStageStats.points > b.groupStageStats.points) return -1;
            const headToHeadResult = findMatchResults(a.ISOCode, b.ISOCode, tournament.stages.groupStage);
            if (headToHeadResult) {
                return headToHeadResult;
            }
            if(a.groupStageStats.pointDifference < b.groupStageStats.pointDifference) return 1;
            if(a.groupStageStats.pointDifference > b.groupStageStats.pointDifference) return -1;
            return 0;
        })
        return group
    })
}

export const sortTeams = (team) => { 
    team.sort((a,b) => {
        if(a.groupStageStats.points < b.groupStageStats.points) return 1;
        if(a.groupStageStats.points > b.groupStageStats.points) return -1;
        if(a.groupStageStats.pointDifference < b.groupStageStats.pointDifference) return 1;
        if(a.groupStageStats.pointDifference > b.groupStageStats.pointDifference) return -1;
        if(a.groupStageStats.pointScored < b.groupStageStats.pointScored) return 1;
        if(a.groupStageStats.pointScored > b.groupStageStats.pointScored) return -1;
        return 0;
    })
    return team;
}