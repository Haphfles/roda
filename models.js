import * as THREE from 'three';
let fighterSkin=null;
export function setFighterSkin(factory){fighterSkin=factory;}
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.85,flatShading:true,...extra});
const materials=new Map();function material(c){if(!materials.has(c))materials.set(c,mat(c));return materials.get(c);}
function mesh(geo,color,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geo,typeof color==='string'||typeof color==='number'?material(color):color);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const box=(p,w,h,d,c,x=0,y=0,z=0)=>mesh(new THREE.BoxGeometry(w,h,d),c,p,x,y,z);
const cylinder=(p,r1,r2,h,c,x=0,y=0,z=0,n=8)=>mesh(new THREE.CylinderGeometry(r1,r2,h,n),c,p,x,y,z);
const sphere=(p,r,c,x=0,y=0,z=0)=>mesh(new THREE.IcosahedronGeometry(r,1),c,p,x,y,z);
const joint=(p,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g;};
function limb(parent,x,y,z,length,width,color){const g=joint(parent,x,y,z);cylinder(g,width*.85,width,length,color,0,-length/2,0);return g;}
// Faceted cross-sections give cloth a tailored silhouette without changing the rig.
function tailored(parent,sections,color,sides=20){const vertices=[],indices=[];for(const [y,rx,rz]of sections)for(let i=0;i<sides;i++){const a=i/sides*Math.PI*2;vertices.push(Math.sin(a)*rx,y,Math.cos(a)*rz);}for(let j=0;j<sections.length-1;j++)for(let i=0;i<sides;i++){const a=j*sides+i,b=j*sides+(i+1)%sides;indices.push(a,b,a+sides,b,b+sides,a+sides);}for(const [section,top]of [[0,false],[sections.length-1,true]]){const offset=vertices.length/3;for(let i=0;i<sides;i++){const at=(section*sides+i)*3;vertices.push(vertices[at],vertices[at+1],vertices[at+2]);}for(let i=1;i<sides-1;i++)if(top)indices.push(offset,offset+i,offset+i+1);else indices.push(offset,offset+i+1,offset+i);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return mesh(g,color,parent);}
function facet(parent,x,y,z,sx,sy,sz,color){const m=mesh(new THREE.SphereGeometry(1,16,12),color,parent,x,y,z);m.scale.set(sx,sy,sz);return m;}
export function createFighter(color='#86c9ad',skin='#80533d',variant=0){
 const root=new THREE.Group(),hips=joint(root,0,1.01,0),torso=joint(hips,0,0,0);
 const shirt=mat(color,{flatShading:false,roughness:.72}),pants=mat('#eee8d6',{flatShading:false}),skinMat=mat(skin,{flatShading:false,roughness:.63}),hairMat=mat('#252623',{flatShading:false}),seam=material('#c6c3ac');
 const shade=new THREE.Color(color).multiplyScalar(.70),trim=mat(shade),cordColor=variant?'#b96442':'#cfac4d';
 tailored(torso,[[0,.207,.137],[.12,.205,.139],[.23,.225,.154],[.36,.276,.174],[.46,.295,.166],[.52,.268,.139],[.56,.13,.108]],shirt);
 const bodySkin=tailored(torso,[[0,.214,.14],[.25,.25,.156],[.48,.28,.15],[.54,.22,.13]],skinMat);bodySkin.visible=false;bodySkin.userData.underShirt=true;
 // Separate collar, hem and shoulder seams keep the silhouette readable in motion.
 tailored(torso,[[.005,.224,.15],[.035,.226,.153]],trim);
 const neck=joint(torso,0,.63,0);cylinder(neck,.081,.10,.17,skinMat,0,-.025,0,8);
 const collar=mesh(new THREE.TorusGeometry(.104,.018,4,10),trim,torso,0,.562,0);collar.rotation.x=Math.PI/2;collar.scale.set(1,1,.65);
 const head=joint(neck,0,.21,0);tailored(head,[[-.187,.055,.065],[-.16,.093,.103],[-.105,.13,.128],[-.025,.157,.147],[.055,.159,.149],[.13,.145,.137],[.18,.103,.103],[.205,.035,.04]],skinMat,20);
 // Ears, cheek planes, almond-like eyes and brows, all original geometric details.
 for(const sign of [-1,1]){facet(head,sign*.157,-.025,-.006,.025,.048,.021,skinMat);facet(head,sign*.165,-.025,.009,.010,.026,.005,'#604331');
 const eye=facet(head,sign*.064,.014,.137,.032,.014,.009,'#ddd5bc');eye.rotation.z=sign*-.10;facet(head,sign*.062,.014,.146,.011,.012,.005,'#302b22');const brow=box(head,.064,.012,.012,hairMat,sign*.067,.044,.143);brow.rotation.z=sign*-.10;}
 facet(head,0,-.024,.142,.022,.049,.028,skinMat);facet(head,0,-.058,.162,.027,.017,.024,skinMat);
 const lip=facet(head,0,-.108,.125,.039,.006,.009,'#6b4537');facet(head,0,-.120,.124,.034,.007,.009,skinMat);
 const hairStart=head.children.length;{facet(head,0,.105,-.030,.182,.154,.166,hairMat);for(let i=0;i<8;i++){const a=i*Math.PI/4;facet(head,Math.sin(a)*.123,.19+((i%2)*.015),Math.cos(a)*.10-.025,.062,.068,.059,hairMat);}facet(head,0,.27,-.10,.095,.090,.085,hairMat);}
 const twists=head.children.slice(hairStart);const cropStart=head.children.length;{facet(head,0,.135,-.025,.163,.092,.15,hairMat);for(let i=0;i<4;i++){const lock=facet(head,(i-1.5)*.055,.195+(.035-i*.008),.015,.06,.056,.116,hairMat);lock.rotation.z=-.3;}for(const sign of [-1,1])facet(head,sign*.143,.055,-.045,.018,.06,.075,hairMat);}
 const crop=head.children.slice(cropStart);for(const o of twists)o.userData.hairStyle='twists';for(const o of crop)o.userData.hairStyle='crop';for(const o of [...twists,...crop])o.visible=o.userData.hairStyle===(variant?'twists':'crop');
 // Small stitched roda badge on the chest; no external textures.
 const badge=mesh(new THREE.CircleGeometry(.045,10),material('#f2deaa'),torso,.112,.363,.17);badge.rotation.y=.18;const mark=mesh(new THREE.RingGeometry(.023,.028,10),trim,torso,.113,.363,.174);mark.rotation.y=.18;
 const arms={};for(const [key,sign]of[['l',-1],['r',1]]){
 const upper=joint(torso,sign*.32,.50,0);tailored(upper,[[-.29,.063,.064],[-.23,.074,.079],[-.15,.093,.095],[-.045,.10,.09],[.025,.095,.088]],skinMat);facet(upper,0,.005,0,.106,.106,.097,skinMat);
 tailored(upper,[[-.125,.105,.096],[-.07,.113,.102],[.015,.115,.105],[.065,.086,.08],[.085,.035,.035]],shirt);tailored(upper,[[-.13,.111,.099],[-.11,.113,.10]],trim);
 const lower=joint(upper,0,-.31,0);facet(lower,0,0,0,.073,.075,.07,skinMat);tailored(lower,[[-.29,.044,.05],[-.22,.053,.06],[-.13,.074,.077],[-.055,.077,.075],[0,.064,.063]],skinMat);
 const hand=joint(lower,0,-.32,0);facet(hand,0,-.014,.008,.059,.083,.039,skinMat);facet(hand,-sign*.05,-.005,.022,.025,.044,.027,skinMat);
 // Fingers stay grouped as a readable low-poly hand, without changing the hand target.
 for(let i=0;i<4;i++)facet(hand,(i-1.5)*.024,-.064+(Math.abs(i-1.5)*.008),.011,.014,.038,.026,skinMat);
 const band=cylinder(lower,.059,.062,.074,trim,0,-.248,0,16);for(let wrap=0;wrap<3;wrap++)cylinder(lower,.063,.063,.006,'#e6c888',0,-.273+wrap*.022,0,16);arms[key]={upper,lower,hand};}
 // A continuous waistband and fuller trousers replace the detached tube silhouette.
 tailored(hips,[[-.11,.226,.15],[-.025,.239,.157],[.04,.234,.156]],pants);
 const legs={};for(const [key,sign]of[['l',-1],['r',1]]){
 const upper=joint(hips,sign*.145,0,0);tailored(upper,[[-.44,.10,.10],[-.32,.117,.112],[-.12,.133,.137],[.01,.128,.13]],pants);
 const lower=joint(upper,0,-.44,0);facet(lower,0,0,0,.104,.082,.105,pants);tailored(lower,[[-.405,.085,.082],[-.36,.086,.085],[-.15,.104,.098],[0,.101,.10]],pants);
 tailored(lower,[[-.412,.089,.086],[-.382,.09,.087]],trim);facet(lower,0,-.035,.084,.075,.09,.027,trim);const stripe=box(upper,.010,.32,.015,trim,sign*.123,-.19,.038);stripe.rotation.z=sign*.035;
 const foot=joint(lower,0,-.44,.065);
 // Feet preserve the original 0.09 m sole height, so grounded poses stay grounded.
 const outline=[[-.055,-.14],[.055,-.14],[.075,-.10],[.075,.09],[.05,.14],[-.05,.14],[-.075,.09],[-.075,-.10]],vertices=[],indices=[];
 for(const y of [-.045,.045])for(const [x,z]of outline)vertices.push(x,y,z);
 for(let i=0;i<8;i++){const j=(i+1)%8;indices.push(i,j,i+8,j,j+8,i+8);}for(let i=1;i<7;i++)indices.push(0,i+1,i,8,8+i,8+i+1);
 for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,skinMat,foot);
 for(let i=0;i<3;i++)box(foot,.004,.003,.026,'#654735',(i-1)*.031,.046,.104);
 legs[key]={upper,lower,foot};}
 const belt=mesh(new THREE.TorusGeometry(.235,.018,5,20),cordColor,hips,0,.025,0);belt.rotation.x=Math.PI/2;belt.scale.y=.69;
 const knot=facet(hips,.188,.02,.106,.035,.032,.028,cordColor);const cord=joint(hips,.19,.01,.105);cord.rotation.z=-.24;
 for(const [x,length,angle]of[[0,.26,-.1],[.035,.20,.14]]){const tail=joint(cord,x,0,0);tail.rotation.z=angle;cylinder(tail,.013,.014,length,cordColor,0,-length/2,0,6);for(let i=0;i<3;i++){const tassel=cylinder(tail,.003,.004,.045,'#e8d4a2',(i-1)*.009,-length-.018,0,4);tassel.rotation.z=(i-1)*.12;}}
 const ring=mesh(new THREE.RingGeometry(.46,.49,48),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.65,side:THREE.DoubleSide}),root,0,.016,0);ring.rotation.x=-Math.PI/2;ring.castShadow=false;
 const rig={root,hips,torso,head,arms,legs,cord,ring,shirt,skinMat};root.traverse(o=>{if(!o.isMesh||o===ring)return;const m=o.material;o.userData.designRole=m===shirt?'shirt':m===skinMat?'skin':m===pants?'pants':m===hairMat?'hairColor':m===trim?'trim':m.color?.getHexString()===new THREE.Color(cordColor).getHexString()?'belt':null;o.userData.sleeve=(o.parent===arms.l.upper||o.parent===arms.r.upper)&&(m===shirt||m===trim);});fighterSkin?.(rig);return rig;
}

