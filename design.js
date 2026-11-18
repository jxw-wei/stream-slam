'use strict';
// Let the embedded controls wrap naturally without cropping on small screens.
const projectFilm=document.querySelector('#projectFilm');
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==projectFilm.contentWindow)return;
  if(event.data?.type==='stream-film-size'&&Number.isFinite(event.data.height)){
    projectFilm.style.height=`${Math.max(180,Math.min(1800,event.data.height))}px`;
    projectFilm.style.aspectRatio='auto';
  }
});
const heroMotion=document.querySelector('#heroMotion');
const heroMotionToggle=document.querySelector('#heroMotionToggle');
function updateHeroMotion(){heroMotionToggle.textContent=heroMotion.paused?'▶':'Ⅱ';heroMotionToggle.setAttribute('aria-label',heroMotion.paused?'Play reconstruction animation':'Pause reconstruction animation');}
let heroWantsPlayback=!matchMedia('(prefers-reduced-motion: reduce)').matches;
let heroInView=false;
if(!heroWantsPlayback){heroMotion.removeAttribute('autoplay');heroMotion.pause();}
function syncHeroPlayback(){if(heroWantsPlayback&&heroInView&&!document.hidden)heroMotion.play().catch(()=>{});else heroMotion.pause();}
heroMotionToggle.addEventListener('click',()=>{heroWantsPlayback=!heroWantsPlayback;syncHeroPlayback();});
heroMotion.addEventListener('play',updateHeroMotion);heroMotion.addEventListener('pause',updateHeroMotion);updateHeroMotion();
new IntersectionObserver(entries=>{for(const entry of entries){heroInView=entry.isIntersecting;syncHeroPlayback();}},{threshold:.05}).observe(heroMotion);
document.addEventListener('visibilitychange',syncHeroPlayback);
const evaluationNotes=document.querySelector('.evaluation-notes');
evaluationNotes.addEventListener('toggle',()=>document.querySelector('.scene-summary').classList.toggle('show-protocols',evaluationNotes.open));
