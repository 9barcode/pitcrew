// Visible tire contact points in sprite-local coordinates. Perspective means
// rear tires must cast contact shadows higher in the image than front tires.
const CONTACTS = [
  [
    [[.14,.79,.075],[.61,.97,.09],[.91,.72,.065]],
    [[.22,.97,.085],[.86,.97,.085]],
    [[.10,.68,.065],[.50,.97,.10],[.90,.87,.075]]
  ],
  [
    [[.17,.78,.075],[.63,.96,.09],[.92,.69,.06]],
    [[.23,.96,.085],[.87,.96,.085]],
    [[.10,.68,.065],[.49,.97,.10],[.91,.87,.075]]
  ]
];
export function drawTireContacts(g,team,row,left,top,width,height){
 const contacts=CONTACTS[team]?.[row]??CONTACTS[0][row];
 g.save();
 // A close underbody shadow follows the same road plane as the tires.
 g.fillStyle='#08101b38';g.filter='blur(1px)';g.beginPath();
 if(row===1){g.ellipse(left+width*.54,top+height*.95,width*.34,height*.025,0,0,Math.PI*2);}
 else{const a=contacts[1],b=contacts[2];g.moveTo(left+width*a[0],top+height*(a[1]-.025));g.lineTo(left+width*b[0],top+height*(b[1]-.025));g.lineTo(left+width*(b[0]-.14),top+height*(b[1]-.06));g.lineTo(left+width*(a[0]-.18),top+height*(a[1]-.06));g.closePath();}
 g.fill();
 for(const [x,y,radius] of contacts){
  g.filter='blur(.45px)';g.fillStyle='#060b12b8';g.beginPath();
  g.ellipse(left+width*x,top+height*y,width*radius,height*.018,0,0,Math.PI*2);g.fill();
 }
 g.restore();
}
