// A última revisão é sempre somente consulta. Apenas NOVA REVISÃO libera o formulário.
(function(){
 const el=id=>document.getElementById(id);
 const machine=el('m'),form=el('f');
 const mode=document.createElement('div');
 mode.id='maintenanceEditMode';
 mode.style.cssText='background:#edf4ed;border-left:4px solid #174c36;padding:9px 11px;border-radius:7px;margin:12px 0;font-size:14px';
 const actions=document.createElement('div');
 actions.style.cssText='display:flex;gap:8px;margin:8px 0 10px';
 const editButton=document.createElement('button');
 editButton.type='button';
 editButton.id='editLatestMaintenance';
 editButton.textContent='EDITAR';
 editButton.style.cssText='flex:1;margin:0;background:#174c36';
 const newButton=document.createElement('button');
 newButton.type='button';
 newButton.id='newMaintenance';
 newButton.textContent='+ NOVA REVISÃO';
 newButton.style.cssText='flex:1;margin:0;background:#476e5d';
 actions.append(newButton);
 machine.insertAdjacentElement('afterend',mode);
 mode.insertAdjacentElement('afterend',actions);
 const today=()=>new Date().toLocaleDateString('en-CA');
 const checkboxes=()=>Array.from(document.querySelectorAll('[name=svc]'));
 const saveButton=form.querySelector('button[type=submit]');
 let state='view';
 const display=text=>{mode.textContent=text};
 function lock(locked){
  [el('d'),el('w'),el('h'),...checkboxes()].forEach(control=>control.disabled=locked);
  saveButton.disabled=locked;
  saveButton.style.opacity=locked?'0.45':'1';
 }
 function latest(){
  return data.filter(r=>r.m===machine.value&&r.d)
   .slice().sort((a,b)=>a.d.localeCompare(b.d)||Number(a.h||0)-Number(b.h||0)||Number(a.id||0)-Number(b.id||0)).at(-1);
 }
 function loadLast(){
  const record=latest();
  if(!record){showEmpty();return}
  state='view';
  editing=null;
  el('d').value=record.d||today();
  el('w').checked=Boolean(record.w);
  el('hw').hidden=!el('w').checked;
  el('h').value=record.h??'';
  const selected=new Set((record.s||[]).map(Number));
  checkboxes().forEach(box=>box.checked=selected.has(Number(box.value)));
  lock(true);
  display('ÚLTIMA REVISÃO — SOMENTE CONSULTA. Para preencher uma manutenção, toque em + NOVA REVISÃO.');
  window.updateDue();
 }
 function showEmpty(){
  state='view';editing=null;
  el('d').value=today();el('w').checked=true;el('hw').hidden=false;el('h').value='';
  checkboxes().forEach(box=>box.checked=false);
  lock(true);
  display('Nenhuma revisão cadastrada. Toque em + NOVA REVISÃO para habilitar o preenchimento.');
  window.updateDue();
 }
 function newRecord(){
  state='new';
  editing=null;
  el('d').value=today();
  el('w').checked=true;
  el('hw').hidden=false;
  el('h').value='';
  checkboxes().forEach(box=>box.checked=false);
  lock(false);
  display('NOVA REVISÃO — SALVAR criará um registro separado.');
  window.updateDue();
 }
 machine.addEventListener('change',loadLast);
 newButton.addEventListener('click',newRecord);
 el('tabForm').addEventListener('click',loadLast);
 const previousCloud=window.applyCloudRecords;
 window.applyCloudRecords=function(rows){
  previousCloud(rows);
  // Atualiza a consulta após sincronizar, sem descartar um formulário em edição.
  if(state==='view'||!el('reportPane').classList.contains('hidden'))loadLast();
 };
 loadLast();
})();