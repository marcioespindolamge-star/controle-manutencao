// Plano preventivo padronizado da Agropecuária Paineira (não substitui manual do fabricante).
// Apenas leitura dos registros: não modifica Firebase, armazenamento ou histórico.
(function(){
 const $=id=>document.getElementById(id);
 const fmt=n=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:1});
 const steps={
  300:{name:'300 h — BÁSICA',items:[0,1,2]},
  600:{name:'600 h — INTERMEDIÁRIA',items:[0,1,2,3]},
  900:{name:'900 h — BÁSICA',items:[0,1,2]},
  1200:{name:'1.200 h — COMPLETA',items:[0,1,2,3,4,5,6,7,8,9]}
 };
 const meterRecord=r=>r.w&&r.h!==''&&r.h!==null&&r.h!==undefined&&Number.isFinite(Number(r.h));
 function recordsFor(machine,excludeId){
  return data.filter(r=>r.m===machine&&r.d&&r.id!==excludeId)
   .slice().sort((a,b)=>a.d.localeCompare(b.d)||Number(a.h||0)-Number(b.h||0));
 }
 function getPlan(machine,excludeId){
  const records=recordsFor(machine,excludeId);
  const meterRecords=records.filter(meterRecord);
  const lastMeter=meterRecords.length?meterRecords.reduce((a,b)=>Number(b.h)>Number(a.h)?b:a):null;
  const last=records.at(-1)||null;
  const reference=lastMeter?Number(lastMeter.h):null;
  // Próxima faixa de 300 horas acima do último horímetro de manutenção registrado.
  const target=reference===null?300:(Math.floor(reference/300)+1)*300;
  const phase=target%1200||1200;
  return {records,last,lastMeter,reference,target,phase,...steps[phase]};
 }
 function annualStatus(last){
  if(!last)return null;
  const due=new Date(last.d+'T12:00:00');
  if(Number.isNaN(due.getTime()))return null;
  due.setFullYear(due.getFullYear()+1);
  const days=Math.ceil((due-new Date())/86400000);
  return days<=0?{level:'overdue',text:'Revisão anual vencida'}:
   days<=30?{level:'warn',text:'Revisão anual em '+days+' dias'}:null;
 }
 function meterStatus(plan,current){
  if(current===null||!Number.isFinite(current))return null;
  const remaining=plan.target-current;
  return remaining<=0?{level:'overdue',text:'Revisão de '+plan.name+' vencida ('+fmt(-remaining)+' h além do previsto)'}:
   remaining<=20?{level:'warn',text:'Atenção: faltam '+fmt(remaining)+' h para a revisão de '+plan.name}:
   {level:'normal',text:'Faltam '+fmt(remaining)+' h para a revisão'};
 }
 function currentMeterFor(machine){
  if($('m').value!==machine||!$('w').checked||$('h').value==='')return null;
  const value=Number($('h').value);
  return Number.isFinite(value)?value:null;
 }
 function formAlert(){
  const panel=$('due');if(!panel)return;
  const plan=getPlan($('m').value,editing);
  const meterEnabled=$('w').checked;
  const current=currentMeterFor($('m').value);
  const messages=[];
  if(meterEnabled){
   messages.push('Previsão no horímetro: '+fmt(plan.target)+' h');
   if(!plan.lastMeter)messages.push('Sem histórico anterior com horímetro. Confira as revisões já realizadas.');
   const s=meterStatus(plan,current);if(s)messages.push(s.text);
  }else messages.push('Horímetro desativado: acompanhe pela data da última manutenção.');
  const annual=annualStatus(plan.last);
  if(annual)messages.push(annual.text);
  const status=meterStatus(plan,current);
  const level=[status&&status.level,annual&&annual.level].includes('overdue')?'overdue':
    [status&&status.level,annual&&annual.level].includes('warn')?'warn':'normal';
  panel.className='notice'+(level==='overdue'?' overdue':level==='warn'?' warn':'');
  panel.innerHTML='<b>PRÓXIMA REVISÃO: '+plan.name+'</b>'+
   '<div class="small" style="margin-top:5px">Serviços previstos: '+plan.items.map(i=>ss[i]).join(', ')+'</div>'+
   '<div style="margin-top:7px">'+messages.join('<br>')+'</div>';
 }
 function reportAlerts(){
  const filter=$('filter').value;
  let panel=$('reviewCycleSummary');
  if(!panel){panel=document.createElement('div');panel.id='reviewCycleSummary';$('overdueSummary').before(panel)}
  const notices=[];
  const alerts=[];
  for(const machine of ms){
   if(filter&&filter!==machine)continue;
   const plan=getPlan(machine,null);
   const current=currentMeterFor(machine);
   const meter=meterStatus(plan,current);
   const annual=annualStatus(plan.last);
   const status=[meter,annual].filter(Boolean);
   const overdue=status.filter(s=>s.level==='overdue');
   const warning=status.filter(s=>s.level==='warn');
   const level=overdue.length?'overdue':warning.length?'warn':'normal';
   notices.push('<div class="notice'+(level==='overdue'?' overdue':level==='warn'?' warn':'')+'" style="margin:8px 0"><b>'+machine+'</b>'+
    '<div>Próxima revisão: <strong>'+plan.name+'</strong></div>'+
    '<div class="small">Horímetro previsto: '+fmt(plan.target)+' h'+(!plan.lastMeter?' · Sem referência anterior':'')+'</div>'+
    (meter?'<div class="small">'+meter.text+'</div>':'')+'</div>');
   if(!overdue.length||!plan.last)continue;
   const lastId=Number(plan.last.id);
   alerts.push('<div class="notice overdue"><b>REVISÃO VENCIDA — '+machine+'</b>'+
    '<div class="small" style="margin:6px 0">'+overdue.map(s=>s.text).join('<br>')+'</div>'+
    '<div>Próxima revisão: '+plan.name+'</div>'+
    '<div class="formActions"><button type="button" onclick="edit('+lastId+')">EDITAR</button>'+
    '<button type="button" class="cancelAction" onclick="del('+lastId+')">EXCLUIR</button></div></div>');
  }
  panel.innerHTML='<h3>Próximas revisões</h3>'+notices.join('');
  $('overdueSummary').innerHTML=alerts.join('');
  // Os registros originais permanecem visíveis e editáveis no relatório.
 }
 const oldRender=window.render;
 window.render=function(){oldRender();reportAlerts()};
 const oldShow=window.showTab;
 window.showTab=function(tab){oldShow(tab);formAlert();if(tab==='report')reportAlerts()};
 const oldCloud=window.applyCloudRecords;
 window.applyCloudRecords=function(rows){oldCloud(rows);formAlert();reportAlerts()};
 ['m','h','w'].forEach(id=>$(id).addEventListener(id==='h'?'input':'change',()=>{
  formAlert();if(!$('reportPane').classList.contains('hidden'))reportAlerts();
 }));
 $('filter').addEventListener('change',reportAlerts);
 // Substitui a função antiga que calculava revisões pela quantidade de registros.
 window.updateDue=formAlert;
 formAlert();reportAlerts();
})();
