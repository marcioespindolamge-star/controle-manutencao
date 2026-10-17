import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,signInAnonymously,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
const firebaseConfig={
apiKey:'AIzaSyB7rFMM7Lt1LNVQMivytUnpkOjnAxy-Uj4',
authDomain:'controle-manutencao-paineira.firebaseapp.com',
projectId:'controle-manutencao-paineira',
storageBucket:'controle-manutencao-paineira.firebasestorage.app',
messagingSenderId:'54219707216',
appId:'1:54219707216:web:eb3b0567ec520fdaa39255'
};
const msg=document.getElementById('firebaseMessage');
try{
const auth=getAuth(initializeApp(firebaseConfig));
onAuthStateChanged(auth,async user=>{
if(user){document.getElementById('firebaseUid').value=user.uid;msg.textContent='Identificação gerada. Copie o código para autorizar este celular.'}
else{try{await signInAnonymously(auth)}catch(e){msg.textContent='Não foi possível identificar o celular: '+e.code}}
});
}catch(e){msg.textContent='Erro de conexão: '+e.message}
