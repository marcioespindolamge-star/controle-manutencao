import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,signInAnonymously,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,collection,getDocs,doc,setDoc,deleteDoc} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const config={apiKey:'AIzaSyB7rFMM7Lt1LNVQMivytUnpkOjnAxy-Uj4',authDomain:'controle-manutencao-paineira.firebaseapp.com',projectId:'controle-manutencao-paineira',storageBucket:'controle-manutencao-paineira.firebasestorage.app',messagingSenderId:'54219707216',appId:'1:54219707216:web:eb3b0567ec520fdaa39255'};
const message=document.getElementById('firebaseMessage');
const uidInput=document.getElementById('firebaseUid');
const expected='HkUgFR85JaeDssHMvgEQe9Oj4VQ2';
const app=getApps().length?getApp():initializeApp(config);
const auth=getAuth(app),db=getFirestore(app),col=collection(db,'manutencoes');
let ready=false;
const pending=[];
function status(s){message.textContent=s}
function local(){try{return JSON.parse(localStorage.getItem('paineira-manutencao')||'[]')}catch{return []}}
function enqueue(op){pending.push(op);if(ready)void flush()}
let flushing=false;
async function flush(){if(flushing||!ready)return;flushing=true;try{while(pending.length){const op=pending[0];try{if(op.type==='save')await setDoc(doc(col,String(op.record.id)),op.record);else await deleteDoc(doc(col,String(op.id)));pending.shift();status('Firebase sincronizado ✓')}catch(e){status('Falha ao gravar no Firebase: '+e.code+'. Registro preservado no celular.');break}}}finally{flushing=false}}
window.firebaseSave=record=>enqueue({type:'save',record});
window.firebaseDelete=id=>enqueue({type:'delete',id});
onAuthStateChanged(auth,async user=>{
 if(!user){try{await signInAnonymously(auth)}catch(e){status('Erro na identificação: '+e.code)}return}
 uidInput.value=user.uid;
 if(user.uid!==expected){status('Este navegador não está autorizado no Firestore. Os dados locais foram preservados.');return}
 try{
 status('Conferindo registros existentes...');
 const snap=await getDocs(col);
 const remote=new Map(snap.docs.map(d=>[String(d.id),d.data()]));
 const existing=local();
 for(const record of existing){if(!remote.has(String(record.id))){await setDoc(doc(col,String(record.id)),record);remote.set(String(record.id),record)}}
 const merged=[...remote.values()].sort((a,b)=>(a.id||0)-(b.id||0));
 window.applyCloudRecords(merged);
 ready=true;status('Firebase conectado ✓ '+merged.length+' manutenção(ões) sincronizada(s).');
 void flush();
 }catch(e){status('Não foi possível sincronizar: '+e.code+'. Registros locais preservados.')}
});
