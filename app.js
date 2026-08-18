import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// -----------------------------------------------------------------------------
// Drone Designer Lab — clean, build-free GitHub Pages app.
// The models are generated procedurally so each selected component becomes part
// of a connected 3D structure instead of being placed as independent sprites.
// -----------------------------------------------------------------------------

const $ = (id) => document.getElementById(id);

const dom = {
  stageLabel: $('stageLabel'),
  progressFill: $('progressFill'),
  stageKicker: $('stageKicker'),
  stageTitle: $('stageTitle'),
  stageSubtitle: $('stageSubtitle'),
  choiceGrid: $('choiceGrid'),
  customizer: $('customizer'),
  missionFeedback: $('missionFeedback'),
  prevBtn: $('prevBtn'),
  nextBtn: $('nextBtn'),
  restartBtn: $('restartBtn'),
  resetViewBtn: $('resetViewBtn'),
  loading3d: $('loading3d'),
  sceneMessage: $('sceneMessage'),
  canvasWrap: $('canvasWrap'),
  canvas: $('droneCanvas'),
  finalOverlay: $('finalOverlay'),
  finalCanvas: $('finalCanvas'),
  designerCard: $('designerCard'),
  closeFinalBtn: $('closeFinalBtn'),
  flyAgainBtn: $('flyAgainBtn'),
  printCardBtn: $('printCardBtn'),
  newDesignBtn: $('newDesignBtn'),
};

const COLORS = [
  { name: 'بنفسجي', hex: '#6b3cc5' },
  { name: 'أزرق', hex: '#3185d8' },
  { name: 'أحمر', hex: '#d94b58' },
  { name: 'أخضر', hex: '#2fa56f' },
  { name: 'أصفر', hex: '#e1b932' },
  { name: 'برتقالي', hex: '#e77f34' },
  { name: 'أسود', hex: '#252631' },
  { name: 'أبيض', hex: '#f1f2f4' },
];

const TYPES = {
  multirotor: {
    ar: 'متعدد المراوح', en: 'Multirotor', icon: '🛸',
    tradeoffs: [['🎯 ثابت وسهل التحكم', 'good'], ['🔋 وقت طيران متوسط', 'warn']],
    base: { speed: 64, endurance: 55, lift: 58, stability: 72 },
  },
  fixed: {
    ar: 'جناح ثابت', en: 'Fixed Wing', icon: '✈️',
    tradeoffs: [['⚡ سريع وفعّال', 'good'], ['↗ يحتاج حركة للإقلاع', 'warn']],
    base: { speed: 80, endurance: 74, lift: 38, stability: 62 },
  },
  vtol: {
    ar: 'إقلاع عمودي', en: 'VTOL', icon: '🛫',
    tradeoffs: [['↕ يقلع عموديًا', 'good'], ['⚙️ تصميم أكثر تعقيدًا', 'warn']],
    base: { speed: 72, endurance: 57, lift: 61, stability: 67 },
  },
  helicopter: {
    ar: 'مروحية', en: 'Helicopter', icon: '🚁',
    tradeoffs: [['🎯 تحويم ممتاز', 'good'], ['⚙️ نظام مراوح خاص', 'warn']],
    base: { speed: 59, endurance: 51, lift: 65, stability: 74 },
  },
};

const BODIES = {
  multirotor: [
    { id: 'compact', ar: 'هيكل مدمج', en: 'Compact X-Frame', icon: '◇', supports: ['quad'], mods: { speed: 10, endurance: 5, lift: -2, stability: -5 }, tradeoffs: [['⚡ خفيف وسريع','good'],['💪 حمولة أقل','warn']] },
    { id: 'wide', ar: 'هيكل عريض', en: 'Wide Frame', icon: '✣', supports: ['quad','hexa'], mods: { speed: 0, endurance: 0, lift: 5, stability: 10 }, tradeoffs: [['🎯 ثبات أعلى','good'],['↔ أكبر حجمًا','warn']] },
    { id: 'heavy', ar: 'هيكل قوي', en: 'Heavy Frame', icon: '⬡', supports: ['hexa','octo'], mods: { speed: -9, endurance: -6, lift: 15, stability: 11 }, tradeoffs: [['💪 قوي للحمل','good'],['🔋 يحتاج طاقة أكثر','warn']] },
  ],
  fixed: [
    { id: 'glider', ar: 'هيكل انسيابي', en: 'Glider Body', icon: '➤', supports: ['single'], mods: { speed: -2, endurance: 17, lift: 0, stability: 7 }, tradeoffs: [['🔋 طيران طويل','good'],['💪 حمولة خفيفة','warn']] },
    { id: 'sport', ar: 'هيكل رياضي', en: 'Sport Wing', icon: '➣', supports: ['single','twin'], mods: { speed: 15, endurance: -2, lift: 0, stability: -2 }, tradeoffs: [['⚡ سريع','good'],['🎯 ثبات أقل','warn']] },
    { id: 'cargo', ar: 'هيكل حمولة', en: 'Cargo Wing', icon: '➤', supports: ['twin'], mods: { speed: -9, endurance: -4, lift: 17, stability: 10 }, tradeoffs: [['📦 مناسب للحمل','good'],['⚡ أبطأ','warn']] },
  ],
  vtol: [
    { id: 'quadplane', ar: 'جناح رباعي', en: 'Quadplane', icon: '✈', supports: ['vtol5'], mods: { speed: 2, endurance: 2, lift: 4, stability: 8 }, tradeoffs: [['⚖️ متوازن','good'],['⚙️ 5 محركات','warn']] },
    { id: 'tiltwing', ar: 'جناح مائل', en: 'Tilt-Wing', icon: '⟰', supports: ['tilt4'], mods: { speed: 14, endurance: 1, lift: -2, stability: -3 }, tradeoffs: [['⚡ أسرع','good'],['🎯 يحتاج تحكمًا أدق','warn']] },
    { id: 'vtolcargo', ar: 'هيكل VTOL قوي', en: 'Cargo VTOL', icon: '⬢', supports: ['vtol7'], mods: { speed: -8, endurance: -5, lift: 18, stability: 10 }, tradeoffs: [['💪 رفع قوي','good'],['🔋 استهلاك أعلى','warn']] },
  ],
  helicopter: [
    { id: 'scout', ar: 'هيكل استطلاع', en: 'Scout Body', icon: '◒', supports: ['standard'], mods: { speed: 11, endurance: 3, lift: -4, stability: 0 }, tradeoffs: [['⚡ خفيف','good'],['💪 حمولة أقل','warn']] },
    { id: 'utility', ar: 'هيكل خدمي', en: 'Utility Body', icon: '⬭', supports: ['standard','coaxial'], mods: { speed: 0, endurance: 0, lift: 7, stability: 9 }, tradeoffs: [['🎯 متوازن','good'],['⚙️ أكبر قليلًا','warn']] },
    { id: 'heliheavy', ar: 'هيكل ثقيل', en: 'Heavy Lift Body', icon: '⬯', supports: ['triple'], mods: { speed: -10, endurance: -7, lift: 18, stability: 10 }, tradeoffs: [['💪 رفع قوي','good'],['🔋 يحتاج بطارية أكبر','warn']] },
  ],
};

