(function(){
  let settings = {
    proxy: '',
    headers: {},
    cookies: {},
    stealthmode: true,
    delaymode: true,
    mindelay: 200,
    maxdelay: 800,
    retrycount: 3,
    rotateua: true,
    proxyselect: 'all'
  };

  function load(){
    let stored = localStorage.getItem('axomicsettings');
    if(stored){
      try{
        let parsed = JSON.parse(stored);
        settings = Object.assign(settings, parsed);
      } catch(e){}
    }
    let proxyinput = document.getElementById('proxyinput');
    let headersinput = document.getElementById('headersinput');
    let cookiesinput = document.getElementById('cookiesinput');
    let stealthmode = document.getElementById('stealthmode');
    let delaymode = document.getElementById('delaymode');
    let mindelay = document.getElementById('mindelay');
    let maxdelay = document.getElementById('maxdelay');
    let retrycount = document.getElementById('retrycount');
    let rotateua = document.getElementById('rotateua');
    let proxyselect = document.getElementById('proxyselect');
    if(proxyinput) proxyinput.value = settings.proxy || '';
    if(headersinput) headersinput.value = JSON.stringify(settings.headers || {}, null, 2);
    if(cookiesinput) cookiesinput.value = JSON.stringify(settings.cookies || {}, null, 2);
    if(stealthmode) stealthmode.checked = settings.stealthmode !== false;
    if(delaymode) delaymode.checked = settings.delaymode !== false;
    if(mindelay) mindelay.value = settings.mindelay || 200;
    if(maxdelay) maxdelay.value = settings.maxdelay || 800;
    if(retrycount) retrycount.value = settings.retrycount || 3;
    if(rotateua) rotateua.checked = settings.rotateua !== false;
    if(proxyselect) proxyselect.value = settings.proxyselect || 'all';
  }

  function save(newsettings){
    settings = Object.assign(settings, newsettings);
    localStorage.setItem('axomicsettings', JSON.stringify(settings));
  }

  function get(){ return settings; }

  window.settings = { load, save, get };
})();
