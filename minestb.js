const mineBoard = document.querySelector('#mineBoard');
const minesLeftEl = document.querySelector('#minesLeft');
const safeLeftEl = document.querySelector('#safeLeft');
const mineStatus = document.querySelector('#mineStatus');
const flagToggle = document.querySelector('#flagToggle');
const SIZE=16, COUNT=40; let mineCells, started, ended, flagMode=false, rewarded=false;
function newMines(){mineCells=Array.from({length:SIZE*SIZE},()=>({mine:false,revealed:false,flag:false,count:0}));started=false;ended=false;flagMode=false;rewarded=false;flagToggle.classList.remove('active');flagToggle.setAttribute('aria-pressed','false');mineStatus.textContent='';renderMines();}
function plantMines(safe){let options=mineCells.map((_,i)=>i).filter(i=>Math.abs(i%SIZE-safe%SIZE)>1||Math.abs(Math.floor(i/SIZE)-Math.floor(safe/SIZE))>1);for(let n=0;n<COUNT;n++){const pos=Math.floor(Math.random()*options.length);mineCells[options.splice(pos,1)[0]].mine=true;}mineCells.forEach((cell,i)=>cell.count=neighbors(i).filter(j=>mineCells[j].mine).length);started=true;}
function neighbors(i){const x=i%SIZE,y=Math.floor(i/SIZE),out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&x+dx>=0&&x+dx<SIZE&&y+dy>=0&&y+dy<SIZE)out.push((y+dy)*SIZE+x+dx);return out;}
function reveal(i){if(ended||mineCells[i].flag||mineCells[i].revealed)return;if(!started)plantMines(i);const cell=mineCells[i];cell.revealed=true;if(cell.mine){ended=true;mineCells.forEach(c=>{if(c.mine)c.revealed=true;});mineStatus.textContent='Oh no — that square was hiding a mine.';}else if(!cell.count)neighbors(i).forEach(reveal);checkWin();renderMines();}
function flag(i){if(ended||mineCells[i].revealed)return;mineCells[i].flag=!mineCells[i].flag;renderMines();}
function checkWin(){if(mineCells.filter(c=>!c.mine&&!c.revealed).length===0){ended=true;if(!rewarded){rewarded=true;window.tinyBreak.addPoints(100,'mines');}mineStatus.textContent='You cleared the whole board — beautifully done! +100 points';}}
function renderMines(){const flags=mineCells.filter(c=>c.flag).length,safe=mineCells.filter(c=>!c.mine&&!c.revealed).length;minesLeftEl.textContent=COUNT-flags;safeLeftEl.textContent=safe;mineBoard.innerHTML=mineCells.map((c,i)=>`<button class="mine-cell ${c.revealed?'revealed':''} ${c.flag?'flagged':''} ${c.revealed&&c.mine?'mine':''} ${c.revealed&&c.count?'n'+c.count:''}" data-index="${i}" aria-label="minefield square">${c.flag?'⚑':c.revealed?(c.mine?'✦':c.count||''):''}</button>`).join('');}
mineBoard.addEventListener('click',e=>{const el=e.target.closest('[data-index]');if(el){flagMode?flag(+el.dataset.index):reveal(+el.dataset.index);}});
mineBoard.addEventListener('contextmenu',e=>{const el=e.target.closest('[data-index]');if(el){e.preventDefault();flag(+el.dataset.index);}});
let press;mineBoard.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-index]');if(el)press=setTimeout(()=>{flag(+el.dataset.index);press=null;},550);});mineBoard.addEventListener('pointerup',()=>{if(press)clearTimeout(press);});
flagToggle.onclick=()=>{flagMode=!flagMode;flagToggle.classList.toggle('active',flagMode);flagToggle.setAttribute('aria-pressed',String(flagMode));flagToggle.textContent=flagMode?'⚑ Possible-mine marking is on':'⚑ Mark possible mines';};
document.querySelector('#newGame').onclick=newMines;newMines();