const smooth=x=>{x=THREE.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
export function poseFighter(r,f,time){
 const t=time*4.1,phase=f.action==='idle'?0:f.t/({kick:.66,spin:1.16,dodge:.76}[f.action]||1);
 r.root.position.set(f.x,0,f.z);r.root.rotation.set(0,f.heading,0);r.hips.position.y=.99+Math.sin(t*2)*.025;r.hips.rotation.set(0,0,Math.sin(t)*.04);r.torso.rotation.set(.05,Math.sin(t)*.13,0);r.head.rotation.set(0,-Math.sin(t)*.09,0);
 for(const[k,sgn]of[['l',-1],['r',1]]){const a=r.arms[k],l=r.legs[k];a.upper.rotation.set(-.45+Math.sin(t+sgn)*.15,0,sgn*.38);a.lower.rotation.set(-1.2,0,0);l.upper.rotation.set(Math.sin(t)*sgn*(f.moving?.55:.23)-.12,0,sgn*.1);l.lower.rotation.set(.28+Math.max(0,-Math.sin(t)*sgn)*(f.moving?.5:.1),0,0);l.foot.rotation.set(-.10,0,0);}
 if(f.action==='kick'){const lift=Math.sin(Math.PI*smooth(phase));r.hips.position.y=1.01;r.hips.rotation.z=.13*lift;r.torso.rotation.x=-.15*lift;r.legs.r.upper.rotation.set(-1.55*lift,0,-.30*Math.sin(phase*Math.PI*2));r.legs.r.lower.rotation.x=.13;r.legs.l.upper.rotation.x=-.06;r.legs.l.lower.rotation.x=.08;r.arms.r.upper.rotation.set(.2,0,-.8*lift);r.arms.r.lower.rotation.x=-.25;}
 if(f.action==='spin'){const turn=smooth((phase-.06)/.49);r.root.rotation.y=f.heading+Math.PI*2*turn;const lift=smooth((phase-.12)/.18)*(1-smooth((phase-.69)/.25));r.hips.position.y=1.01;r.hips.rotation.z=.16*lift;r.torso.rotation.x=-.18*lift;r.legs.r.upper.rotation.set(-Math.PI*.49*lift,0,-.12*lift);r.legs.r.lower.rotation.x=.06+(.8*(1-lift));r.legs.l.upper.rotation.set(-.06,0,0);r.legs.l.lower.rotation.x=.09;r.arms.l.upper.rotation.set(.1,0,-.95*lift);r.arms.r.upper.rotation.set(.1,0,.95*lift);r.arms.l.lower.rotation.x=-.25;r.arms.r.lower.rotation.x=-.25;r.head.rotation.y=-.22*lift;}
 if(f.action==='dodge'){const duck=smooth(phase/.15)*(1-smooth((phase-.75)/.25));r.hips.position.y-=.40*duck;r.torso.rotation.z=.72*duck;r.torso.rotation.x=.45*duck;r.legs.l.upper.rotation.x=-1.15*duck;r.legs.l.lower.rotation.x=1.5*duck;r.legs.r.upper.rotation.set(-.65*duck,0,-.65*duck);r.legs.r.lower.rotation.x=1.3*duck;r.arms.l.upper.rotation.set(-.2,0,-.65);r.arms.l.lower.rotation.x=-.5;r.arms.r.upper.rotation.set(-1.3,0,.4);}
 if(f.action==='knockdown'){const fall=smooth(f.t/.5),rise=smooth((f.t-.62)/.35),down=fall*(1-rise);r.root.rotation.y+=(f.fallTurn||0)*.65*down;r.root.rotation.z-=(f.fallTurn||0)*.32*down;r.hips.position.y=.925-.74*down;r.hips.rotation.set(-Math.PI*.49*down,0,0);r.torso.rotation.set(.12*down,0,0);r.head.rotation.set(.12*down,0,0);for(const side of ['l','r']){const sign=side==='l'?-1:1;r.legs[side].upper.rotation.set(-.20*down,0,sign*.12*down);r.legs[side].lower.rotation.set(.38*down,0,0);r.legs[side].foot.rotation.set(-.18*down,0,0);r.arms[side].upper.rotation.set(-.25*down,0,sign*.65*down);r.arms[side].lower.rotation.set(-.35*down,0,0);}}
 r.shirt.emissive.set(f.flash>0?'#654126':'#000000');r.skinMat.emissive.set(f.flash>0?'#4c3524':'#000000');r.cord.rotation.x=Math.sin(t)*.15;
}
function palm(parent,x,z,size,rotation){const g=joint(parent,x,0,z);g.scale.setScalar(size);g.rotation.y=rotation;for(let i=0;i<9;i++){const seg=cylinder(g,.15-i*.007,.17-i*.007,.48,'#967858',Math.sin(i*.12)*.3,i*.44+.24,0,7);seg.rotation.z=-.06;}const top=joint(g,.25,4.1,0);for(let j=0;j<9;j++){const leaf=new THREE.Group();leaf.rotation.y=j*Math.PI*2/9;const vertices=[],indices=[];for(let i=0;i<=7;i++){const t=i/7,w=Math.sin(t*Math.PI)*.27;vertices.push(-w,Math.sin(t*Math.PI)*.48-t*.42,t*2.05,w,Math.sin(t*Math.PI)*.48-t*.42,t*2.05);}for(let i=0;i<7;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const m=mesh(geo,mat(j%2?'#628a58':'#477b57',{side:THREE.DoubleSide}),leaf);m.castShadow=true;top.add(leaf);}for(let i=0;i<3;i++)sphere(top,.16,'#716a42',Math.cos(i*2)*.15,-.1,Math.sin(i*2)*.15);return g;}
function building(parent,x,z,w,h,c){const g=joint(parent,x,0,z);box(g,w,h,2.5,c,0,h/2,0);box(g,w+.18,.16,2.7,'#e0d5b6',0,h-.05,0);box(g,w+.2,.23,2.72,'#a76548',0,h+.14,0);box(g,w,.17,2.57,'#ddc6a2',0,.3,0);for(let y=1;y<h-.5;y+=1.15){for(let xx=-w/2+.55;xx<w/2-.2;xx+=.9){box(g,.49,.70,.07,'#eadac0',xx,y,1.29);box(g,.36,.57,.09,'#416b64',xx,y,1.34);box(g,.025,.57,.015,'#c2c3a0',xx,y,1.40);box(g,.50,.07,.17,'#dfc9a4',xx,y-.38,1.35);}}box(g,.65,1.18,.08,'#6b6650',0,.62,1.31);return g;}
export function createWorld(scene){
 const world=new THREE.Group();scene.add(world);const ocean=mesh(new THREE.PlaneGeometry(250,250),mat('#6d9b98'),world,0,-.27,0);ocean.rotation.x=-Math.PI/2;ocean.castShadow=false;
 cylinder(world,16,17,.35,'#bdad8e',0,-.2,0,64);cylinder(world,5.3,5.4,.12,'#d6c6a7',0,-.04,0,80);
 const paving=new THREE.InstancedMesh(new THREE.BoxGeometry(.72,.035,.72),mat('#c6b79a'),540),dummy=new THREE.Object3D();let n=0;for(let i=-11;i<=11;i++)for(let j=-11;j<=11;j++){if(Math.hypot(i*.78,j*.78)<5.4||Math.hypot(i*.78,j*.78)>12)continue;dummy.position.set(i*.78,-.003,j*.78);dummy.rotation.y=(i+j)%2*.015;dummy.updateMatrix();paving.setMatrixAt(n++,dummy.matrix);}paving.count=n;paving.receiveShadow=true;world.add(paving);
 for(const radius of[4.95,5.08]){const ring=mesh(new THREE.RingGeometry(radius,radius+.035,96),mat('#efe3c8',{side:THREE.DoubleSide}),world,0,.027,0);ring.rotation.x=-Math.PI/2;ring.castShadow=false;}
 for(let i=0;i<8;i++){const a=i*Math.PI/4;const tick=box(world,.035,.01,.25,'#ead6af',Math.sin(a)*4.7,.03,Math.cos(a)*4.7);tick.rotation.y=a;}
 const colors=['#cb9273','#e1c07d','#8cae9c','#e3d5ae','#bd7c62','#b3bac0','#d8aa70'];for(let i=0;i<7;i++){const b=building(world,(i-3)*2.7,-9.3,2.45,3.4+(i%3)*.6,colors[i]);b.rotation.y=(i-3)*-.04;}
 building(world,-10,-3,2.8,4,'#e0b780').rotation.y=Math.PI/2;building(world,10,-4,2.8,4.4,'#86a397').rotation.y=-Math.PI/2;
 for(const[x,z,s,r]of[[-7,-5,1.35,.5],[7,-5,1.5,-.4],[-9,2,1.3,1],[9,1,1.25,2],[-5,-11,1.5,1]])palm(world,x,z,s,r);
 for(const x of[-6,6]){cylinder(world,.045,.07,4.6,'#686c55',x,2.3,-5);const points=[];for(let i=0;i<=30;i++){let t=i/30;points.push(new THREE.Vector3(-6+12*t,4.6-Math.sin(t*Math.PI)*.75,-5));}const rope=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#766b51'}));world.add(rope);if(x===-6)for(let i=0;i<21;i++){const t=i/20,y=4.6-Math.sin(t*Math.PI)*.75;const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(.3,0);shape.lineTo(.15,-.38);shape.closePath();mesh(new THREE.ShapeGeometry(shape),mat(i%3===0?'#c47755':i%3===1?'#e6c77d':'#7da391',{side:THREE.DoubleSide}),world,-6+12*t,y,-5);}}
 for(const x of[-5.9,5.9]){const bench=joint(world,x,0,-1.8);bench.rotation.y=x>0?-Math.PI/3:Math.PI/3;box(bench,1.8,.14,.55,'#827057',0,.48,0);box(bench,1.8,.4,.10,'#827057',0,.88,-.25);for(const bx of[-.65,.65])box(bench,.12,.5,.4,'#5c6554',bx,.24,0);}
 // Hand-made instruments at the edge of the roda.
 const drum=joint(world,-3.7,0,-5.7);cylinder(drum,.28,.19,.83,'#9e6f44',0,.42,0,12);cylinder(drum,.30,.30,.06,'#e3d0a1',0,.86,0,16);for(let i=0;i<8;i++){let a=i*Math.PI/4;const l=box(drum,.015,.77,.015,'#e0c695',Math.sin(a)*.245,.45,Math.cos(a)*.245);l.rotation.z=Math.sin(a)*.08;}
 const bowPoints=[];for(let i=0;i<25;i++){let t=i/24;bowPoints.push(new THREE.Vector3(-3.1+Math.sin(t*Math.PI)*.28,.1+t*2.3,-5.7));}world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(bowPoints),new THREE.LineBasicMaterial({color:'#806144'})));world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([bowPoints[0],bowPoints[24]]),new THREE.LineBasicMaterial({color:'#e0d6bc'})));sphere(world,.22,'#ad8752',-3.0,.55,-5.7);
 const spectators=[];for(let i=0;i<9;i++){let a=-Math.PI*.65+i*Math.PI*1.3/8;const r=createFighter(i%3===0?'#d7ba78':i%3===1?'#92ad9a':'#c99378',i%2?'#6c4935':'#aa7756',i%2);r.root.scale.setScalar(.84);const x=Math.sin(a)*6.15,z=-Math.cos(a)*6.15;r.root.position.set(x,0,z);world.add(r.root);spectators.push({rig:r,f:{x,z,heading:Math.atan2(-x,-z),action:'idle',flash:0,t:0}});}
 return{world,spectators};
}