const MOTORS = {
  multirotor: [
    { id:'quad', ar:'4 محركات', en:'Quadcopter', count:4, icon:'4×', mods:{speed:5,endurance:8,lift:0,stability:0}, tradeoffs:[['🔋 فعّال','good'],['💪 رفع متوسط','warn']] },
    { id:'hexa', ar:'6 محركات', en:'Hexacopter', count:6, icon:'6×', mods:{speed:0,endurance:-5,lift:13,stability:8}, tradeoffs:[['💪 رفع أكبر','good'],['🔋 طاقة أكثر','warn']] },
    { id:'octo', ar:'8 محركات', en:'Octocopter', count:8, icon:'8×', mods:{speed:-5,endurance:-11,lift:20,stability:12}, tradeoffs:[['💪 رفع قوي جدًا','good'],['🔋 استهلاك مرتفع','warn']] },
  ],
  fixed: [
    { id:'single', ar:'محرك واحد', en:'Single Motor', count:1, icon:'1×', mods:{speed:2,endurance:8,lift:-2,stability:0}, tradeoffs:[['🔋 أخف وأوفر','good'],['💪 قوة أقل','warn']] },
    { id:'twin', ar:'محركان', en:'Twin Motor', count:2, icon:'2×', mods:{speed:7,endurance:-3,lift:11,stability:5}, tradeoffs:[['💪 قوة أكبر','good'],['🔋 استهلاك أعلى','warn']] },
  ],
  vtol: [
    { id:'tilt4', ar:'4 محركات مائلة', en:'4 Tilt Motors', count:4, icon:'4×', mods:{speed:13,endurance:1,lift:2,stability:-3}, tradeoffs:[['⚡ انتقال سريع','good'],['🎯 تحكم أدق','warn']] },
    { id:'vtol5', ar:'5 محركات', en:'4 Lift + 1 Cruise', count:5, icon:'5×', mods:{speed:4,endurance:-2,lift:8,stability:8}, tradeoffs:[['⚖️ متوازن','good'],['⚙️ نظام مزدوج','warn']] },
    { id:'vtol7', ar:'7 محركات', en:'6 Lift + 1 Cruise', count:7, icon:'7×', mods:{speed:-3,endurance:-10,lift:20,stability:13}, tradeoffs:[['💪 رفع قوي','good'],['🔋 طاقة عالية','warn']] },
  ],
  helicopter: [
    { id:'standard', ar:'محرك رئيسي + خلفي', en:'Main + Tail', count:2, icon:'2×', mods:{speed:4,endurance:5,lift:0,stability:2}, tradeoffs:[['⚖️ بسيط ومتوازن','good'],['↻ يحتاج مروحة خلفية','warn']] },
    { id:'coaxial', ar:'محركان رئيسيان', en:'Coaxial Rotors', count:2, icon:'⇅', mods:{speed:-2,endurance:-2,lift:12,stability:12}, tradeoffs:[['🎯 ثابت جدًا','good'],['⚙️ أعقد','warn']] },
    { id:'triple', ar:'3 محركات', en:'Twin Main + Tail', count:3, icon:'3×', mods:{speed:-5,endurance:-9,lift:20,stability:10}, tradeoffs:[['💪 رفع ثقيل','good'],['🔋 استهلاك كبير','warn']] },
  ],
};

const PROPS = {
  multirotor: [
    { id:'two', ar:'مروحة بشفرتين', en:'2-Blade', icon:'➖', blades:2, scale:1, mods:{speed:6,endurance:6,lift:0,stability:-1}, tradeoffs:[['⚡ سريعة وفعّالة','good'],['💪 رفع متوسط','warn']] },
    { id:'three', ar:'مروحة بثلاث شفرات', en:'3-Blade', icon:'✦', blades:3, scale:.96, mods:{speed:1,endurance:-5,lift:9,stability:5}, tradeoffs:[['💪 دفع أكبر','good'],['🔋 طاقة أكثر','warn']] },
    { id:'large', ar:'مروحة كبيرة', en:'Large 2-Blade', icon:'━', blades:2, scale:1.22, mods:{speed:-5,endurance:-6,lift:13,stability:4}, tradeoffs:[['⬆ رفع أكبر','good'],['🐢 استجابة أبطأ','warn']] },
  ],
  fixed: [], vtol: [], helicopter: [
    { id:'two', ar:'مروحة رئيسية بشفرتين', en:'2-Blade Rotor', icon:'➖', blades:2, scale:1, mods:{speed:7,endurance:6,lift:-2,stability:-3}, tradeoffs:[['⚡ خفيفة','good'],['🎯 ثبات أقل','warn']] },
    { id:'three', ar:'مروحة رئيسية 3 شفرات', en:'3-Blade Rotor', icon:'✦', blades:3, scale:.97, mods:{speed:1,endurance:-3,lift:8,stability:6}, tradeoffs:[['🎯 متوازنة','good'],['🔋 استهلاك أعلى','warn']] },
    { id:'four', ar:'مروحة رئيسية 4 شفرات', en:'4-Blade Rotor', icon:'✚', blades:4, scale:.92, mods:{speed:-5,endurance:-8,lift:14,stability:11}, tradeoffs:[['💪 رفع وثبات','good'],['🔋 طاقة أكبر','warn']] },
  ],
};
PROPS.fixed = PROPS.multirotor;
PROPS.vtol = PROPS.multirotor;

const BATTERIES = [
  { id:'small', ar:'بطارية صغيرة', en:'Small Battery', icon:'▰', mods:{speed:8,endurance:-16,lift:5,stability:-1}, tradeoffs:[['🪶 خفيفة','good'],['🔋 وقت أقصر','warn']] },
  { id:'medium', ar:'بطارية متوسطة', en:'Medium Battery', icon:'▰▰', mods:{speed:0,endurance:5,lift:0,stability:1}, tradeoffs:[['⚖️ متوازنة','good'],['🔋 وقت متوسط','warn']] },
  { id:'large', ar:'بطارية كبيرة', en:'Large Battery', icon:'▰▰▰', mods:{speed:-7,endurance:22,lift:-7,stability:3}, tradeoffs:[['🔋 طيران أطول','good'],['⚖️ وزن أكبر','warn']] },
];

const CAMERAS = [
  { id:'none', ar:'بدون كاميرا', en:'No Camera', icon:'○', mods:{speed:3,endurance:2,lift:2,stability:0}, tradeoffs:[['🪶 أخف','good'],['📷 لا يمكن التصوير','warn']] },
  { id:'front', ar:'كاميرا أمامية', en:'Front Camera', icon:'📷', mods:{speed:-1,endurance:-2,lift:-2,stability:0}, tradeoffs:[['👀 رؤية للأمام','good'],['⚖️ وزن إضافي بسيط','warn']] },
  { id:'bottom', ar:'كاميرا سفلية', en:'Bottom Camera', icon:'🎥', mods:{speed:-2,endurance:-3,lift:-2,stability:1}, tradeoffs:[['🗺 ممتازة للتصوير من الأعلى','good'],['⚖️ وزن إضافي','warn']] },
];

const MISSIONS = [
  { id:'photo', ar:'التصوير', en:'Photography', icon:'📸', desc:'اختبر ثبات الدرون والكاميرا ووقت الطيران.' },
  { id:'delivery', ar:'التوصيل', en:'Delivery', icon:'📦', desc:'حمّل طردًا واختبر قوة الرفع والثبات.' },
  { id:'rescue', ar:'الإنقاذ', en:'Rescue', icon:'🚑', desc:'طِر إلى موقع الإنقاذ ثم عُد بأمان.' },
  { id:'explore', ar:'الاستكشاف', en:'Exploration', icon:'🗺️', desc:'اختبر السرعة ووقت الطيران أثناء الاستكشاف.' },
];

