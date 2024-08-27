import groups from "./data/groups.json" assert { type: "json" };
import { groupStageMatches } from "./definitions/definitions.js";

// console.log(groups)
  

const groupsKeys = Object.keys(groups)
const teams = [];
groupsKeys.forEach(group => groups[group].forEach(team => 
    teams.push({...team})
) )

const groupStageMatchesData = [];

const match = (team1,team2) => {
    console.log("team1", team1)
    console.log("team2", team2)
    const max = 80;
    const min = 70;

    let disqualification = Math.ceil(Math.random()*100)
    let t1Points, t2Points;
    let t1BasketScored, t2BasketScored;
    if(disqualification===1){
        t1Points = 0;
        t2Points = 2;
        t1BasketScored = 0;
        t2BasketScored = 20;
    }else if(disqualification===2){
        t1Points = 2;
        t2Points = 0;
        t1BasketScored = 20;
        t2BasketScored = 0;
    }else{
        //Pazi ovde da ne može da se nađe isti rezultat
        t1BasketScored = Math.ceil(Math.random()*(max-min)+min)
        t2BasketScored = Math.ceil(Math.random()*(max-min)+min)
        t1Points = t1BasketScored > t2BasketScored ? 2 : 1;
        t2Points = t1BasketScored < t2BasketScored ? 2 : 1
    }

    return ({ 
        team1: {...team1, basketScored: t1BasketScored, points:t1Points},
        team2: {...team2, basketScored: t2BasketScored, points:t2Points}
    })

}



groupStageMatches.forEach((round,i) => {
    console.log(`round: ${i+1} ///////////////////`)
    round.forEach((positions) => {
        groupsKeys.forEach(g => 
        {
            groupStageMatchesData.push( { ...match(groups[g][positions[0]-1], groups[g][positions[1]-1]), group: g, round:i+1}  )
        })
    })
} )


// const groupStageStatistics = groupStageMatchesData.reduce((a,b)=>{
    
// })


console.log("groupStageMatches",groupStageMatchesData)