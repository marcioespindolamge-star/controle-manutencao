(function(){
const oldRender=window.render;
function showOverdue(){
 const target=document.getElementById('overdueSummary');
 if(!target||typeof data==='undefined')return;
 const today=new Date();today.setHours(0,0,0,0);
 const filter=document.getElementById('filter').value;
 const alerts=[];
 for(const machine of ms){
  if(filter&&filter!==machine)continue;
  const records=data.filter(x=>x.m===machine&&x.d).slice().sort((a,b)=>a.d.localeCompare(b.d));
  const last=records[records.length-1];if(!last)continue;
  const annual=new Date(last.d+'T12:00:00');annual.setFullYear(annual.getFullYear()+1);annual.setHours(0,0,0,0);
  const annualOverdue=annual<today;
  const hourly=records.filter(x=>x.w&&x.h!==''&&Number.isFinite(Number(x.h)));
  const previous=hourly[hourly.length-1];
  const entered=document.getElementById('m').value===machine&&document.getElementById('w').checked?document.getElementById('h').value:'';
  const current=entered!==''?Number(entered):null;
  const hoursOverdue=previous&&current!==null&&Number.isFinite(current)&&current-Number(previous.h)>=300;
  if(!annualOverdue&&!hoursOverdue)continue;
  const cycle=records.length+1;
  const tier=cycle%4===0?'1.200 h — COMPLETA':cycle%2===0?'600 h':'300 h — BÁSICA';
  const services=cycle%4===0?'Básica + filtro hidráulico + óleos da transmissão, cubos e diferencial + filtro de ar':cycle%2===0?'Básica + filtro hidráulico':'Óleo do motor, filtro de óleo e filtro diesel';
  const details=[];
  if(annualOverdue)details.push('Prazo anual vencido');
  if(hoursOverdue)details.push('Ultrapassou 300 h desde a última revisão');
  alerts.push('<div style="background:#ffe5e5;border-left:5px solid #c22;color:#a11616;padding:12px;margin:12px 0;border-radius:7px"><strong>REVISÃO VENCIDA — '+machine+'</strong><div style="font-size:13px;margin-top:5px">'+details.join(' · ')+'<br>Próximo ciclo previsto: '+tier+'<br>'+services+'</div></div>');
 }
 target.innerHTML=alerts.join('');
}
window.render=function(){oldRender();showOverdue()};
document.getElementById('filter').onchange=window.render;
const oldShow=window.showTab;
window.showTab=function(t){oldShow(t);if(t==='report')showOverdue()};
const oldCloud=window.applyCloudRecords;
window.applyCloudRecords=function(rows){oldCloud(rows);showOverdue()};
showOverdue();
})();