const STAGES = [
  { id:'type', kicker:'ابدأ التصميم', title:'اختر نوع الدرون', subtitle:'كل نوع يطير بطريقة مختلفة. اختر النوع الذي تريد تصميمه.' },
  { id:'body', kicker:'الهيكل • Frame', title:'اختر جسم الدرون', subtitle:'الهيكل يحمل القطع ويحدد حجم الدرون وشكله.' },
  { id:'motors', kicker:'المحركات • Motors', title:'اختر نظام المحركات', subtitle:'المحركات تعطي الدرون القوة اللازمة لتحريك المراوح.' },
  { id:'propeller', kicker:'المراوح • Propellers', title:'اختر نوع المراوح', subtitle:'شكل المروحة يغيّر الدفع واستهلاك الطاقة.' },
  { id:'battery', kicker:'البطارية • Battery', title:'اختر البطارية', subtitle:'البطارية الأكبر تعطي وقتًا أطول، لكنها تزيد الوزن.' },
  { id:'camera', kicker:'الكاميرا • Camera', title:'أضف الكاميرا', subtitle:'اختر مكان الكاميرا أو صمّم درونًا بدون كاميرا.' },
  { id:'customize', kicker:'استوديو التصميم', title:'لوّن درونك 🎨', subtitle:'اختر اللون الرئيسي والثانوي ولون المراوح.' },
  { id:'name', kicker:'هوية التصميم', title:'سمِّ درونك', subtitle:'ضع اسمًا لتصميمك وأدخل اسم المصمم لبطاقة النهاية.' },
  { id:'mission', kicker:'مختبر المهمة', title:'اختر مهمة واختبر تصميمك 🚀', subtitle:'سنرى كيف يتصرف درونك الحقيقي حسب القرارات التي اتخذتها.' },
];

const freshState = () => ({
  stage: 0,
  type: null,
  body: null,
  motors: null,
  propeller: null,
  battery: null,
  camera: null,
  colors: { main:'#6b3cc5', secondary:'#25b8aa', prop:'#252631' },
  droneName: '',
  designerName: '',
  mission: null,
  missionTested: false,
  missionResult: null,
});
let state = freshState();

// --- Three.js main scene ------------------------------------------------------
let renderer, scene, camera, controls, droneGroup;
let propellerRotors = [];
let missionAnimation = null;
let initialCamera = { pos:new THREE.Vector3(7.4,5.7,8.1), target:new THREE.Vector3(0,.45,0) };
let finalRenderer, finalScene, finalCamera, finalDroneGroup, finalRotors = [], finalFlyStart = 0;

const mat = (color, roughness=.6, metalness=.15) => new THREE.MeshStandardMaterial({ color, roughness, metalness });

function init3D(){
  renderer = new THREE.WebGLRenderer({ canvas:dom.canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(34,1,.1,100);
  camera.position.copy(initialCamera.pos);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .07;
  controls.minDistance = 5.2;
  controls.maxDistance = 13;
  controls.maxPolarAngle = Math.PI*.48;
  controls.minPolarAngle = Math.PI*.12;
  controls.target.copy(initialCamera.target);

  scene.add(new THREE.HemisphereLight(0xffffff,0x796d8d,2.15));
  const key = new THREE.DirectionalLight(0xffffff,3.0);
  key.position.set(5,8,6); key.castShadow = true; key.shadow.mapSize.set(2048,2048); scene.add(key);
  const rim = new THREE.DirectionalLight(0x8adfd4,1.25); rim.position.set(-5,4,-4); scene.add(rim);

  const platform = new THREE.Mesh(new THREE.CylinderGeometry(4.1,4.25,.18,80), mat(0xffffff,.85,0));
  platform.position.y = -.16; platform.receiveShadow = true; scene.add(platform);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.25,.025,10,100), mat(0x7f62b8,.7,.05));
  ring.rotation.x = Math.PI/2; ring.position.y = -.055; scene.add(ring);

  const grid = new THREE.GridHelper(6.3,12,0xded6ef,0xeee9f6);
  grid.position.y = -.055; grid.material.opacity = .27; grid.material.transparent = true; scene.add(grid);

  droneGroup = new THREE.Group(); scene.add(droneGroup);
  resize3D();
  dom.loading3d.classList.add('hidden');
  window.addEventListener('resize', resize3D);
  requestAnimationFrame(animate);
}

function resize3D(){
  if(!renderer) return;
  const r = dom.canvasWrap.getBoundingClientRect();
  const w = Math.max(1,Math.floor(r.width)); const h = Math.max(1,Math.floor(r.height));
  renderer.setSize(w,h,false); camera.aspect = w/h; camera.updateProjectionMatrix();
  resizeFinal3D();
}

function resetView(){
  if(!camera || !controls) return;
  camera.position.copy(initialCamera.pos); controls.target.copy(initialCamera.target); controls.update();
}

dom.resetViewBtn.addEventListener('click',resetView);

function clearGroup(group){
  while(group.children.length){
    const child = group.children.pop();
    child.traverse?.(obj=>{
      if(obj.geometry) obj.geometry.dispose?.();
      if(obj.material){
        if(Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose?.()); else obj.material.dispose?.();
      }
    });
  }
}

function addMesh(parent, geometry, material, position=[0,0,0], rotation=[0,0,0], cast=true){
  const mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow=cast; mesh.receiveShadow=cast; parent.add(mesh); return mesh;
}

function cylinderBetween(parent, start, end, radius, material){
  const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(b,a); const len = dir.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,len,10),material);
  mesh.position.copy(a).add(b).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize());
  mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}

function rotorGroup({ parent, position, axis='y', blades=2, length=1.25, width=.12, color='#252631', spinDir=1, hubRadius=.16 }){
  const group = new THREE.Group(); group.position.set(...position); group.userData.rotorAxis=axis; group.userData.spinDir=spinDir; group.name='propellerRotor'; parent.add(group);
  const propMat = mat(color,.45,.08); const hubMat = mat(0x20202a,.35,.45);
  if(axis==='y') addMesh(group,new THREE.CylinderGeometry(hubRadius,hubRadius,.11,18),hubMat,[0,0,0]);
  else addMesh(group,new THREE.CylinderGeometry(hubRadius,hubRadius,.11,18),hubMat,[0,0,0],[0,0,Math.PI/2]);
  for(let i=0;i<blades;i++){
    const blade = addMesh(group,new THREE.BoxGeometry(length,.045,width),propMat,[length*.35,0,0]);
    if(axis==='y') blade.rotation.y = i*(Math.PI*2/blades);
    else {
      blade.position.set(0,length*.35,0);
      blade.rotation.x = i*(Math.PI*2/blades);
    }
  }
  propellerRotors.push(group); return group;
}

function canopy(parent, scale=1){
  const g = new THREE.SphereGeometry(.72*scale,24,16); g.scale(1.2,.55,.9);
  return addMesh(parent,g,mat(state.colors.secondary,.4,.25),[0,.55*scale,0]);
}

function cameraModule(parent, type, forwardAxis='x'){
  if(!type || type==='none') return;
  const bodyMat=mat(0x252631,.45,.35), lensMat=mat(0x141821,.25,.55);
  const g=new THREE.Group(); parent.add(g);
  if(forwardAxis==='x'){
    if(type==='front') g.position.set(1.05,.28,0); else g.position.set(.1,-.23,0);
    addMesh(g,new THREE.BoxGeometry(.38,.32,.44),bodyMat);
    const lens=addMesh(g,new THREE.CylinderGeometry(.12,.15,.13,18),lensMat,[type==='front'?.23:0,type==='front'?0:-.18,0]);
    lens.rotation.z = type==='front'?Math.PI/2:0;
  } else {
    if(type==='front') g.position.set(0,.25,1.05); else g.position.set(0,-.24,.05);
    addMesh(g,new THREE.BoxGeometry(.44,.32,.38),bodyMat);
    const lens=addMesh(g,new THREE.CylinderGeometry(.12,.15,.13,18),lensMat,[0,type==='front'?0:-.18,type==='front'?.23:0]);
    lens.rotation.x = type==='front'?Math.PI/2:0;
  }
}

