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
  const cards=[];
  for(const machine of ms){
   if(filter&&filter!==machine)continue;
   const plan=getPlan(machine,null);
   const last=plan.last;
   const services=last&&Array.isArray(last.s)?last.s.map(i=>ss[i]).filter(Boolean):[];
   const date=last&&last.d?last.d.split('-').reverse().join('/'):'Não registrada';
   const meter=last&&last.w&&last.h!==''?' · '+fmt(last.h)+' h':'';
   cards.push('<div style="background:#f1f6f2;border-left:4px solid #174c36;border-radius:8px;padding:12px;margin:10px 0">'+
    '<b>'+machine+'</b>'+
    '<div style="margin-top:8px"><strong>Última revisão:</strong> '+date+meter+'</div>'+
    '<div style="margin-top:5px"><strong>Serviços realizados:</strong><div style="margin-top:3px">'+
      (last?(services.length?services.map(s=>'✓ '+s).join('<br>'):'Nenhum serviço informado'):'Nenhuma revisão cadastrada')+
    '</div></div>'+
    '<div style="margin-top:8px"><strong>Próxima revisão:</strong> '+plan.name+
    ' · '+fmt(plan.target)+' h</div></div>');
  }
  panel.innerHTML=cards.join('');
  $('overdueSummary').innerHTML='';
  // O relatório é resumido, somente consulta. Histórico permanece armazenado.
  $('r').style.display='none';
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