// Only visual meshes change width; skeletal pivots and limb lengths remain fixed.
export function applyCharacter(rig,design){
 if(rig.importedModel)return;
 if(!rig.designMeshes){rig.designMeshes=[];const materials=new Map();rig.root.traverse(o=>{if(!o.isMesh||o===rig.ring)return;const original=o.material;if(!materials.has(original))materials.set(original,original.clone());o.material=materials.get(original);rig.designMeshes.push({o,scale:o.scale.clone(),position:o.position.clone()});});rig.shirt=materials.get(rig.shirt);rig.skinMat=materials.get(rig.skinMat);}
 rig.head.scale.set(design.headSize*design.faceWidth,design.headSize,design.headSize);
 for(const {o,scale,position}of rig.designMeshes){o.scale.copy(scale);o.position.copy(position);const role=o.userData.designRole;if(role==='trim')o.material.color.set(design.shirt).multiplyScalar(.70);else if(role)o.material.color.set(design[role]);if(o.userData.hairStyle)o.visible=o.userData.hairStyle===design.hair;if(o.userData.sleeve)o.visible=design.sleeves;
 if(o.parent===rig.torso||o.parent===rig.hips){o.scale.x*=design.build;o.scale.z*=design.build;o.position.x*=design.build;o.position.z*=design.build;}
 for(const side of ['l','r']){if([rig.arms[side].upper,rig.arms[side].lower,rig.legs[side].upper,rig.legs[side].lower].includes(o.parent)){o.scale.x*=design.build;o.scale.z*=design.build;o.position.x*=design.build;}if(o.parent===rig.arms[side].hand){o.scale.multiplyScalar(design.hands);o.position.multiplyScalar(design.hands);}if(o.parent===rig.legs[side].foot){o.scale.x*=design.feet;o.position.x*=design.feet;}}
 }
 rig.root.updateMatrixWorld(true);
}