function batteryPack(parent, size='medium', position=[0,.45,0], rotation=[0,0,0]){
  if(!size) return;
  const s = size==='small'?.78:size==='large'?1.2:1;
  const g=new THREE.Group(); g.position.set(...position); g.rotation.set(...rotation); parent.add(g);
  addMesh(g,new THREE.BoxGeometry(1.05*s,.28*s,.58*s),mat(0x333642,.55,.2));
  addMesh(g,new THREE.BoxGeometry(.22*s,.31*s,.62*s),mat(0x242631,.45,.25),[-.38*s,0,0]);
  addMesh(g,new THREE.BoxGeometry(.07*s,.09*s,.42*s),mat(0x25b8aa,.45,.05),[.15*s,.16*s,0],undefined,false);
}

function bodyChoice(){ return (BODIES[state.type]||[]).find(x=>x.id===state.body); }
function motorChoice(){ return (MOTORS[state.type]||[]).find(x=>x.id===state.motors); }
function propChoice(){ return (PROPS[state.type]||[]).find(x=>x.id===state.propeller); }

function buildDrone(target=droneGroup, finalMode=false){
  if(!target) return;
  if(target===droneGroup) { clearGroup(target); propellerRotors=[]; }
  else clearGroup(target);
  if(!state.type) {
    buildDesignPedestalMarker(target);
    return;
  }
  const savedRotors=propellerRotors;
  if(target!==droneGroup) propellerRotors=[];
  if(state.type==='multirotor') buildMultirotor(target);
  if(state.type==='fixed') buildFixedWing(target,false);
  if(state.type==='vtol') buildVTOL(target);
  if(state.type==='helicopter') buildHelicopter(target);
  target.rotation.set(0,-.45,0);
  target.position.set(0,0,0);
  if(finalMode){ finalRotors = propellerRotors.slice(); propellerRotors=savedRotors; }
}

function buildDesignPedestalMarker(parent){
  const ghost=addMesh(parent,new THREE.TorusGeometry(1.25,.055,12,80),mat(0x8e76bd,.8,.05),[0,.18,0],[Math.PI/2,0,0]);
  ghost.material.transparent=true; ghost.material.opacity=.38;
  const dot=addMesh(parent,new THREE.CylinderGeometry(.18,.18,.18,24),mat(0x25b8aa,.5,.15),[0,.22,0]);
  dot.material.transparent=true; dot.material.opacity=.72;
}

function buildMultirotor(parent){
  const b=bodyChoice(); const m=motorChoice(); const p=propChoice();
  const scale=b?.id==='compact'?.86:b?.id==='heavy'?1.13:1;
  const bodyMat=mat(state.colors.main,.48,.22), frameMat=mat(0x282a34,.44,.48), mountMat=mat(0x191a21,.35,.55);
  addMesh(parent,new THREE.CylinderGeometry(.9*scale,1.02*scale,.34*scale,8),bodyMat,[0,.25,0]);
  addMesh(parent,new THREE.CylinderGeometry(.62*scale,.68*scale,.16*scale,8),mat(0x323540,.38,.48),[0,.45,0]);
  canopy(parent,.8*scale);

  const n=m?.count||0;
  if(n){
    const armLen=b?.id==='compact'?2.05:b?.id==='heavy'?2.45:2.25;
    const y=.24;
    for(let i=0;i<n;i++){
      const a=(Math.PI*2*i/n)+(n===4?Math.PI/4:0);
      const end=[Math.cos(a)*armLen,y,Math.sin(a)*armLen];
      const start=[Math.cos(a)*.55*scale,y,Math.sin(a)*.55*scale];
      cylinderBetween(parent,start,end,.105*scale,frameMat);
      // visible structural collar: arm physically terminates into motor plate
      addMesh(parent,new THREE.CylinderGeometry(.30,.30,.11,16),mountMat,[end[0],y,end[2]]);
      addMesh(parent,new THREE.CylinderGeometry(.24,.26,.34,18),mat(0x101116,.35,.7),[end[0],y+.20,end[2]]);
      addMesh(parent,new THREE.CylinderGeometry(.13,.13,.16,16),mat(0x4f5260,.3,.7),[end[0],y+.43,end[2]]);
      if(p){
        rotorGroup({parent,position:[end[0],y+.57,end[2]],axis:'y',blades:p.blades,length:.82*p.scale,width:.105,color:state.colors.prop,spinDir:i%2?1:-1,hubRadius:.13});
      }
    }
  }
  if(state.battery) batteryPack(parent,state.battery,[0,.77*scale,0]);
  cameraModule(parent,state.camera,'x');
}

function buildFixedWing(parent, forVTOL=false){
  const b=bodyChoice(); const m=motorChoice(); const p=propChoice();
  const bodyId=b?.id||'sport';
  const mainMat=mat(state.colors.main,.48,.18), secondary=mat(state.colors.secondary,.48,.16), dark=mat(0x292b34,.4,.4);
  const fusLen=bodyId.includes('cargo')?4.2:bodyId==='glider'?4.35:3.75;
  const fusRad=bodyId.includes('cargo')?.48:.38;
  addMesh(parent,new THREE.CylinderGeometry(fusRad*.82,fusRad,fusLen,20),mainMat,[0,.36,0],[0,0,Math.PI/2]);
  addMesh(parent,new THREE.ConeGeometry(fusRad*.83,.82,20),mainMat,[fusLen/2+.35,.36,0],[0,0,-Math.PI/2]);
  addMesh(parent,new THREE.ConeGeometry(fusRad*.70,.65,16),dark,[-fusLen/2-.27,.36,0],[0,0,Math.PI/2]);

  const span=bodyId==='glider'?6.1:bodyId.includes('cargo')?5.5:4.9;
  const chord=bodyId==='glider'?.95:bodyId.includes('cargo')?1.35:1.12;
  const wing=addMesh(parent,new THREE.BoxGeometry(chord,.12,span),secondary,[-.05,.35,0]);
  if(bodyId==='sport') wing.rotation.y=.05;
  // tailplane + vertical fin are physically attached at the rear fuselage
  addMesh(parent,new THREE.BoxGeometry(.72,.09,2.05),secondary,[-1.55,.43,0]);
  const fin=addMesh(parent,new THREE.BoxGeometry(.75,.78,.10),mainMat,[-1.55,.76,0],[0,0,-.18]);

  const addNacelle=(x,z)=>{
    addMesh(parent,new THREE.CylinderGeometry(.22,.28,.78,16),dark,[x,.33,z],[0,0,Math.PI/2]);
    addMesh(parent,new THREE.CylinderGeometry(.12,.12,.15,14),mat(0x525663,.35,.65),[x+.46,.33,z],[0,0,Math.PI/2]);
    if(p) rotorGroup({parent,position:[x+.56,.33,z],axis:'x',blades:p.blades,length:.64*p.scale,width:.09,color:state.colors.prop,spinDir:z>=0?1:-1,hubRadius:.11});
  };
  if(m?.id==='single') addNacelle(fusLen/2+.15,0);
  if(m?.id==='twin'){ addNacelle(.45,span*.28); addNacelle(.45,-span*.28); }

  if(state.battery) batteryPack(parent,state.battery,[-.1,.68,0],[0,0,0]);
  cameraModule(parent,state.camera,'x');
  return {span,chord,fusLen};
}

