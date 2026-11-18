'use strict';
const data=window.RECONSTRUCTIONS;
const $=selector=>document.querySelector(selector);
const labels=data.methods;
const datasetTabs=$('#datasetTabs'),gallery=$('#resultGallery');
let datasetIndex=0;
const dialog=$('#comparisonDialog'),methodSelect=$('#comparisonMethod');
const stage=$('#comparisonStage'),range=$('#comparisonRange');
let currentView=null,dialogTrigger=null;
const visibleMethods=['monogs','photoslam','splat_slam','hislam2','stream_slam','reference'];
const sceneSelect=$('#sceneSelect');
function selectScene(index){
  const entry=data.datasets[datasetIndex].scenes[index];
  sceneSelect.value=String(index);
  const summary=entry.summary;
  const methods=Object.keys(summary.methods);
  const table=$('#sceneMetricTable');
  const caption=document.createElement('caption');caption.textContent=`${entry.name} · ${summary.scope==='paper'?'Paper Table '+summary.table:'Qualitative results'}`;
  table.className='metrics-table';
  const head=document.createElement('thead'),heading=document.createElement('tr');
  for(const label of ['Method',`ATE (${summary.ate_unit||'cm'}) ↓`,'PSNR (dB) ↑']){const th=document.createElement('th');th.scope='col';th.textContent=label;heading.append(th);}head.append(heading);
  const body=document.createElement('tbody');
  const values=key=>[...new Set(methods.map(m=>summary.methods[m][key]).filter(Number.isFinite))].sort((a,b)=>key==='ate'?a-b:b-a);
  const ordered={ate:values('ate'),psnr:values('psnr')};
  for(const method of methods){
    const record=summary.methods[method],row=document.createElement('tr');
    const name=document.createElement('th');name.scope='row';name.textContent=labels[method]||method;row.append(name);
    for(const key of ['ate','psnr']){
      const cell=document.createElement('td');cell.dataset.method=method;cell.dataset.metric=key;
      cell.textContent=key==='ate'?record.ate_reported:record.reported;
      const value=record[key],rank=Number.isFinite(value)?ordered[key].indexOf(value)+1:0;
      if(rank&&rank<=3&&ordered[key].length>1){cell.dataset.rank=rank;cell.title=`Rank ${rank}`;}
      const source=Number.isFinite(value)?record[key+'_source']||record.source||record.origin:'No valid sequence evaluation';
      cell.title+=(cell.title?' · ':'')+(source||'No valid sequence evaluation');
      row.append(cell);
    }
    body.append(row);
  }
  caption.textContent=`${entry.name} · ${summary.scope==='paper'?'Paper results':'Recorded sequence evaluations'}`;
  table.replaceChildren(caption,head,body);
  $('#sceneMetricNote').textContent=summary.note;
  gallery.replaceChildren(makeScene(entry));
}
sceneSelect.addEventListener('change',()=>selectScene(Number(sceneSelect.value)));
function makeCell(method,image,entry,view){
  const figure=document.createElement('figure');
  figure.className='scene-cell'+(method==='stream_slam'?' is-ours':'');
  const button=document.createElement('button');
  button.type='button';
  button.setAttribute('aria-label',`Compare ${labels[method]} on ${entry.name}, ${view.label}`);
  const img=document.createElement('img');
  Object.assign(img,{src:image.src,alt:`${labels[method]} · ${entry.name} · ${view.label}`,width:image.width,height:image.height,loading:'lazy',decoding:'async'});
  button.append(img);
  button.addEventListener('click',()=>openComparison(entry,view,method,button));
  const caption=document.createElement('figcaption');caption.textContent=labels[method];
  figure.append(button,caption);return figure;
}
function paintScene(row,entry,viewIndex){
  const view=entry.views[viewIndex],images=row.querySelector('.scene-images');
  const available=visibleMethods.filter(method=>view.images[method]);
  images.style.setProperty('--columns',available.length);
  const ref=view.images.reference;
  images.style.setProperty('--ratio',`${ref.width} / ${ref.height}`);
  images.dataset.count=available.length;
  images.replaceChildren(...available.map(method=>makeCell(method,view.images[method],entry,view)));
}
function makeScene(entry){
  const article=document.createElement('article');article.className='scene-row';article.dataset.scene=entry.id;
  const header=document.createElement('div');header.className='scene-heading';
  const title=document.createElement('h3');title.textContent=entry.name;
  const picker=document.createElement('label');picker.className='view-picker';
  const text=document.createElement('span');text.textContent='View';
  const select=document.createElement('select');select.setAttribute('aria-label',`Camera view for ${entry.name}`);
  entry.views.forEach((view,index)=>{const option=new Option(view.label,index);select.add(option);});
  select.addEventListener('change',()=>paintScene(article,entry,Number(select.value)));
  picker.append(text,select);header.append(title,picker);
  const images=document.createElement('div');images.className='scene-images';
  article.append(header,images);paintScene(article,entry,0);return article;
}
function selectDataset(index,focus=false){
  const returnToGallery=gallery.getBoundingClientRect().top<0;
  datasetIndex=index;
  const dataset=data.datasets[index];
  datasetTabs.querySelectorAll('button').forEach((button,i)=>{
    const selected=i===index;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
    if(selected&&focus)button.focus();
  });
  gallery.setAttribute('aria-labelledby',`dataset-${dataset.id}`);
  sceneSelect.replaceChildren(...dataset.scenes.map((entry,index)=>new Option(entry.name,index)));
  selectScene(0);
  $('#galleryCount').textContent=`${dataset.scenes.length} scenes · ${dataset.scenes.reduce((sum,scene)=>sum+scene.views.length,0)} views`;
  if(returnToGallery)window.scrollTo({top:$('#results').offsetTop-24,behavior:'instant'});
}
data.datasets.forEach((dataset,index)=>{
  const button=document.createElement('button');button.type='button';button.id=`dataset-${dataset.id}`;
  button.setAttribute('role','tab');button.setAttribute('aria-controls','resultGallery');
  button.append(document.createTextNode(dataset.name));
  const count=document.createElement('small');count.textContent=dataset.scenes.length;button.append(count);
  button.addEventListener('click',()=>selectDataset(index));
  button.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight')next=(index+1)%data.datasets.length;
    if(event.key==='ArrowLeft')next=(index+data.datasets.length-1)%data.datasets.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=data.datasets.length-1;
    if(next!==undefined){event.preventDefault();selectDataset(next,true);}
  });
  datasetTabs.append(button);
});
selectDataset(0);

