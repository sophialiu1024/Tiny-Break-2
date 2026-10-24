const blockBoard = document.querySelector('#blockBoard');
const rack = document.querySelector('#pieceRack');
const blockScoreEl = document.querySelector('#score');
const blockBestEl = document.querySelector('#best');
const note = document.querySelector('#blockNote');
const loseScreen = document.querySelector('#loseScreen');
const colors = ['#5baee9','#7d8be9','#69cdb9','#e98daf','#f2b667'];
const shapes = [[[0,0],[1,0],[0,1],[1,1]],[[0,0],[1,0],[2,0],[3,0]],[[0,0],[0,1],[0,2],[0,3]],[[0,0],[1,0],[1,1],[2,1]],[[1,0],[0,1],[1,1],[2,1]],[[0,0],[1,0],[0,1],[0,2]]];
let grid, pieces, selected, blockScore, blockBest = Number(localStorage.blockBloomBest || 0), over, clearing = false;

function makePieces(){return Array.from({length:3},()=>({shape:shapes[Math.floor(Math.random()*shapes.length)],color:colors[Math.floor(Math.random()*colors.length)],used:false}));}
function startBlocks(){grid=Array(64).fill(null);pieces=makePieces();selected=null;blockScore=0;over=false;clearing=false;loseScreen.hidden=true;note.textContent='Fill a line and watch it bloom.';renderBlocks();}
function renderBlocks(){
  blockBoard.innerHTML=grid.map((color,i)=>`<button class="block-cell ${color?'filled':''}" style="${color?`background:${color}`:''}" data-index="${i}" aria-label="board square"></button>`).join('');
  rack.innerHTML='';
  pieces.forEach((piece,index)=>{const el=document.createElement('button');el.className=`piece ${piece.used?'used':''} ${selected===index?'selected':''}`;el.style.gridTemplateColumns=`repeat(${Math.max(...piece.shape.map(p=>p[0]))+1},18px)`;el.style.gridTemplateRows=`repeat(${Math.max(...piece.shape.map(p=>p[1]))+1},18px)`;piece.shape.forEach(([x,y])=>{const sq=document.createElement('span');sq.className='piece-square';sq.style.cssText=`grid-column:${x+1};grid-row:${y+1};background:${piece.color}`;el.append(sq)});if(piece.used)el.innerHTML='';el.onclick=()=>{if(!piece.used&&!clearing){selected=index;note.textContent='Now tap a square on the board.';renderBlocks();}};rack.append(el);});
  blockScoreEl.textContent=blockScore;blockBestEl.textContent=blockBest;
}
function canPlace(piece,origin){const ox=origin%8,oy=Math.floor(origin/8);return piece.shape.every(([x,y])=>ox+x<8&&oy+y<8&&!grid[(oy+y)*8+ox+x]);}
function finishTurn(){
  if(pieces.every(x=>x.used))pieces=makePieces();
  selected=null;
  if(blockScore>blockBest){blockBest=blockScore;localStorage.blockBloomBest=blockBest;}
  if(!pieces.some(p=>!p.used&&grid.some((_,i)=>canPlace(p,i)))){over=true;note.textContent='There is no room for another shape. Would you like to start again?';loseScreen.hidden=false;}
  renderBlocks();
}
function place(origin){
  if(selected===null||over||clearing)return;
  const p=pieces[selected];
  if(!canPlace(p,origin)){note.textContent='That shape needs a little more room there.';return;}
  const ox=origin%8,oy=Math.floor(origin/8);p.shape.forEach(([x,y])=>grid[(oy+y)*8+ox+x]=p.color);p.used=true;blockScore+=4;
  let clears=[], rowClears=0, columnClears=0;
  for(let r=0;r<8;r++)if([...Array(8)].every((_,x)=>grid[r*8+x])){rowClears++;clears.push(...Array.from({length:8},(_,x)=>r*8+x));}
  for(let c=0;c<8;c++)if([...Array(8)].every((_,y)=>grid[y*8+c])){columnClears++;clears.push(...Array.from({length:8},(_,y)=>y*8+c));}
  clears=[...new Set(clears)];
  if(!clears.length){finishTurn();return;}
  const lineClears=rowClears+columnClears;
  clearing=true;blockScore+=clears.length*2;if(lineClears)window.tinyBreak.addPoints(lineClears*20,'blocks');note.textContent=`Beautiful! ${rowClears} row${rowClears===1?'':'s'} and ${columnClears} column${columnClears===1?'':'s'} are clearing for ${lineClears*20} points.`;
  renderBlocks();
  clears.forEach(index=>blockBoard.querySelector(`[data-index="${index}"]`)?.classList.add('clearing'));
  setTimeout(()=>{clears.forEach(index=>grid[index]=null);clearing=false;note.textContent=`Bloom! ${clears.length} squares cleared ✦`;finishTurn();},300);
}
blockBoard.onclick=e=>{const cell=e.target.closest('[data-index]');if(cell)place(Number(cell.dataset.index));};
document.querySelector('#newGame').onclick=startBlocks;
document.querySelector('#tryAgain').onclick=startBlocks;
startBlocks();

let draggingPiece=null, previewCells=[];
function clearPreview(){previewCells.forEach(cell=>cell.classList.remove('preview-valid','preview-invalid'));previewCells=[];}
function updatePreview(x,y){
  clearPreview();
  if(selected===null)return;
  const cell=document.elementFromPoint(x,y)?.closest('#blockBoard [data-index]');
  if(!cell)return;
  const origin=Number(cell.dataset.index),piece=pieces[selected],ox=origin%8,oy=Math.floor(origin/8),valid=canPlace(piece,origin);
  piece.shape.forEach(([dx,dy])=>{if(ox+dx<8&&oy+dy<8){const target=blockBoard.querySelector(`[data-index="${(oy+dy)*8+ox+dx}"]`);if(target){target.classList.add(valid?'preview-valid':'preview-invalid');previewCells.push(target);}}});
}
rack.addEventListener('pointerdown',e=>{const piece=e.target.closest('.piece');if(!piece||piece.classList.contains('used')||clearing)return;draggingPiece=piece;selected=Array.from(rack.children).indexOf(piece);piece.classList.add('selected');note.textContent='Drag the shape over the board to find its perfect spot.';});
document.addEventListener('pointermove',e=>{if(draggingPiece)updatePreview(e.clientX,e.clientY);});
document.addEventListener('pointerup',e=>{if(!draggingPiece)return;const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('#blockBoard [data-index]');clearPreview();if(cell)place(Number(cell.dataset.index));draggingPiece=null;});