function buildVTOL(parent){
  // VTOL uses a connected fuselage/wing plus motor pylons mounted directly to the wing.
  const b=bodyChoice(); const m=motorChoice(); const p=propChoice();
  const mainMat=mat(state.colors.main,.48,.18), secondary=mat(state.colors.secondary,.5,.18), dark=mat(0x242630,.4,.45);
  const fusLen=b?.id==='vtolcargo'?4.1:3.8, span=b?.id==='vtolcargo'?5.7:5.15;
  addMesh(parent,new THREE.CylinderGeometry(.35,.44,fusLen,20),mainMat,[0,.36,0],[0,0,Math.PI/2]);
  addMesh(parent,new THREE.ConeGeometry(.37,.72,20),mainMat,[fusLen/2+.31,.36,0],[0,0,-Math.PI/2]);
  addMesh(parent,new THREE.BoxGeometry(1.22,.13,span),secondary,[-.05,.37,0]);
  addMesh(parent,new THREE.BoxGeometry(.7,.09,1.85),secondary,[-1.45,.43,0]);
  addMesh(parent,new THREE.BoxGeometry(.65,.72,.10),mainMat,[-1.5,.73,0],[0,0,-.16]);

  const liftPositions=[];
  if(m?.id==='tilt4' || m?.id==='vtol5'){
    liftPositions.push([.28,span*.31], [.28,-span*.31], [-.52,span*.31], [-.52,-span*.31]);
  } else if(m?.id==='vtol7'){
    liftPositions.push([.35,span*.22],[.35,-span*.22],[-.15,span*.34],[-.15,-span*.34],[-.62,span*.25],[-.62,-span*.25]);
  }
  liftPositions.forEach((pos,i)=>{
    const [x,z]=pos;
    // pylon visibly bridges wing surface and motor mount
    addMesh(parent,new THREE.BoxGeometry(.28,.13,.42),dark,[x,.51,z]);
    addMesh(parent,new THREE.CylinderGeometry(.25,.25,.09,16),dark,[x,.61,z]);
    addMesh(parent,new THREE.CylinderGeometry(.20,.22,.30,16),mat(0x111218,.35,.65),[x,.79,z]);
    if(p) rotorGroup({parent,position:[x,.99,z],axis:'y',blades:p.blades,length:.63*p.scale,width:.09,color:state.colors.prop,spinDir:i%2?1:-1,hubRadius:.11});
  });
  if(m?.id==='vtol5' || m?.id==='vtol7'){
    const x=fusLen/2+.10;
    addMesh(parent,new THREE.CylinderGeometry(.22,.27,.7,16),dark,[x,.36,0],[0,0,Math.PI/2]);
    if(p) rotorGroup({parent,position:[x+.48,.36,0],axis:'x',blades:p.blades,length:.58*p.scale,width:.09,color:state.colors.prop,spinDir:1,hubRadius:.1});
  }
  if(state.battery) batteryPack(parent,state.battery,[-.15,.69,0]);
  cameraModule(parent,state.camera,'x');
}

function buildHelicopter(parent){
  const b=bodyChoice(); const m=motorChoice(); const p=propChoice();
  const scale=b?.id==='scout'?.88:b?.id==='heliheavy'?1.14:1;
  const mainMat=mat(state.colors.main,.45,.2), secondary=mat(state.colors.secondary,.45,.18), dark=mat(0x242630,.4,.45);
  const pod=addMesh(parent,new THREE.SphereGeometry(.86*scale,24,16),mainMat,[.25,.5,0]); pod.scale.set(1.35,.72,.82);
  const cockpit=addMesh(parent,new THREE.SphereGeometry(.58*scale,20,14),secondary,[.72,.61,0]); cockpit.scale.set(.9,.56,.78);
  // connected tail boom from body to tail rotor mount
  cylinderBetween(parent,[-.38,.58,0],[-2.55*scale,.82,0],.10*scale,dark);
  addMesh(parent,new THREE.BoxGeometry(.62*scale,.65*scale,.09),mainMat,[-2.22*scale,1.12,0],[0,0,.12]);
  addMesh(parent,new THREE.BoxGeometry(.46*scale,.08,1.18*scale),secondary,[-2.18*scale,.83,0]);
  // skids
  cylinderBetween(parent,[-.55,.02,.52*scale],[.88,.02,.52*scale],.045,dark);
  cylinderBetween(parent,[-.55,.02,-.52*scale],[.88,.02,-.52*scale],.045,dark);
  cylinderBetween(parent,[-.32,.03,.52*scale],[-.32,.30,.35*scale],.035,dark);
  cylinderBetween(parent,[.58,.03,.52*scale],[.58,.30,.35*scale],.035,dark);
  cylinderBetween(parent,[-.32,.03,-.52*scale],[-.32,.30,-.35*scale],.035,dark);
  cylinderBetween(parent,[.58,.03,-.52*scale],[.58,.30,-.35*scale],.035,dark);

  if(m){
    // main motor is mounted on top of the fuselage and supports the rotor mast
    addMesh(parent,new THREE.CylinderGeometry(.27,.30,.33,18),dark,[0,1.08*scale,0]);
    addMesh(parent,new THREE.CylinderGeometry(.08,.08,.42,12),mat(0x5e626d,.3,.7),[0,1.43*scale,0]);
    const blades=p?.blades||0, len=(b?.id==='heliheavy'?2.65:2.25)*(p?.scale||1);
    if(blades) rotorGroup({parent,position:[0,1.68*scale,0],axis:'y',blades,length:len,width:.12,color:state.colors.prop,spinDir:1,hubRadius:.16});
    if(m.id==='coaxial' || m.id==='triple'){
      addMesh(parent,new THREE.CylinderGeometry(.22,.24,.26,18),dark,[0,1.40*scale,0]);
      if(blades) rotorGroup({parent,position:[0,1.50*scale,0],axis:'y',blades,length:len*.94,width:.105,color:state.colors.prop,spinDir:-1,hubRadius:.14});
    }
    if(m.id==='standard' || m.id==='triple'){
      addMesh(parent,new THREE.CylinderGeometry(.13,.15,.20,14),dark,[-2.57*scale,.84,0],[Math.PI/2,0,0]);
      const tail=rotorGroup({parent,position:[-2.57*scale,.84,.12],axis:'z',blades:2,length:.47*scale,width:.07,color:state.colors.prop,spinDir:-1,hubRadius:.09});
      // z-axis rotor support via generic animation metadata
      tail.userData.rotorAxis='z';
    }
  }
  if(state.battery) batteryPack(parent,state.battery,[.1,.32,-.67*scale],[0,0,Math.PI/2]);
  cameraModule(parent,state.camera,'x');
}

function rotateRotor(rotor, amount){
  const axis=rotor.userData.rotorAxis||'y'; const dir=rotor.userData.spinDir||1;
  rotor.rotation[axis] += amount*dir;
}

function animate(time){
  requestAnimationFrame(animate);
  const t=time*.001;
  controls?.update();
  const spin = missionAnimation ? .55 : .045;
  propellerRotors.forEach(r=>rotateRotor(r,spin));

  if(droneGroup && !missionAnimation){
    droneGroup.position.y = Math.sin(t*1.4)*.025;
  }
  updateMissionAnimation(time);
  renderer?.render(scene,camera);
  animateFinal(time);
}