function updateSlider(){
  const value=Number(range.value);
  $('.comparison-ours').style.clipPath=`inset(0 ${100-value}% 0 0)`;
  $('.comparison-divider').style.left=`${value}%`;
  range.setAttribute('aria-valuetext',`${value}% STREAM-SLAM, ${100-value}% ${labels[methodSelect.value]}`);
}
function updateBaseline(){
  const method=methodSelect.value,image=currentView.images[method],ours=currentView.images.stream_slam;
  $('#comparisonBase').src=image.src;$('#comparisonBase').alt=labels[method];
  $('#comparisonOurs').src=ours.src;$('#comparisonOurs').alt='STREAM-SLAM';
  $('#comparisonLabel').textContent=labels[method];
  $('.comparison-label.ours').textContent='STREAM-SLAM';
  updateSlider();
}
function openComparison(entry,view,method,trigger){
  currentView=view;dialogTrigger=trigger;
  $('#comparisonTitle').textContent=`${data.datasets[datasetIndex].name} · ${entry.name}`;
  $('#comparisonFrame').textContent=view.label;
  const methods=Object.keys(view.images).filter(key=>key!=='stream_slam');
  methodSelect.replaceChildren(...methods.map(key=>new Option(labels[key],key)));
  methodSelect.value=method==='stream_slam'?(methods.includes('hislam2')?'hislam2':methods[0]):method;
  $('#comparisonNote').textContent=view.note;
  stage.style.aspectRatio=`${view.images.reference.width} / ${view.images.reference.height}`;
  range.value=50;updateBaseline();dialog.showModal();document.body.style.overflow='hidden';
}
methodSelect.addEventListener('change',updateBaseline);
range.addEventListener('input',updateSlider);
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.style.overflow='';dialogTrigger?.focus({preventScroll:true});});
let pointer=null;
function moveSlider(event){const rect=stage.getBoundingClientRect();range.value=Math.round(Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width))*100);updateSlider();}
stage.addEventListener('pointerdown',event=>{if(!event.isPrimary||event.button!==0)return;pointer=event.pointerId;stage.setPointerCapture(pointer);range.focus({preventScroll:true});moveSlider(event);event.preventDefault();});
stage.addEventListener('pointermove',event=>{if(event.pointerId===pointer)moveSlider(event);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(name,()=>{pointer=null;});

const viewerRoot=document.querySelector('#splatViewer');
const viewerStatus=document.querySelector('#viewerStatus');
const viewerReset=document.querySelector('#viewerReset');
const viewerOverview=$('#viewerOverview'),trajectoryToggle=$('#viewerTrajectory'),camerasToggle=$('#viewerCameras');
const viewerScenes=window.VIEWER_SCENES;
const viewerDatasets=[...new Set(viewerScenes.map(scene=>scene.dataset))];
const viewerTabs=$('#viewerDatasetTabs'),viewerPicker=$('#viewerSceneSelect'),viewerThumbs=$('#viewerScenes');
const viewerOverlay=viewerRoot.querySelector('.viewer-loading');
let selectedMap=viewerScenes[0],viewerStarted=false,loadRevision=0,viewerQueue=Promise.resolve();
let renderer,splatViewer,controls,resizeObserver,disposeFallback,frame=0,inView=false,draw;
let poseOverlay=null;
let lastDrawTime=0,frameInterval=1000/30;
let pathPlayback=null;
function mapLabel(scene){return `${scene.dataset} · ${scene.name}`;}
function mapSize(scene){return `${(scene.bytes/1000000).toFixed(1)} MB`;}
function setViewerStatus(message,ready=false){
  viewerStatus.textContent=message;
  viewerStatus.dataset.ready=String(ready);
}
function animate(time){
  frame=0;if(!inView||document.hidden||!draw)return;
  if(time-lastDrawTime>=frameInterval){pathPlayback?.update(time);draw();lastDrawTime=time;}
  frame=requestAnimationFrame(animate);
}
function scheduleRender(){if(!frame&&draw&&inView&&!document.hidden)frame=requestAnimationFrame(animate);}
new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(!inView){pathPlayback?.stop();cancelAnimationFrame(frame);frame=0;}else scheduleRender();}).observe(viewerRoot);
document.addEventListener('visibilitychange',()=>{if(document.hidden){pathPlayback?.stop();cancelAnimationFrame(frame);frame=0;}else scheduleRender();});
async function cleanViewer(){
  pathPlayback?.stop();pathPlayback=null;document.querySelector('#cameraPlay').disabled=true;document.querySelector('#cameraSeek').disabled=true;
  cancelAnimationFrame(frame);frame=0;draw=null;
  resizeObserver?.disconnect();controls?.dispose();controls=null;
  try{await splatViewer?.dispose();}catch(error){console.warn('Viewer cleanup:',error);}
  splatViewer=null;renderer?.dispose();renderer?.domElement.remove();renderer=null;
  disposeFallback?.();disposeFallback=null;
  poseOverlay?.dispose();poseOverlay=null;
  delete viewerRoot.dataset.trajectoryFrames;delete viewerRoot.dataset.cameraPoses;
  viewerRoot.querySelectorAll('canvas').forEach(canvas=>canvas.remove());
  viewerReset.disabled=true;viewerReset.onclick=null;
  viewerOverview.disabled=true;viewerOverview.onclick=null;
  trajectoryToggle.disabled=true;camerasToggle.disabled=true;
}
async function loadPoseData(scene){
  try{
    const response=await fetch(scene.trajectory);
    if(!response.ok)throw new Error(`Trajectory HTTP ${response.status}`);
    const data=await response.json();
    if(data.scene!==scene.id||data.frame_count!==scene.trajectory_frames||data.poses.length!==data.frame_count||data.poses.some(pose=>pose.length!==7||pose.some(value=>!Number.isFinite(value))))throw new Error('Trajectory does not match this map');
    return data;
  }catch(error){console.warn('Camera trajectory unavailable:',error);return null;}
}
function makePoseOverlay(THREE,data){
  const scene=new THREE.Scene(),pathGroup=new THREE.Group(),cameraGroup=new THREE.Group();
  scene.add(pathGroup,cameraGroup);
  // Saved OpenCV C2W positions use exactly the same native world frame as
  // the PLY. No extra rotation, scale alignment or GT trajectory is applied.
  const centers=data.poses.map(pose=>new THREE.Vector3(...pose.slice(0,3)));
  const bounds=new THREE.Box3().setFromPoints(centers);
  const span=Math.max(bounds.getSize(new THREE.Vector3()).length(),.001);
  const depth=span*.012;
  const pathGeometry=new THREE.BufferGeometry().setFromPoints(centers);
  const pathMaterial=new THREE.LineBasicMaterial({color:0x35d9ed,depthTest:false,depthWrite:false});
  const path=new THREE.Line(pathGeometry,pathMaterial);pathGroup.add(path);
  // Bound glyph density only; the trajectory line retains EVERY saved frame.
  const candidates=data.keyframe_indices.length?data.keyframe_indices:data.poses.map((_,i)=>i);
  const indices=new Set([0,data.frame_count-1,data.initial_frame]);
  const count=Math.min(28,candidates.length);
  for(let i=0;i<count;i++)indices.add(candidates[Math.round(i*(candidates.length-1)/Math.max(1,count-1))]);
  const [fx,fy,cx,cy]=data.intrinsics,[width,height]=data.resolution_wh;
  const corners=[[0,0],[width,0],[width,height],[0,height]].map(([u,v])=>new THREE.Vector3((u-cx)/fx*depth,(v-cy)/fy*depth,depth));
  const vertices=[];
  function edge(a,b){vertices.push(a.x,a.y,a.z,b.x,b.y,b.z);}
  for(const index of indices){
    const pose=data.poses[index],origin=centers[index],q=new THREE.Quaternion(...pose.slice(3)).normalize();
    const points=corners.map(point=>point.clone().applyQuaternion(q).add(origin));
    points.forEach((point,i)=>{edge(origin,point);edge(point,points[(i+1)%4]);});
    // A small roof triangle identifies camera-up and distinguishes roll.
    const roof=new THREE.Vector3((width/2-cx)/fx*depth,(-height*.2-cy)/fy*depth,depth).applyQuaternion(q).add(origin);
    edge(points[0],roof);edge(roof,points[1]);
  }
  const cameraGeometry=new THREE.BufferGeometry();cameraGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  const cameraMaterial=new THREE.LineBasicMaterial({color:0xffbd52,depthTest:false,depthWrite:false});
  cameraGroup.add(new THREE.LineSegments(cameraGeometry,cameraMaterial));
  const endpointGeometry=new THREE.SphereGeometry(depth*.22,8,6);
  const startMaterial=new THREE.MeshBasicMaterial({color:0x67e09a,depthTest:false,depthWrite:false});
  const endMaterial=new THREE.MeshBasicMaterial({color:0xff6d79,depthTest:false,depthWrite:false});
  const start=new THREE.Mesh(endpointGeometry,startMaterial),end=new THREE.Mesh(endpointGeometry,endMaterial);
  start.position.copy(centers[0]);end.position.copy(centers.at(-1));pathGroup.add(start,end);
  pathGroup.visible=trajectoryToggle.checked;cameraGroup.visible=camerasToggle.checked;
  viewerRoot.dataset.trajectoryFrames=data.frame_count;viewerRoot.dataset.cameraPoses=indices.size;
  return {scene,pathGroup,cameraGroup,path,bounds,depth,dispose(){pathGeometry.dispose();pathMaterial.dispose();cameraGeometry.dispose();cameraMaterial.dispose();endpointGeometry.dispose();startMaterial.dispose();endMaterial.dispose();scene.clear();}};
}
function drawPoseOverlay(camera){
  if(!poseOverlay||(!poseOverlay.pathGroup.visible&&!poseOverlay.cameraGroup.visible))return;
  // Composite AFTER splats, as a clearly toggleable overlay through walls.
  // Viewer 0.4.7's threeScene option draws before splats and would hide the
  // path under Gaussian alpha blending instead of displaying this overlay.
  const autoClear=renderer.autoClear;renderer.autoClear=false;
  renderer.clearDepth();renderer.render(poseOverlay.scene,camera);renderer.autoClear=autoClear;
}
function installPoseControls(THREE,camera,getControls){
  trajectoryToggle.disabled=!poseOverlay;camerasToggle.disabled=!poseOverlay;
  viewerOverview.disabled=!poseOverlay;
  viewerOverview.onclick=()=>{
    if(!poseOverlay)return;
    const center=poseOverlay.bounds.getCenter(new THREE.Vector3());
    const radius=Math.max(poseOverlay.bounds.getSize(new THREE.Vector3()).length()/2,poseOverlay.depth*5);
    const fov=Math.min(camera.fov,THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*camera.aspect)));
    const distance=radius/Math.sin(THREE.MathUtils.degToRad(fov)/2)*1.25;
    const up=camera.up.clone().normalize();
    const offset=camera.position.clone().sub(center).projectOnPlane(up);
    if(offset.length()<radius*.1){camera.getWorldDirection(offset);offset.negate().projectOnPlane(up);}
    if(offset.length()<1e-6)offset.crossVectors(up,new THREE.Vector3(1,0,0));
    // An oblique view avoids showing nearly planar room trajectories edge-on.
    offset.normalize().addScaledVector(up,.8).normalize();
    camera.position.copy(center).add(offset.multiplyScalar(distance));
    camera.far=Math.max(500,distance+radius*4);camera.updateProjectionMatrix();camera.lookAt(center);
    const orbit=getControls();if(orbit){orbit.target.copy(center);orbit.update();}
    scheduleRender();
  };
}
function installCameraPlayback(THREE,camera,getControls,data){
  const play=document.querySelector('#cameraPlay'),seek=document.querySelector('#cameraSeek'),label=document.querySelector('#cameraFrame'),speed=document.querySelector('#cameraSpeed');
  if(!data?.poses?.length)return;
  const poses=data.poses,n=poses.length;let progress=0,playing=false,last=0;
  const qa=new THREE.Quaternion(),qb=new THREE.Quaternion(),forward=new THREE.Vector3(),target=new THREE.Vector3();
  function apply(){
    const index=progress*(n-1),i=Math.min(n-2,Math.floor(index)),u=index-i,a=poses[i],b=poses[i+1];
    camera.position.set(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u);
    qa.fromArray(a.slice(3));qb.fromArray(b.slice(3));qa.slerp(qb,u).normalize();
    forward.set(0,0,1).applyQuaternion(qa);camera.up.set(0,-1,0).applyQuaternion(qa);
    target.copy(camera.position).addScaledVector(forward,2);camera.lookAt(target);
    const orbit=getControls();if(orbit){orbit.target.copy(target);orbit.update();}
    seek.value=String(progress);label.textContent=`${Math.round(index)+1} / ${n}`;
    viewerRoot.dataset.cameraFrame=String(Math.round(index));
  }
  function stop(){playing=false;last=0;play.textContent='Play camera path';play.setAttribute('aria-pressed','false');const orbit=getControls();if(orbit)orbit.enabled=true;}
  play.disabled=false;seek.disabled=false;seek.value=0;label.textContent=`1 / ${n}`;
  play.onclick=()=>{if(playing){stop();return;}if(progress>=1)progress=0;playing=true;last=0;const orbit=getControls();if(orbit)orbit.enabled=false;play.textContent='Pause camera path';play.setAttribute('aria-pressed','true');apply();scheduleRender();};
  seek.oninput=()=>{stop();progress=Number(seek.value);apply();scheduleRender();};
  pathPlayback={stop,update(time){if(!playing)return;if(last)progress=Math.min(1,progress+(time-last)/(Number(speed.value)*1000));last=time;apply();if(progress>=1)stop();}};
  viewerRoot.onpointerdown=()=>stop();
  const reset=viewerReset.onclick;viewerReset.onclick=()=>{stop();reset?.();};
  const overview=viewerOverview.onclick;viewerOverview.onclick=()=>{stop();overview?.();};
}
for(const [toggle,key] of [[trajectoryToggle,'pathGroup'],[camerasToggle,'cameraGroup']])toggle.addEventListener('change',()=>{if(poseOverlay)poseOverlay[key].visible=toggle.checked;scheduleRender();});
function makeRenderer(THREE,camera){
  renderer=new THREE.WebGLRenderer({antialias:false,alpha:false});
  const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');
  const software=debug&&/SwiftShader|llvmpipe|Software/i.test(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL));
  frameInterval=1000/(software?8:30);
  viewerRoot.appendChild(renderer.domElement);
  function resize(){
    const width=viewerRoot.clientWidth,height=viewerRoot.clientHeight;
    // Retain full Gaussian geometry; lower only raster resolution for browsers
    // using a CPU WebGL implementation so the rest of the page stays usable.
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5,software?640/width:1.5));
    camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
  }
  resize();resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewerRoot);
}
function markReady(label){
  viewerOverlay.hidden=true;viewerRoot.setAttribute('aria-busy','false');
  setViewerStatus(label,true);viewerReset.disabled=false;scheduleRender();
}
async function loadMap(scene,revision){
  if(revision!==loadRevision)return;
  await cleanViewer();
  if(revision!==loadRevision)return;
  try{
    const [THREE,G,poseData]=await Promise.all([import('three'),import('https://cdn.jsdelivr.net/npm/@mkkellogg/gaussian-splats-3d@0.4.7/build/gaussian-splats-3d.module.js'),loadPoseData(scene)]);
    if(revision!==loadRevision)return;
    const camera=new THREE.PerspectiveCamera(scene.fov,1,.02,500);
    // Each map has its own exact saved C2W pose, not office0's coordinate frame.
    const position=new THREE.Vector3(...scene.position),target=new THREE.Vector3(...scene.target);
    camera.position.copy(position);camera.up.set(...scene.up);camera.lookAt(target);makeRenderer(THREE,camera);
    splatViewer=new G.Viewer({selfDrivenMode:false,renderer,camera,useBuiltInControls:true,gpuAcceleratedSort:false,enableSIMDInSort:false,sharedMemoryForWorkers:false,integerBasedSort:false,halfPrecisionCovariancesOnGPU:true,sceneRevealMode:G.SceneRevealMode.Instant,renderMode:G.RenderMode.Always,logLevel:G.LogLevel.None,sphericalHarmonicsDegree:0});
    await splatViewer.addSplatScene(scene.src,{showLoadingUI:false,progressiveLoad:true,splatAlphaRemovalThreshold:5,scale:[1,1,1]});
    if(revision!==loadRevision){await cleanViewer();return;}
    if(poseData)poseOverlay=makePoseOverlay(THREE,poseData);
    function reset(){camera.position.copy(position);camera.up.set(...scene.up);camera.lookAt(target);if(splatViewer.controls){splatViewer.controls.target.copy(target);splatViewer.controls.update();}}
    reset();viewerReset.onclick=reset;
    installPoseControls(THREE,camera,()=>splatViewer.controls);
    installCameraPlayback(THREE,camera,()=>splatViewer.controls,poseData);
    draw=()=>{splatViewer.update();splatViewer.render();drawPoseOverlay(camera);};
    viewerRoot.dataset.loadedScene=scene.id;
    markReady(`${mapLabel(scene)} · ${mapSize(scene)}`);
  }catch(error){
    if(revision!==loadRevision){await cleanViewer();return;}
    console.warn('Gaussian viewer unavailable; attempting point-cloud preview.',error);
    await cleanViewer();setViewerStatus('Preparing point-cloud preview');
    try{
      const THREE=await import('three');
      const {PLYLoader}=await import('three/addons/loaders/PLYLoader.js');
      const {OrbitControls}=await import('three/addons/controls/OrbitControls.js');
      const poseData=await loadPoseData(scene);
      if(revision!==loadRevision)return;
      const geometry=await new PLYLoader().loadAsync(scene.src);
      if(revision!==loadRevision){geometry.dispose();return;}
      const camera=new THREE.PerspectiveCamera(scene.fov,1,.02,500);makeRenderer(THREE,camera);
      const pointScene=new THREE.Scene();pointScene.background=new THREE.Color(0x0b1722);
      const material=new THREE.PointsMaterial({size:.018,sizeAttenuation:true,color:0x94c9d0});
      pointScene.add(new THREE.Points(geometry,material));
      disposeFallback=()=>{geometry.dispose();material.dispose();};
      controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
      if(poseData)poseOverlay=makePoseOverlay(THREE,poseData);
      function reset(){controls.target.set(...scene.target);camera.position.set(...scene.position);camera.up.set(...scene.up);camera.lookAt(controls.target);controls.update();}
      reset();viewerReset.onclick=reset;
      installPoseControls(THREE,camera,()=>controls);
      installCameraPlayback(THREE,camera,()=>controls,poseData);
      draw=()=>{controls.update();renderer.render(pointScene,camera);drawPoseOverlay(camera);};
      viewerRoot.dataset.loadedScene=scene.id;
      markReady(`${mapLabel(scene)} · Point cloud`);
    }catch(fallbackError){
      if(revision!==loadRevision){await cleanViewer();return;}
      console.warn('Interactive preview unavailable.',fallbackError);
      await cleanViewer();setViewerStatus('Interactive view unavailable');
      viewerRoot.setAttribute('aria-busy','false');
      viewerOverlay.innerHTML='<b>Interactive map could not load</b><small>Check your connection and WebGL support, or download the map below.</small><button type="button" data-action="load">Try again</button>';
    }
  }
}
function loadViewer(){
  viewerStarted=true;const revision=++loadRevision,scene=selectedMap;
  cancelAnimationFrame(frame);frame=0;draw=null;viewerReset.disabled=true;
  viewerOverview.disabled=true;trajectoryToggle.disabled=true;camerasToggle.disabled=true;
  viewerRoot.dataset.loadedScene='';viewerRoot.setAttribute('aria-busy','true');
  viewerOverlay.hidden=false;
  viewerOverlay.innerHTML='<span class="spinner"></span><b>Loading Gaussian map</b><small></small>';
  viewerOverlay.querySelector('small').textContent=`${mapLabel(scene)} · ${mapSize(scene)}`;
  setViewerStatus(`Loading ${mapLabel(scene)}`);
  // Serialize teardown/loading. Fast scene changes cannot leave two live
  // maps, renderers, or an obsolete download's camera on screen.
  viewerQueue=viewerQueue.catch(error=>console.warn('Viewer request:',error)).then(()=>loadMap(scene,revision));
}
viewerOverlay.addEventListener('click',event=>{if(event.target.closest('[data-action="load"]'))loadViewer();});
function selectMap(scene,load=false){
  selectedMap=scene;viewerPicker.value=scene.id;
  viewerThumbs.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scene===scene.id)));
  viewerRoot.setAttribute('aria-label',`Interactive ${mapLabel(scene)} Gaussian map`);
  viewerRoot.style.backgroundImage=`url("${scene.poster}")`;
  $('#viewerDownload').href=scene.src;
  $('#viewerDownload').textContent=`Download Gaussian map · ${mapSize(scene)}`;
  if(load)loadViewer();
  else{
    viewerOverlay.hidden=false;
    setViewerStatus(mapLabel(scene));
  }
}
function selectViewerDataset(dataset,load=false,focus=false){
  const scenes=viewerScenes.filter(scene=>scene.dataset===dataset);
  viewerTabs.querySelectorAll('button').forEach(button=>{
    const selected=button.dataset.dataset===dataset;
    button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
    if(selected&&focus)button.focus();
  });
  viewerPicker.replaceChildren(...scenes.map(scene=>new Option(scene.name,scene.id)));
  viewerThumbs.replaceChildren(...scenes.map(scene=>{
    const button=document.createElement('button');button.type='button';button.className='viewer-scene';button.dataset.scene=scene.id;
    button.setAttribute('aria-label',`Explore ${mapLabel(scene)} in 3D`);
    const img=document.createElement('img');Object.assign(img,{src:scene.poster,alt:'',width:220,height:134,loading:'lazy',decoding:'async'});
    button.append(img,document.createTextNode(scene.name));button.addEventListener('click',()=>selectMap(scene,true));return button;
  }));
  $('#viewerSceneCount').textContent=`${scenes.length} / ${viewerScenes.length} scenes`;
  selectMap(scenes[0],load);
}
viewerDatasets.forEach((dataset,index)=>{
  const button=document.createElement('button');button.type='button';button.dataset.dataset=dataset;button.setAttribute('role','tab');button.setAttribute('aria-controls','viewerScenes');
  const small=document.createElement('small');small.textContent=viewerScenes.filter(scene=>scene.dataset===dataset).length;
  button.append(document.createTextNode(dataset),small);
  button.addEventListener('click',()=>selectViewerDataset(dataset,viewerStarted));
  button.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight')next=(index+1)%viewerDatasets.length;
    if(event.key==='ArrowLeft')next=(index+viewerDatasets.length-1)%viewerDatasets.length;
    if(event.key==='Home')next=0;if(event.key==='End')next=viewerDatasets.length-1;
    if(next!==undefined){event.preventDefault();selectViewerDataset(viewerDatasets[next],viewerStarted,true);}
  });
  viewerTabs.append(button);
});
viewerPicker.addEventListener('change',()=>selectMap(viewerScenes.find(scene=>scene.id===viewerPicker.value),true));
selectViewerDataset(viewerDatasets[0]);
