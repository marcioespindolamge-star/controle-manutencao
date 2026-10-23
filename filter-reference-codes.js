// Referências de filtros por modelo; apresentação apenas, sem alterar registros.
(function(){
 const machine=document.getElementById('m');
 const filters=document.getElementById('s');
 if(!machine||!filters)return;
 const refs={
  'Colheitadeira TC5070':{
   1:'84228488',2:'84526251 / 84283691 (conforme sistema)',
   3:'84239756 · Hidrostático: 84226258 / 48142231',
   7:'84120625',8:'84120624'
  },
  'Trator NH 7630':{
   1:'84228488',2:'5802721728 / 51629287',3:'47628830',
   7:'87344136',8:'87344135'
  },
  'Trator John Deere':{
   1:'T19044',2:'RE62419 / DQ24057',3:'RE45864',
   4:'AL156625',7:'DQ04466',8:'DQ04467'
  },
  'Trator NH TL75':{
   1:'84465122',2:'84465002',3:'84465103',
   7:'Preto: 87682999 · Laranja: 87344136',
   8:'Preto: 84465008 · Laranja: 87344135',
   9:'Cabine: 5196842 · Carvão ativado: 87658718'
  }
 };
 const notes={
  'Colheitadeira TC5070':'NEW HOLLAND TC5070 · Filtro da cabine: 86545652 (não é carvão ativado)',
  'Trator NH 7630':'NEW HOLLAND 7630',
  'Trator John Deere':'JOHN DEERE 6600',
  'Trator NH TL75':'NEW HOLLAND TL75 MWM'
 };
 const title=document.createElement('div');
 title.id='filterCodeInfo';
 title.style.cssText='font-size:13px;color:#496554;margin:5px 0 9px;line-height:1.45';
 filters.parentNode.insertBefore(title,filters);
 function refresh(){
  const current=machine.value;
  const codes=refs[current]||{};
  title.textContent=notes[current]?'Códigos de referência — '+notes[current]+'. Confirme compatibilidade pelo ano e número de série.':'';
  filters.querySelectorAll('label.check').forEach(label=>{
   const input=label.querySelector('input[name=svc]');
   if(!input)return;
   let span=label.querySelector('.filter-code');
   if(!span){
    span=document.createElement('span');
    span.className='filter-code';
    span.style.cssText='display:block;font-size:12px;font-weight:500;color:#567264;margin-top:3px';
    const text=document.createElement('span');
    text.className='filter-service-name';
    // Preserve checkbox and its label while grouping the description.
    const nodes=Array.from(label.childNodes).filter(n=>n!==input);
    nodes.forEach(n=>text.appendChild(n));
    const wrapper=document.createElement('span');
    wrapper.style.cssText='display:block;min-width:0';
    wrapper.append(text,span);
    label.appendChild(wrapper);
   }
   const code=codes[Number(input.value)];
   span.textContent=code?'Cód.: '+code:'';
   span.hidden=!code;
  });
 }
 machine.addEventListener('change',refresh);
 refresh();
})();