// --- UI / stages -------------------------------------------------------------
function currentStage(){ return STAGES[state.stage]; }
function getOptions(stageId){
  if(stageId==='type') return Object.entries(TYPES).map(([id,x])=>({id,...x}));
  if(stageId==='body') return BODIES[state.type]||[];
  if(stageId==='motors') return MOTORS[state.type]||[];
  if(stageId==='propeller') return PROPS[state.type]||[];
  if(stageId==='battery') return BATTERIES;
  if(stageId==='camera') return CAMERAS;
  if(stageId==='mission') return MISSIONS;
  return [];
}
function selectionFor(stageId){
  if(stageId==='propeller') return state.propeller;
  return state[stageId];
}
function setSelection(stageId,id){
  if(stageId==='type'){
    state.type=id; state.body=state.motors=state.propeller=state.battery=state.camera=null; state.mission=null; state.missionTested=false;
  } else if(stageId==='body'){
    state.body=id;
    const body=(BODIES[state.type]||[]).find(x=>x.id===id);
    if(state.motors && !body?.supports.includes(state.motors)){ state.motors=null; state.propeller=null; }
    state.missionTested=false;
  } else if(stageId==='motors') { state.motors=id; state.missionTested=false; }
  else if(stageId==='propeller') { state.propeller=id; state.missionTested=false; }
  else if(stageId==='battery') { state.battery=id; state.missionTested=false; }
  else if(stageId==='camera') { state.camera=id; state.missionTested=false; }
  else if(stageId==='mission') { state.mission=id; state.missionTested=false; state.missionResult=null; }
  buildDrone(); updatePerformance(); renderStage();
}
function isLocked(stageId,opt){
  if(stageId==='motors'){
    const body=bodyChoice(); return !!body && !body.supports.includes(opt.id);
  }
  if(stageId==='battery'){
    // Physical fit constraints: compact/scout designs cannot carry the largest pack.
    return opt.id==='large' && (state.body==='compact' || state.body==='scout');
  }
  return false;
}
function lockReason(stageId,opt){
  if(stageId==='motors') return 'هذا الهيكل لا يدعم هذا العدد من المحركات.';
  if(stageId==='battery') return 'هذا الهيكل صغير لهذه البطارية.';
  return '';
}

function renderStage(){
  const s=currentStage();
  dom.stageLabel.textContent=`المرحلة ${state.stage+1} من ${STAGES.length}`;
  dom.progressFill.style.width=`${((state.stage+1)/STAGES.length)*100}%`;
  dom.stageKicker.textContent=s.kicker;
  dom.stageTitle.textContent=s.title;
  dom.stageSubtitle.textContent=s.subtitle;
  dom.choiceGrid.innerHTML=''; dom.customizer.innerHTML='';
  dom.customizer.classList.add('hidden'); dom.missionFeedback.classList.add('hidden');
  dom.prevBtn.style.visibility=state.stage===0?'hidden':'visible';

  if(['type','body','motors','propeller','battery','camera','mission'].includes(s.id)) renderChoices(s.id);
  if(s.id==='customize') renderCustomizer();
  if(s.id==='name') renderNameInputs();
  if(s.id==='mission' && state.missionTested && state.missionResult) renderMissionFeedback();

  const complete=isStageComplete(s.id);
  dom.nextBtn.disabled=!complete;
  dom.nextBtn.textContent='التالي ←';
  if(s.id==='mission'){
    if(!state.mission) { dom.nextBtn.textContent='اختر مهمة أولًا'; dom.nextBtn.disabled=true; }
    else if(!state.missionTested) { dom.nextBtn.textContent='🚀 اختبر المهمة'; dom.nextBtn.disabled=false; }
    else { dom.nextBtn.textContent='🏆 عرض بطاقة المصمم'; dom.nextBtn.disabled=false; }
  }
}

function renderChoices(stageId){
  const options=getOptions(stageId); const selected=selectionFor(stageId);
  options.forEach(opt=>{
    const locked=isLocked(stageId,opt);
    const button=document.createElement('button');
    button.type='button'; button.className=`choice-card${selected===opt.id?' selected':''}${locked?' locked':''}`;
    button.disabled=locked;
    const icon = opt.icon || '●';
    const tradeoffs=opt.tradeoffs?.map(([t,c])=>`<span class="trade ${c}">${t}</span>`).join('') || (opt.desc?`<span>${opt.desc}</span>`:'');
    button.innerHTML=`
      <div class="choice-visual"><div class="choice-emoji">${icon}</div></div>
      <div class="choice-copy">
        <strong>${opt.ar}</strong>
        <small>${opt.en}</small>
        <div class="choice-tradeoffs">${tradeoffs}</div>
      </div>
      <div class="choice-check"></div>
      ${locked?`<div class="constraint-note">🔒 ${lockReason(stageId,opt)}</div>`:''}`;
    button.addEventListener('click',()=>setSelection(stageId,opt.id));
    dom.choiceGrid.appendChild(button);
  });
}

function renderCustomizer(){
  dom.customizer.classList.remove('hidden');
  const groups=[['main','اللون الرئيسي','Main Color'],['secondary','اللون الثانوي','Secondary Color'],['prop','لون المراوح','Propeller Color']];
  groups.forEach(([key,ar,en])=>{
    const sec=document.createElement('section'); sec.className='custom-section';
    sec.innerHTML=`<h3>${ar} <span style="color:#7d51d7;font-size:10px;direction:ltr">• ${en}</span></h3>`;
    const palette=document.createElement('div'); palette.className='color-palette';
    COLORS.forEach(c=>{
      const b=document.createElement('button'); b.type='button'; b.className=`color-dot${state.colors[key]===c.hex?' selected':''}`; b.style.background=c.hex; b.title=c.name; b.setAttribute('aria-label',`${ar}: ${c.name}`);
      b.addEventListener('click',()=>{ state.colors[key]=c.hex; state.missionTested=false; buildDrone(); renderStage(); });
      palette.appendChild(b);
    });
    sec.appendChild(palette); dom.customizer.appendChild(sec);
  });
}

function renderNameInputs(){
  dom.customizer.classList.remove('hidden');
  dom.customizer.innerHTML=`
    <div class="name-input-wrap">
      <label for="droneNameInput">🚁 اسم الدرون <span style="color:#7d51d7;font-size:10px">• Drone Name</span></label>
      <input id="droneNameInput" class="name-input" maxlength="24" placeholder="مثال: الصقر X" value="${escapeHtml(state.droneName)}" />
    </div>
    <div class="name-input-wrap">
      <label for="designerNameInput">👩‍💻 اسم المصمم <span style="color:#7d51d7;font-size:10px">• Designer</span></label>
      <input id="designerNameInput" class="name-input" maxlength="24" placeholder="اكتب اسمك" value="${escapeHtml(state.designerName)}" />
    </div>`;
  const a=$('droneNameInput'), b=$('designerNameInput');
  const sync=()=>{ state.droneName=a.value.trim(); state.designerName=b.value.trim(); dom.nextBtn.disabled=!isStageComplete('name'); };
  a.addEventListener('input',sync); b.addEventListener('input',sync);
}

function isStageComplete(id){
  if(id==='customize') return true;
  if(id==='name') return state.droneName.trim().length>0 && state.designerName.trim().length>0;
  if(id==='mission') return !!state.mission;
  return !!selectionFor(id);
}

function nextStage(){
  const id=currentStage().id;
  if(id==='mission'){
    if(!state.missionTested) startMission(state.mission); else showFinal();
    return;
  }
  if(!isStageComplete(id)) return;
  if(state.stage<STAGES.length-1){ state.stage++; renderStage(); resetView(); }
}
function prevStage(){
  if(state.stage>0){ state.stage--; renderStage(); resetView(); hideSceneMessage(); }
}
dom.nextBtn.addEventListener('click',nextStage);
dom.prevBtn.addEventListener('click',prevStage);

