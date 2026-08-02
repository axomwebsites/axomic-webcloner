(function(){
  let useragents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  ];

  function randomua(){
    if(!window.settings || !window.settings.get().rotateua) return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    return useragents[Math.floor(Math.random() * useragents.length)];
  }

  function randomdelay(min, max){
    return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1)) + min));
  }

  function buildheaders(url){
    let referer = new URL(url).origin;
    let ua = randomua();
    return {
      'User-Agent': ua,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': referer,
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1'
    };
  }

  function getproxies(selected){
    let all = {
      allorigins: async (url, headers) => {
        let proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
        let resp = await fetch(proxy, { headers, credentials: 'omit', mode: 'cors' });
        if(!resp.ok) throw new Error('allorigins failed');
        return await resp.text();
      },
      corsproxy: async (url, headers) => {
        let proxy = 'https://corsproxy.io/?' + encodeURIComponent(url);
        let resp = await fetch(proxy, { headers, credentials: 'omit', mode: 'cors' });
        if(!resp.ok) throw new Error('corsproxy failed');
        return await resp.text();
      },
      codetabs: async (url, headers) => {
        let proxy = 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url);
        let resp = await fetch(proxy, { headers, credentials: 'omit', mode: 'cors' });
        if(!resp.ok) throw new Error('codetabs failed');
        return await resp.text();
      },
      thingproxy: async (url, headers) => {
        let proxy = 'https://thingproxy.freeboard.io/fetch/' + encodeURIComponent(url);
        let resp = await fetch(proxy, { headers, credentials: 'omit', mode: 'cors' });
        if(!resp.ok) throw new Error('thingproxy failed');
        return await resp.text();
      },
      corsanywhere: async (url, headers) => {
        let proxy = 'https://cors-anywhere.herokuapp.com/' + url;
        let resp = await fetch(proxy, { headers, credentials: 'omit', mode: 'cors' });
        if(!resp.ok) throw new Error('corsanywhere failed');
        return await resp.text();
      }
    };
    if(selected === 'all') return Object.values(all);
    if(all[selected]) return [all[selected]];
    return Object.values(all);
  }

  async function stealthfetch(url, settings, retries){
    let headers = buildheaders(url);
    if(settings.headers){
      for(let k in settings.headers) headers[k] = settings.headers[k];
    }
    let delay = settings.delaymode !== false;
    let mind = settings.mindelay || 200;
    let maxd = settings.maxdelay || 800;
    let retry = settings.retrycount || 3;
    let selected = settings.proxyselect || 'all';
    let proxylist = getproxies(selected);

    if(settings.proxy && settings.proxy.trim()!==''){
      let finalurl = settings.proxy + encodeURIComponent(url);
      let resp = await fetch(finalurl, { headers, credentials: 'omit', mode: 'cors' });
      if(window.scanner) window.scanner.addrequest(url, resp.status);
      if(!resp.ok) throw new Error('proxy fetch failed');
      return await resp.text();
    }

    let attempts = 0;
    let errs = [];
    while(attempts < retry){
      for(let i=0; i<proxylist.length; i++){
        try{
          if(delay) await randomdelay(mind, maxd);
          let html = await proxylist[i](url, headers);
          if(html && html.length > 100) return html;
        } catch(e){
          errs.push(e.message);
        }
      }
      attempts++;
      if(delay) await randomdelay(mind*2, maxd*2);
    }
    throw new Error('all proxy methods failed after ' + retry + ' attempts: ' + errs.join('; '));
  }

  async function stealthfetchblob(url, settings){
    let headers = buildheaders(url);
    if(settings.headers){
      for(let k in settings.headers) headers[k] = settings.headers[k];
    }
    let selected = settings.proxyselect || 'all';
    let proxylist = getproxies(selected);
    let delay = settings.delaymode !== false;
    let mind = settings.mindelay || 200;
    let maxd = settings.maxdelay || 800;

    if(settings.proxy && settings.proxy.trim()!==''){
      let finalurl = settings.proxy + encodeURIComponent(url);
      let resp = await fetch(finalurl, { headers, credentials: 'omit', mode: 'cors' });
      if(window.scanner) window.scanner.addrequest(url, resp.status);
      if(!resp.ok) throw new Error('blob fetch failed');
      return await resp.blob();
    }

    for(let i=0; i<proxylist.length; i++){
      try{
        if(delay) await randomdelay(mind, maxd);
        let proxy = proxylist[i];
        let resp = await proxy(url, headers);
        if(resp.ok) return await resp.blob();
      } catch(e){ continue; }
    }
    throw new Error('all blob proxy methods failed');
  }

  function getbase64(blob){
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = ()=>resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function clonefullsite(url, settings){
    let html = await stealthfetch(url, settings, 3);
    let doc = new DOMParser().parseFromString(html, 'text/html');
    let base = doc.createElement('base');
    base.setAttribute('href', url);
    doc.head.prepend(base);

    let imgs = Array.from(doc.querySelectorAll('img'));
    let styles = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    let scripts = Array.from(doc.querySelectorAll('script[src]'));
    let fontlinks = Array.from(doc.querySelectorAll('link[href*="fonts.googleapis.com"]'));
    let allstyles = Array.from(doc.querySelectorAll('[style]'));

    await Promise.all(imgs.map(async (img) => {
      if(img.src && !img.src.startsWith('data:')){
        try{
          let absurl = new URL(img.src, url).href;
          let blob = await stealthfetchblob(absurl, settings);
          let b64 = await getbase64(blob);
          img.src = b64;
        } catch(e){}
      }
    }));

    await Promise.all(styles.map(async (link) => {
      if(link.href){
        try{
          let absurl = new URL(link.href, url).href;
          let css = await stealthfetch(absurl, settings, 2);
          let style = doc.createElement('style');
          style.textContent = css;
          link.replaceWith(style);
        } catch(e){}
      }
    }));

    await Promise.all(scripts.map(async (scr) => {
      if(scr.src){
        try{
          let absurl = new URL(scr.src, url).href;
          let js = await stealthfetch(absurl, settings, 2);
          let newscr = doc.createElement('script');
          newscr.textContent = js;
          scr.replaceWith(newscr);
        } catch(e){}
      }
    }));

    await Promise.all(fontlinks.map(async (link) => {
      try{
        let absurl = new URL(link.href, url).href;
        let css = await stealthfetch(absurl, settings, 2);
        let style = doc.createElement('style');
        style.textContent = css;
        link.replaceWith(style);
      } catch(e){}
    }));

    await Promise.all(allstyles.map(async (el) => {
      let style = el.getAttribute('style');
      let urls = style.match(/url\(['"]?([^'"()]+)['"]?\)/g);
      if(urls){
        for(let u of urls){
          let match = u.match(/url\(['"]?([^'"()]+)['"]?\)/);
          if(match){
            let rawurl = match[1];
            try{
              let absurl = new URL(rawurl, url).href;
              let blob = await stealthfetchblob(absurl, settings);
              let b64 = await getbase64(blob);
              style = style.replace(rawurl, b64);
            } catch(e){}
          }
        }
        el.setAttribute('style', style);
      }
    }));

    return '<!DOCTYPE html>' + doc.documentElement.outerHTML;
  }

  window.assetclone = { clonefullsite };
})();
