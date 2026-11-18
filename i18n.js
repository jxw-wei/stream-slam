(() => {
  'use strict';
  const dict={
    'Queue sensitivity and patch depth rebuilding (PDF)':'队列参数与深度重算实验（PDF）',
    'Film':'视频','Explore':'三维浏览','Results':'实验结果','Paper ↗':'论文 ↗','Paper':'论文','Watch the film':'观看视频','Watch the film ↗':'观看视频 ↗',
    'Sparse Tracking and Resource-Efficient Asynchronous Mapping with 3D Gaussians':'基于稀疏跟踪与资源高效异步建图的三维高斯 SLAM',
    'REPLICA / OFFICE 0':'REPLICA / OFFICE 0','Estimated camera path':'估计相机轨迹','Explore in 3D ↗':'进入三维场景 ↗','Explore in 3D':'进入三维场景',
    'Interactive reconstruction':'交互式重建','Reconstruction results':'重建结果','Method':'方法','Abstract':'摘要','Drag to orbit · Scroll to zoom':'拖动旋转 · 滚轮缩放',
    '04:32 · English narration':'04:32 · 英文解说','English / Chinese subtitles':'中英文字幕','Download film · 1080p ↓':'下载视频 · 1080p ↓',
    'Scene':'场景','View':'视角','Browse scene thumbnails':'展开场景缩略图','Trajectory':'轨迹','Cameras':'相机位姿','Fit path':'显示完整轨迹','Reset view':'重置视角',
    'Play camera path':'播放相机轨迹','Pause camera path':'暂停相机轨迹','Camera path progress':'相机轨迹进度','Camera playback speed':'相机路径播放时长',
    'Evaluation & sources':'评测设置与数据来源','View the pipeline diagram':'查看方法流程图','Open full-size figure ↗':'查看原图 ↗','Click an image to compare':'点击图像进行对比',
    'Compare reconstructions':'重建对比','Compare with':'对比方法','Close comparison':'关闭对比','Input RGB':'输入 RGB','Input image':'输入图像',
    '1st':'第一名','2nd':'第二名','3rd':'第三名','Paper results':'论文结果','Recorded sequence evaluations':'已记录的序列评测','No valid sequence evaluation':'没有有效的序列评测记录',
    'All frames':'全部帧','Keyframes':'关键帧','Reported views':'已报告视角','Observed views':'观测视角','Non-keyframes':'非关键帧','Method-selected views':'方法指定视角','Every 5th + keyframes + last':'每隔 5 帧、关键帧及末帧','Observed views (stride 2)':'观测视角（间隔 2 帧）','Not recorded':'未记录',
    'Monocular reconstruction with 3D Gaussians · 2026':'基于三维高斯的单目重建 · 2026',
    'Play':'播放','Pause':'暂停','Mute':'静音','Unmute':'取消静音','Sound On':'声音开','Sound Off':'声音关','Fullscreen':'全屏','Exit fullscreen':'退出全屏',
    'Subtitles: English':'字幕：英文','Subtitles: Chinese':'字幕：中文','Subtitles: Off':'关闭字幕','Subtitle language':'字幕语言','Quality':'画质','Playback progress':'播放进度',
    'Click the video or press Space to play/pause':'点击画面或按空格播放/暂停','Click Play to start':'请点击播放','Buffering…':'正在缓冲…','Switching quality…':'正在切换画质…','Video failed to load. Please reload.':'视频加载失败，请刷新页面','Video unavailable. Please reload.':'视频暂时无法播放，请刷新页面',
    'Opening':'开场','Sparse to dense':'稀疏到稠密','Depth filtering':'深度滤波','Retrospective correction':'回溯校正','Asynchronous mapping':'异步建图','Scene tour':'场景漫游','Comparison':'图像对比','Accuracy':'精度','Memory':'显存','Closing':'结尾',
    'English narration · 04:32':'英文解说 · 04:32','English narration':'英文解说','English':'英文','Chinese':'中文','Evaluation':'评测设置',
    'Download 1080p MP4 ↓':'下载 1080p 视频 ↓','Chinese subtitles SRT ↓':'下载中文字幕 ↓','English SRT ↓':'下载英文字幕 ↓',
    'Loading Gaussian map':'正在加载高斯地图','Preparing point-cloud preview':'正在准备点云预览','Interactive view unavailable':'交互式预览不可用','Interactive map could not load':'三维地图加载失败','Try again':'重试','Point cloud':'点云',
    'Check your connection and WebGL support, or download the map below.':'请检查网络连接及 WebGL 支持，或下载下方地图。',
    'Recorded sequence evaluations. — means no valid sequence-level record; selected-frame metrics are excluded.':'来自已保存的序列级评测。“—”表示没有有效记录；未使用所选单帧指标代替序列结果。',
    'Paper values; only HI-SLAM2 and STREAM-SLAM share the view rule and resolution. Other baselines retain their published protocols.':'论文数值；HI-SLAM2 与 STREAM-SLAM 采用相同的视角选择和分辨率，其余基线保留各自论文的设置。',
    'Paper keyframe PSNR. Photo-SLAM has no reported fr1/desk2 result (3/4 coverage).':'论文中的关键帧 PSNR；Photo-SLAM 未报告 fr1/desk2 的结果（覆盖 3/4 个场景）。',
    'Paper observed-view PSNR; input strides differ by method. — is unavailable in the paper.':'论文中的观测视角 PSNR；各方法输入间隔不同。“—”表示论文未提供结果。',
    'Paper values; reconstruction view sets differ by method (STREAM-SLAM: non-keyframes).':'论文数值；各方法重建评测视角不同（STREAM-SLAM 使用非关键帧）。',
    'PSNR is transcribed directly from Tables 5–8 of the linked paper, not calculated from selected gallery images. TUM uses keyframes; EuRoC uses observed views; Replica and Waymo retain the method-specific evaluation protocols stated in the paper. Published baseline values and our local results are preserved exactly. “—” means the paper reports no result. Scenes outside these tables are qualitative only.':'论文场景的 PSNR 来自所链接论文的表 5–8，不是从展示图像计算的单帧指标。TUM 使用关键帧，EuRoC 使用观测视角，Replica 与 Waymo 保留论文中各方法的评测设置。其余场景补充已有序列评测。“—”表示没有有效结果。',
    'The scene table stays fixed when changing the camera view. Quantitative tables include all methods reported in the paper; qualitative images come from saved local runs and do not reproduce the source publications\' exact runs. Each image row uses the same physical input frame. Missing local renders are not substituted with another method\'s output.':'切换展示视角不会改变场景总指标。论文定量表包含已报告的方法；展示图像来自本地保存的运行。每组图像对应同一输入帧，不会用其他算法输出替代缺失图像。',
    'EuRoC: local HI-SLAM2 images use 20 Hz; STREAM-SLAM uses 10 Hz. Frames are matched by camera timestamp. KITTI 04: Photo-SLAM uses stereo input; the other displayed methods use monocular RGB.':'EuRoC 中，HI-SLAM2 图像来自 20 Hz 运行，STREAM-SLAM 为 10 Hz，按相机时间戳匹配。KITTI 04 中 Photo-SLAM 使用双目输入，其余展示方法使用单目 RGB。',
    'Monocular Gaussian SLAM estimates camera motion and builds photorealistic 3D maps from RGB video, but dense tracking and Gaussian mapping demand substantial GPU compute and memory. Replacing dense tracking with sparse tracking reduces the tracking burden, but two challenges remain when connecting a loop-closing sparse tracker to dense Gaussian mapping. First, sparse tracking provides insufficient geometric priors for dense Gaussian initialization, while existing densification either retains spatial distortions and cross-frame fluctuations after global alignment or reintroduces dense computation through windowed multiview estimation. Second, loop closure revises previously published keyframes, making the Gaussian map inconsistent with the final trajectory if these states are treated as immutable.':'单目高斯 SLAM 从 RGB 视频估计相机运动并构建逼真的三维地图，但稠密跟踪和高斯建图需要大量 GPU 计算与显存。稀疏跟踪能够降低跟踪开销，但将具有回环闭合能力的稀疏跟踪器连接到稠密高斯建图时，仍面临两个问题。首先，稀疏跟踪提供的几何先验不足以支持稠密高斯初始化；现有稠密化方法要么在全局对齐后保留空间畸变与跨帧波动，要么通过窗口多视角估计重新引入稠密计算。其次，回环闭合会修改已发布的关键帧；如果将这些状态视为不可变，高斯地图就会与最终轨迹不一致。',
    'To address these challenges, we present STREAM-SLAM, which treats tracking outputs as a stream of revisable sparse geometric states. Sparse-conditioned depth completion anchors dense geometry to tracked sparse depths, and multiview support filtering rejects unsupported Gaussian initialization. Retrospective correction uses source-keyframe ownership to propagate subsequent Sim(3), pose, and depth changes to the corresponding Gaussians. A bounded correction-aware asynchronous protocol decouples tracking and mapping while ensuring complete delivery of keyframes and corrections.':'为此，我们提出 STREAM-SLAM，将跟踪输出表示为可修订的稀疏几何状态流。稀疏条件深度补全利用跟踪得到的稀疏深度约束稠密几何，多视角支持滤波剔除缺乏支持的高斯初始化。回溯校正通过来源关键帧归属，将后续的 Sim(3)、位姿和深度变化传播到对应的高斯。具备校正感知能力的有界异步协议解耦跟踪与建图，同时确保关键帧和校正事件完整送达。',
    'Experiments on Replica, EuRoC, TUM RGB-D, and Waymo demonstrate competitive trajectory accuracy and strong reconstruction quality with high processing efficiency and low peak GPU memory.':'在 Replica、EuRoC、TUM RGB-D 和 Waymo 上的实验表明，该方法在保持较高处理效率与较低峰值显存开销的同时，实现了具有竞争力的轨迹精度和较高的重建质量。'
  };
  dict['Paper-scene ATE and PSNR retain the linked paper’s values. Other scenes use recorded sequence evaluations. ATE is reported in centimeters for indoor datasets and EuRoC, and meters for Waymo and KITTI. Rankings are computed separately for each metric among available results: lower ATE and higher PSNR are better. Red, orange and yellow indicate the three best distinct values, including ties. “—” indicates no valid sequence-level record; no selected-frame score is used as a scene mean.']='论文场景的 ATE 与 PSNR 保留论文原始数值，其余场景使用已记录的序列级评测。室内数据集与 EuRoC 的 ATE 单位为厘米，Waymo 和 KITTI 为米。每项指标按可用结果独立排名：ATE 越低越好，PSNR 越高越好。红、橙、黄分别表示前三个不同数值，包含并列情况。“—”表示没有有效序列级记录，不使用所选单帧分数代替场景均值。';
  Object.assign(dict,{'Main navigation':'主导航','Play reconstruction animation':'播放重建动画','Pause reconstruction animation':'暂停重建动画','Dataset':'数据集','Camera playback speed':'相机路径播放时长','Open full-size method diagram':'查看完整方法图','Download Gaussian map':'下载高斯地图','Native observed views':'原生观测视角'});
  const originals=new WeakMap(),attributes=new WeakMap();let lang='en';
  const toggle=document.querySelector('#languageSwitch');
  function translate(s){
    const trimmed=s.trim();let value=dict[trimmed];
    if(!value){value=trimmed.replace(/^Download Gaussian map/,'下载高斯地图').replace(/^Loading /,'正在加载 ').replace(/ · Paper results$/,' · 论文结果').replace(/ · Recorded sequence evaluations$/,' · 序列评测记录').replace(/^Frame /,'帧 ').replace(/common hardware/g,'同硬件').replace(/^(\d+) scenes · (\d+) views$/,'$1 个场景 · $2 个视角').replace(/(\d+) \/ (\d+) scenes/,'$1 / $2 个场景').replace(/^Rank (\d+)/,'第 $1 名').replace(/Paper Table (\d+)/g,'论文表 $1');}
    value=value.replace(/^frame /i,'帧 ').replace(/Native observed views \((\d+) frames\)/,'原生观测视角（$1 帧）');
    return s.replace(trimmed,value);
  }
  const observer=new MutationObserver(()=>apply());
  function apply(){
    observer.disconnect();
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
    while(n=walker.nextNode()){
      if(!n.nodeValue.trim()||n.parentElement.closest('script,style,#captionText,#languageSwitch'))continue;
      let record=originals.get(n);if(!record||n.nodeValue!==record.last&&n.nodeValue!==record.original)record={original:n.nodeValue};
      record.last=lang==='zh'?translate(record.original):record.original;if(n.nodeValue!==record.last)n.nodeValue=record.last;originals.set(n,record);
    }
    for(const element of document.querySelectorAll('[aria-label],[title]')){
      const records=attributes.get(element)||{};
      for(const key of ['aria-label','title']){if(!element.hasAttribute(key)||element===toggle)continue;const current=element.getAttribute(key);let record=records[key];if(!record||current!==record.last&&current!==record.original)record={original:current};record.last=lang==='zh'?translate(record.original):record.original;if(current!==record.last)element.setAttribute(key,record.last);records[key]=record;}
      attributes.set(element,records);
    }
    document.documentElement.lang=lang==='zh'?'zh-CN':'en';
    if(toggle){toggle.textContent=lang==='zh'?'English':'中文';toggle.setAttribute('aria-label',lang==='zh'?'Switch to English':'切换到中文');}
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  }
  function setLanguage(value){lang=value==='zh'?'zh':'en';apply();
    if(toggle){try{localStorage.setItem('stream-site-language',lang)}catch(_){}document.querySelector('#projectFilm')?.contentWindow.postMessage({type:'stream-site-language',language:lang},location.origin);}
    else window.setFilmLocale?.(lang);
  }
  window.setSiteLanguage=setLanguage;
  if(toggle){toggle.addEventListener('click',()=>setLanguage(lang==='en'?'zh':'en'));try{lang=localStorage.getItem('stream-site-language')||'en'}catch(_){}document.querySelector('#projectFilm')?.addEventListener('load',()=>setLanguage(lang));}
  else window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='stream-site-language')setLanguage(e.data.language)});
  setLanguage(lang);
})();