dom.restartBtn.addEventListener('click',()=>{
  if(confirm('هل تريد بدء تصميم جديد؟')) resetGame();
});
function resetGame(){
  state=freshState(); missionAnimation=null; hideSceneMessage(); buildDrone(); updatePerformance(); renderStage(); resetView(); dom.finalOverlay.classList.add('hidden');
}

function escapeHtml(value=''){ return value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }

// --- Performance -------------------------------------------------------------
function addMods(stats,mods){ if(!mods)return; Object.keys(stats).forEach(k=>stats[k]+=mods[k]||0); }
function statsForDesign(){
  if(!state.type) return {speed:0,endurance:0,lift:0,stability:0};
  const stats={...TYPES[state.type].base};
  addMods(stats,bodyChoice()?.mods); addMods(stats,motorChoice()?.mods); addMods(stats,propChoice()?.mods);
  addMods(stats,BATTERIES.find(x=>x.id===state.battery)?.mods); addMods(stats,CAMERAS.find(x=>x.id===state.camera)?.mods);
  Object.keys(stats).forEach(k=>stats[k]=Math.round(Math.max(15,Math.min(100,stats[k]))));
  return stats;
}
function updatePerformance(){
  const stats=statsForDesign();
  Object.entries(stats).forEach(([k,v])=>{
    const el=document.querySelector(`.metric[data-metric="${k}"]`); if(!el)return;
    el.querySelector('b').textContent=v; el.querySelector('i').style.width=`${v}%`;
  });
}

// --- Mission lab -------------------------------------------------------------
function missionResult(id){
  const s=statsForDesign(); const hasCam=state.camera && state.camera!=='none'; let score=0, notes=[];
  if(id==='photo'){
    score=s.stability*.43+s.endurance*.27+s.speed*.08+(hasCam?22:0);
    if(!hasCam){ score=Math.min(score,38); notes.push('أضف كاميرا حتى يستطيع الدرون تنفيذ مهمة التصوير.'); }
    if(s.stability<65) notes.push('زيادة الثبات ستجعل الصورة أقل اهتزازًا.');
    if(s.endurance<58) notes.push('بطارية أطول تساعد على تصوير مساحة أكبر.');
  }
  if(id==='delivery'){
    score=s.lift*.47+s.stability*.22+s.endurance*.21+s.speed*.10;
    if(s.lift<58) notes.push('الحمولة ثقيلة على هذا التصميم؛ تحتاج قوة رفع أكبر.');
    if(s.endurance<50) notes.push('قد تنفد الطاقة قبل الوصول لمسافة بعيدة.');
  }
  if(id==='rescue'){
    score=s.lift*.30+s.stability*.28+s.endurance*.27+s.speed*.15+(hasCam?5:0);
    if(!hasCam) notes.push('الكاميرا تساعد فريق الإنقاذ على رؤية الموقع.');
    if(s.stability<60) notes.push('الثبات مهم عند الاقتراب من موقع الإنقاذ.');
  }
  if(id==='explore'){
    score=s.endurance*.38+s.speed*.28+s.stability*.20+s.lift*.07+(hasCam?7:0);
    if(s.endurance<60) notes.push('الاستكشاف يحتاج وقت طيران أطول.');
    if(!hasCam) notes.push('الكاميرا تجعل الاستكشاف أكثر فائدة.');
  }
  score=Math.round(Math.max(0,Math.min(100,score)));
  let grade='poor', label='يحتاج تعديلًا', summary='التصميم يستطيع المحاولة، لكن بعض الاختيارات تحد من المهمة.';
  if(score>=78){ grade='good'; label='ممتاز للمهمة'; summary='اختياراتك تعمل معًا بشكل ممتاز لهذه المهمة.'; }
  else if(score>=58){ grade='ok'; label='ينجح مع ملاحظات'; summary='درونك قادر على تنفيذ المهمة، وهناك مجال لتحسينه.'; }
  if(!notes.length) notes.push('جرّب مهمة أخرى لترى كيف يتغير أداء نفس التصميم.');
  return {score,grade,label,summary,notes,stats:s};
}

function showSceneMessage(text,type='success'){
  dom.sceneMessage.textContent=text; dom.sceneMessage.className=`scene-message ${type}`;
}
function hideSceneMessage(){ dom.sceneMessage.classList.add('hidden'); }

function startMission(id){
  if(missionAnimation) return;
  state.missionResult=missionResult(id); state.missionTested=false;
  hideSceneMessage(); dom.nextBtn.disabled=true; dom.prevBtn.disabled=true;
  const duration=6500;
  missionAnimation={id,start:performance.now(),duration,result:state.missionResult,attached:null};
  droneGroup.position.set(0,0,0); droneGroup.rotation.set(0,-.45,0);
  controls.enabled=false;
  addMissionObject(id);
  showSceneMessage(`🚀 بدء مهمة ${MISSIONS.find(m=>m.id===id).ar}...`,'success');
}

function addMissionObject(id){
  // Remove old mission props
  [...scene.children].filter(x=>x.userData?.missionProp).forEach(x=>scene.remove(x));
  if(id==='delivery'){
    const pkg=new THREE.Group(); pkg.userData.missionProp=true; scene.add(pkg);
    addMesh(pkg,new THREE.BoxGeometry(.58,.42,.58),mat(0xd59c55,.8,.05),[0,.1,0]);
    addMesh(pkg,new THREE.BoxGeometry(.60,.05,.09),mat(0xf1e3bd,.8,0),[0,.31,0]);
    missionAnimation.attached=pkg;
  }
  if(id==='photo'){
    const target=new THREE.Group(); target.userData.missionProp=true; target.position.set(3.2,0,-1.4); scene.add(target);
    addMesh(target,new THREE.CylinderGeometry(.55,.65,.08,32),mat(0x25b8aa,.6,.05),[0,-.02,0]);
    addMesh(target,new THREE.BoxGeometry(.62,.65,.62),mat(0xffffff,.8,.02),[0,.34,0]);
    addMesh(target,new THREE.ConeGeometry(.55,.45,4),mat(0x6b3cc5,.55,.03),[0,.88,0],[0,Math.PI/4,0]);
  }
  if(id==='rescue'){
    const pad=new THREE.Group(); pad.userData.missionProp=true; pad.position.set(3.2,.01,0); scene.add(pad);
    addMesh(pad,new THREE.CylinderGeometry(.8,.8,.06,40),mat(0xffffff,.8,0));
    addMesh(pad,new THREE.BoxGeometry(.9,.05,.22),mat(0xd94b58,.7,.02),[0,.04,0]);
    addMesh(pad,new THREE.BoxGeometry(.22,.05,.9),mat(0xd94b58,.7,.02),[0,.04,0]);
  }
  if(id==='explore'){
    for(let i=0;i<3;i++){
      const marker=new THREE.Group(); marker.userData.missionProp=true; marker.position.set(-2.4+i*2.4,.01,(i%2?1.7:-1.7)); scene.add(marker);
      addMesh(marker,new THREE.CylinderGeometry(.26,.36,.65,10),mat(i===1?0x25b8aa:0x6b3cc5,.55,.08),[0,.32,0]);
    }
  }
}

