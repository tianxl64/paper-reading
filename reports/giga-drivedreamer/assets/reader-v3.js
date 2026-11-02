(()=>{'use strict';
 const nav=document.getElementById('toc-root');
 const headings=[...document.querySelectorAll('main h1,main h2,main h3,main h4,main h5,main h6')];
 const rootUl=document.createElement('ul'); nav.append(rootUl);
 const stack=[{level:0,ul:rootUl}];
 headings.forEach((h,index)=>{
   const level=Number(h.tagName.slice(1));
   while(stack.length && stack[stack.length-1].level>=level) stack.pop();
   const parent=stack[stack.length-1]||{level:0,ul:rootUl};
   const li=document.createElement('li');
   const row=document.createElement('div');row.className='toc-node';
   const a=document.createElement('a');a.className='toc-link';a.href='#'+h.id;a.textContent=h.textContent.trim();
   const sub=document.createElement('ul');sub.className='toc-children';sub.id='toc-children-'+index;sub.hidden=true;
   const button=document.createElement('button');button.type='button';button.className='toc-toggle';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',sub.id);button.textContent='＋';button.setAttribute('aria-label','展开 '+a.textContent);
   row.append(button,a);li.append(row,sub);parent.ul.append(li);
   if(parent.li){parent.li.querySelector('.toc-toggle').hidden=false;parent.li.querySelector('.toc-toggle').setAttribute('aria-expanded','true');parent.li.querySelector('.toc-toggle').textContent='−';parent.ul.hidden=false;}
   stack.push({level,ul:sub,li});
 });
 const links=[...nav.querySelectorAll('.toc-link')];
 const toggles=[...nav.querySelectorAll('.toc-toggle')];
 function expanded(button,value){button.setAttribute('aria-expanded',String(value));button.textContent=value?'−':'＋';document.getElementById(button.getAttribute('aria-controls')).hidden=!value;}
 toggles.forEach(b=>b.addEventListener('click',()=>expanded(b,b.getAttribute('aria-expanded')!=='true')));
 document.getElementById('toc-expand').addEventListener('click',()=>toggles.forEach(b=>expanded(b,true)));
 document.getElementById('toc-collapse').addEventListener('click',()=>toggles.forEach(b=>expanded(b,false)));
 function activate(id){links.forEach(a=>{if(decodeURIComponent(a.hash.slice(1))===id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
 function openParents(id){const a=links.find(x=>decodeURIComponent(x.hash.slice(1))===id);if(!a)return;let ul=a.closest('ul');while(ul&&ul!==nav){if(ul.classList.contains('toc-children')){const b=nav.querySelector('[aria-controls="'+ul.id+'"]');if(b)expanded(b,true);}ul=ul.parentElement.closest('ul');}}
 function go(id,push){const el=document.getElementById(id);if(!el)return;const d=el.closest('details');if(d)d.open=true;openParents(id);activate(id);if(push)history.pushState(null,'','#'+encodeURIComponent(id));el.scrollIntoView({block:'start'});el.setAttribute('tabindex','-1');el.focus({preventScroll:true});}
 nav.addEventListener('click',e=>{const a=e.target.closest('.toc-link');if(!a)return;e.preventDefault();go(decodeURIComponent(a.hash.slice(1)),true);});
 window.addEventListener('popstate',()=>{if(location.hash)go(decodeURIComponent(location.hash.slice(1)),false);else window.scrollTo(0,0);});
 window.addEventListener('hashchange',()=>{if(location.hash)go(decodeURIComponent(location.hash.slice(1)),false);});
 if(location.hash)requestAnimationFrame(()=>go(decodeURIComponent(location.hash.slice(1)),false));
 let scheduled=false;function spy(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{let chosen=headings[0];for(const h of headings){if(h.getBoundingClientRect().top<=120)chosen=h;else break;}if(chosen)activate(chosen.id);scheduled=false;});}window.addEventListener('scroll',spy,{passive:true});spy();
 const dialog=document.createElement('dialog');dialog.className='viewer';dialog.setAttribute('aria-label','论文图像放大阅读');dialog.innerHTML='<div class="viewer-bar"><span class="viewer-title"></span><button type="button" data-act="fit">适合窗口</button><button type="button" data-act="one">1:1</button><button type="button" data-act="plus" aria-label="放大">＋</button><button type="button" data-act="minus" aria-label="缩小">－</button><a class="viewer-original" target="_blank" rel="noopener">打开原始 PNG</a><button type="button" data-act="close">关闭</button></div><div class="viewer-stage"><img alt=""></div>';document.body.appendChild(dialog);
 const image=dialog.querySelector('img'),stage=dialog.querySelector('.viewer-stage'),title=dialog.querySelector('.viewer-title');let opener=null,scale=1;
 function resize(next){scale=Math.min(5,Math.max(.1,next));image.style.width=Math.round(image.naturalWidth*scale)+'px';image.style.height=Math.round(image.naturalHeight*scale)+'px';}
 function fit(){resize(Math.min((stage.clientWidth-30)/image.naturalWidth,(stage.clientHeight-30)/image.naturalHeight,1));}
 function open(img){opener=img;image.onload=fit;image.src=img.src;image.alt=img.alt;title.textContent=img.alt;dialog.querySelector('.viewer-original').href=img.src;dialog.showModal();if(image.complete)fit();dialog.querySelector('[data-act="close"]').focus();}
 function close(){dialog.close();}
 document.querySelectorAll('figure img').forEach(img=>{img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',img.alt+'，打开图像阅读器');const a=img.closest('a');(a||img).addEventListener('click',e=>{e.preventDefault();open(img);});img.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();e.stopPropagation();open(img);}});});
 dialog.addEventListener('close',()=>opener?.focus());dialog.addEventListener('click',e=>{const act=e.target.dataset.act;if(act==='close')close();if(act==='fit')fit();if(act==='one')resize(1);if(act==='plus')resize(scale*1.25);if(act==='minus')resize(scale/1.25);if(e.target===dialog)close();});
 let drag=null;stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');});stage.addEventListener('pointermove',e=>{if(drag){stage.scrollLeft=drag.left-(e.clientX-drag.x);stage.scrollTop=drag.top-(e.clientY-drag.y);}});function endDrag(){drag=null;stage.classList.remove('dragging');}stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
})();
