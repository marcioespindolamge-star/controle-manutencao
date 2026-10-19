// Carrega a última manutenção da máquina selecionada para edição.
// Não modifica o histórico ou o Firebase até o usuário tocar em SALVAR.
(function(){
 const el=id=>document.getElementById(id);
 const machine=el('m'),form=el('f');
 const mode=document.createElement('div');
 mode.id='maintenanceEditMode';
 mode.style.cssText='background:#edf4ed;border-left:4px solid #174c36;padding:9px 11px;border-radius:7px;margin:12px 0;font-size:14px';
 const newButton=document.createElement('button');
 newButton.type='button';
 newButton.id='newMaintenance';
 newButton.textContent='+ NOVA REVISÃO';
 newButton.style.cssText='margin:0 0 10px;background:#476e5d';
 machine.insertAdjacentElement('afterend',mode);
 mode.insertAdjacentElement('afterend',newButton);
 const today=()=>new Date().toLocaleDateString('en-CA');
 const checkboxes=()=>document.querySelectorAll('[name=svc]');
 function displayMode(text){mode.textContent=text}
 function latest(){
  return data.filter(r=>r.m===machine.value&&r.d)
   .slice().sort((a,b)=>a.d.localeCompare(b.d)||Number(a.h||0)-Number(b.h||0)||Number(a.id||0)-Number(b.id||0)).at(-1);
 }
 function loadLast(){
  const record=latest();
  if(!record){newRecord();displayMode('Nenhuma revisão cadastrada para esta máquina.');return}
  editing=record.id;
  el('d').value=record.d||today();
  el('w').checked=Boolean(record.w);
  el('hw').hidden=!el('w').checked;
  el('h').value=record.h??'';
  const selected=new Set((record.s||[]).map(Number));
  checkboxes().forEach(box=>box.checked=selected.has(Number(box.value)));
  displayMode('EDITANDO A ÚLTIMA REVISÃO — '+record.d.split('-').reverse().join('/')+'. Salvar atualizará este registro.');
  window.updateDue();
 }
 function newRecord(){
  editing=null;
  el('d').value=today();
  el('w').checked=true;
  el('hw').hidden=false;
  el('h').value='';
  checkboxes().forEach(box=>box.checked=false);
  displayMode('NOVA REVISÃO — ao salvar, será criado um novo registro.');
  window.updateDue();
 }
 machine.addEventListener('change',loadLast);
 newButton.addEventListener('click',newRecord);
 el('tabForm').addEventListener('click',loadLast);
 const previousCloud=window.applyCloudRecords;
 window.applyCloudRecords=function(rows){
  previousCloud(rows);
  // Não descarta alterações que o usuário esteja digitando.
  if(document.activeElement===document.body||el('reportPane').classList.contains('hidden')===false)loadLast();
 };
 // O botão cancelar continua com a função original de voltar ao relatório.
 loadLast();
})();