function updateMissionAnimation(now){
  if(!missionAnimation) return;
  const a=missionAnimation; const u=Math.min(1,(now-a.start)/a.duration); const score=a.result.score;
  const poor=score<58;
  const ease=(x)=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
  let y=0,x=0,z=0;

  if(state.type==='fixed'){
    x = u<.72 ? -1.8 + ease(u/.72)*4.8 : 3.0 - ease((u-.72)/.28)*2.0;
    y = Math.sin(Math.min(1,u/.3)*Math.PI/2)*1.25;
  } else {
    if(u<.22) y=ease(u/.22)*1.35;
    else if(u<.72){ y=1.35; x=ease((u-.22)/.5)*3.0; }
    else { y=1.35-ease((u-.72)/.28)*.45; x=3.0; }
  }
  if(a.id==='explore'){ z=Math.sin(u*Math.PI*3)*1.1; x=-2.1+u*4.5; y=1.15+Math.sin(u*Math.PI)*.45; }
  if(a.id==='photo'){ x=Math.min(2.2,u*3.2); z=-.5*Math.sin(u*Math.PI); y=1.35; }

  // Visual consequences from design quality
  if(poor){
    const wobble=(58-score)/40;
    droneGroup.rotation.z=Math.sin(now*.018)*.12*wobble;
    droneGroup.rotation.x=Math.cos(now*.021)*.08*wobble;
    if(a.id==='delivery' && a.result.stats.lift<58) y*=.48; // struggles to lift
    if(a.id==='explore' && a.result.stats.endurance<60 && u>.64) y-=((u-.64)/.36)*.75;
  } else {
    droneGroup.rotation.z=Math.sin(now*.004)*.015;
  }
  if(a.id==='photo' && a.result.stats.stability<65){ x+=Math.sin(now*.03)*.055; z+=Math.cos(now*.033)*.05; }
  droneGroup.position.set(x,y,z);
  if(a.attached){ a.attached.position.set(x,y-.48,z); a.attached.rotation.y=droneGroup.rotation.y; }

  if(u>=1){
    const type=a.result.grade==='good'?'success':a.result.grade==='ok'?'warn':'fail';
    showSceneMessage(`${a.result.grade==='good'?'✅':a.result.grade==='ok'?'🟡':'🔧'} ${a.result.label} — ${a.result.score}/100`,type);
    missionAnimation=null; state.missionTested=true;
    controls.enabled=true; dom.prevBtn.disabled=false; droneGroup.position.set(0,0,0); droneGroup.rotation.set(0,-.45,0);
    if(a.attached){ scene.remove(a.attached); }
    renderStage();
  }
}

function renderMissionFeedback(){
  const r=state.missionResult; if(!r)return;
  dom.missionFeedback.classList.remove('hidden');
  dom.missionFeedback.innerHTML=`
    <h3>${r.grade==='good'?'✅':r.grade==='ok'?'🟡':'🔧'} ${r.label}</h3>
    <p>${r.summary}</p>
    <div class="feedback-meter"><span class="feedback-score">${r.score}/100</span><span class="feedback-pill ${r.grade}">${r.grade==='good'?'مناسب جدًا':r.grade==='ok'?'قابل للتنفيذ':'جرّب تحسينه'}</span></div>
    <ul class="improve-list">${r.notes.map(n=>`<li>${n}</li>`).join('')}</ul>`;
}

// --- Final designer card -----------------------------------------------------
function labelOf(list,id){ return list.find(x=>x.id===id)?.ar || '—'; }
function showFinal(){
  dom.finalOverlay.classList.remove('hidden');
  const type=TYPES[state.type]; const mission=MISSIONS.find(x=>x.id===state.mission); const result=state.missionResult;
  dom.designerCard.innerHTML=`
    <h3>🚁 ${escapeHtml(state.droneName)}</h3>
    <div class="designer-name">المصمم • ${escapeHtml(state.designerName)}</div>
    <div class="design-row"><span>النوع</span><b>${type.ar}<br><small>${type.en}</small></b></div>
    <div class="design-row"><span>الهيكل</span><b>${labelOf(BODIES[state.type],state.body)}</b></div>
    <div class="design-row"><span>المحركات</span><b>${labelOf(MOTORS[state.type],state.motors)}</b></div>
    <div class="design-row"><span>المراوح</span><b>${labelOf(PROPS[state.type],state.propeller)}</b></div>
    <div class="design-row"><span>البطارية</span><b>${labelOf(BATTERIES,state.battery)}</b></div>
    <div class="design-row"><span>الكاميرا</span><b>${labelOf(CAMERAS,state.camera)}</b></div>
    <div class="mission-stamp"><strong>المهمة • MISSION</strong><b>${mission.icon} ${mission.ar}</b><div style="margin-top:5px;font-size:11px;color:#d9d1ec">ملاءمة التصميم: ${result?.score??0}/100</div></div>`;
  initFinal3D();
}

dom.closeFinalBtn.addEventListener('click',()=>dom.finalOverlay.classList.add('hidden'));
dom.newDesignBtn.addEventListener('click',resetGame);
dom.printCardBtn.addEventListener('click',()=>window.print());
dom.flyAgainBtn.addEventListener('click',()=>{ finalFlyStart=performance.now(); });

function initFinal3D(){
  if(!finalRenderer){
    finalRenderer=new THREE.WebGLRenderer({canvas:dom.finalCanvas,antialias:true,alpha:true});
    finalRenderer.setPixelRatio(Math.min(devicePixelRatio,2)); finalRenderer.shadowMap.enabled=true; finalRenderer.outputColorSpace=THREE.SRGBColorSpace;
    finalScene=new THREE.Scene(); finalCamera=new THREE.PerspectiveCamera(35,1,.1,100); finalCamera.position.set(6,4.3,7); finalCamera.lookAt(0,.6,0);
    finalScene.add(new THREE.HemisphereLight(0xffffff,0x786e89,2.2));
    const l=new THREE.DirectionalLight(0xffffff,3); l.position.set(5,7,5); l.castShadow=true; finalScene.add(l);
    const p=new THREE.Mesh(new THREE.CylinderGeometry(3.3,3.4,.15,64),mat(0xffffff,.8,0)); p.position.y=-.18; finalScene.add(p);
    finalDroneGroup=new THREE.Group(); finalScene.add(finalDroneGroup);
  }
  buildDrone(finalDroneGroup,true); finalDroneGroup.scale.setScalar(.82); finalDroneGroup.position.set(0,0,0); finalFlyStart=0; resizeFinal3D();
}
function resizeFinal3D(){
  if(!finalRenderer || dom.finalOverlay.classList.contains('hidden')) return;
  const r=dom.finalCanvas.getBoundingClientRect(); if(r.width<5||r.height<5)return;
  finalRenderer.setSize(r.width,r.height,false); finalCamera.aspect=r.width/r.height; finalCamera.updateProjectionMatrix();
}
function animateFinal(now){
  if(!finalRenderer || dom.finalOverlay.classList.contains('hidden')) return;
  finalRotors.forEach(r=>rotateRotor(r,.16));
  if(finalDroneGroup){
    finalDroneGroup.rotation.y += .0035;
    if(finalFlyStart){
      const u=Math.min(1,(now-finalFlyStart)/2800); finalDroneGroup.position.y=Math.sin(u*Math.PI/2)*1.05 + Math.sin(now*.006)*.04;
      if(u>=1) finalFlyStart=0;
    } else finalDroneGroup.position.y += (0-finalDroneGroup.position.y)*.025;
  }
  finalRenderer.render(finalScene,finalCamera);
}

// --- Boot --------------------------------------------------------------------
try {
  init3D();
  buildDrone(); updatePerformance(); renderStage();
} catch (err) {
  console.error(err);
  dom.loading3d.innerHTML='<strong>تعذر تشغيل العرض ثلاثي الأبعاد.</strong><small>تأكد من اتصال الإنترنت ثم أعد تحميل الصفحة.</small>';
}
