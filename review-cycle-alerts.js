// Avisos visuais de ciclos de revisão. Não modifica registros nem sincronização.
(function(){
 const byId=id=>document.getElementById(id);
 const fmt=n=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:1});
 const labels=['300 h — BÁSICA','600 h — INTERMEDIÁRIA','900 h — BÁSICA','1.200 h — COMPLETA'];
 const basic=[0,1,2],intermediate=[0,1,2,3],complete=[0,1,2,3,4,5,6,7,8,9];
 const cycleFor=records=>{
   const count=records.length;
   const position=count%4;
   const services=position===3?complete:position===1?intermediate:basic;
   const last=records.at(-1);
   const withMeter=records.filter(x=>x.w&&x.h!==''&&Number.isFinite(Number(x.h)));
   const lastMeter=withMeter.at(-1);
   return {label:labels[position],services,last,lastMeter,target:lastMeter?Number(lastMeter.h)+300:null};
 };
 const sortedFor=m=>data.filter(x=>x.m===m&&x.id!==editing&&x.d).slice().sort((a,b)=>a.d.localeCompare(b.d));
 function formAlert(){
   const target=byId('due');if(!target)return;
   const records=sortedFor(byId('m').value),cycle=cycleFor(records);
   const meterOn=byId('w').checked;
   const currentText=byId('h').value;
   const current=meterOn&&currentText!==''?Number(currentText):null;
   const status=[];
   let danger=false,warning=false;
   if(meterOn&&cycle.target!==null){
     status.push('Próxima revisão prevista no horímetro: '+fmt(cycle.target)+' h');
     if(current!==null&&Number.isFinite(current)){
       const left=cycle.target-current;
       if(left<=0){status.push('REVISÃO POR HORAS VENCIDA ('+fmt(Math.abs(left))+' h além do previsto)');danger=true}
       else if(left<=20){status.push('ATENÇÃO: faltam '+fmt(left)+' h');warning=true}
       else status.push('Faltam '+fmt(left)+' h para a revisão');
     }
   }else if(meterOn)status.push('Registre a primeira revisão com horímetro para calcular a próxima');
   if(cycle.last){
     const annual=new Date(cycle.last.d+'T12:00:00');annual.setFullYear(annual.getFullYear()+1);
     const days=Math.ceil((annual-new Date())/86400000);
     if(days<=0){status.push('REVISÃO ANUAL VENCIDA');danger=true}
     else if(days<=30){status.push('Revisão anual em '+days+' dias');warning=true}
   }
   target.className='notice'+(danger?' overdue':warning?' warn':'');
   target.innerHTML='<b>PRÓXIMA REVISÃO: '+cycle.label+'</b>'+
     '<div class="small" style="margin-top:5px">Serviços previstos: '+cycle.services.map(i=>ss[i]).join(', ')+'</div>'+
     (status.length?'<div style="margin-top:7px">'+status.join('<br>')+'</div>':'');
 }
 function reportAlerts(){
   const parent=byId('overdueSummary');if(!parent)return;
   let panel=byId('reviewCycleSummary');
   if(!panel){panel=document.createElement('div');panel.id='reviewCycleSummary';parent.before(panel)}
   const filter=byId('filter').value;
   const rows=ms.filter(m=>!filter||m===filter).map(m=>{
     const records=data.filter(x=>x.m===m&&x.d).slice().sort((a,b)=>a.d.localeCompare(b.d));
     if(!records.length)return '';
     const c=cycleFor(records);
     return '<div class="notice" style="margin:8px 0"><b>'+m+'</b><div>Próxima revisão: <strong>'+c.label+'</strong></div>'+
       (c.target!==null?'<div class="small">Previsão no horímetro: '+fmt(c.target)+' h</div>':'<div class="small">Horímetro ainda sem referência</div>')+'</div>';
   }).filter(Boolean);
   panel.innerHTML=rows.length?'<h3>Próximas revisões</h3>'+rows.join(''):'';
 }
 // Mantém intactos os cadastros e o relatório existentes.
 const previousRender=window.render;
 window.render=function(){previousRender();reportAlerts()};
 const previousShow=window.showTab;
 window.showTab=function(tab){previousShow(tab);formAlert();if(tab==='report')reportAlerts()};
 const previousCloud=window.applyCloudRecords;
 window.applyCloudRecords=function(rows){previousCloud(rows);formAlert();reportAlerts()};
 ['m','h','w'].forEach(id=>{
   byId(id).addEventListener(id==='h'?'input':'change',()=>{formAlert();if(!byId('reportPane').classList.contains('hidden'))reportAlerts()});
 });
 byId('filter').addEventListener('change',reportAlerts);
 formAlert();reportAlerts();
})();