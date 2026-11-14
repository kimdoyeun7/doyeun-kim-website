/* DOYEUN KIM / V7 — read published content managed in Pages CMS. */
(() => {
  const $ = (selector) => document.querySelector(selector);
  const make = (tag, className, txt) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (txt !== undefined && txt !== null) el.textContent = String(txt);
    return el;
  };
  const attach = (parent, ...children) => { children.filter(Boolean).forEach(c => parent.appendChild(c)); return parent; };
  const pathname = (str) => {
    if (typeof str !== 'string') return '';
    // Paths from Pages CMS may begin with /images; use relative paths so GitHub Pages repo sites work.
    if (str.startsWith('/images/')) return str.substring(1);
    if (str.startsWith('images/')) return str;
    // Reject arbitrary protocols for content-managed images.
    if (/^https:\/\//i.test(str)) return str;
    return '';
  };
  const imgUrl = (str) => {
    if (typeof str === 'string') return pathname(str);
    if (str && typeof str === 'object') return pathname(str.src || str.path || str.url || '');
    return '';
  };
  const galleryItems = (value) => (Array.isArray(value) ? value : value ? [value] : []).map(imgUrl).filter(Boolean);
  const order = (list) => list.slice().sort((a,b) => Number(a.order ?? 9999)-Number(b.order ?? 9999));
  const link = (type, item) => `${type}.html?id=${encodeURIComponent(item.id)}`;
  const clear = (target) => { while (target.firstChild) target.removeChild(target.firstChild); };
  const message = (target, text) => { clear(target); attach(target, make('p','cms-error',text)); };

  // Preserve V6's gentle image opacity transition and missing-image placeholders.
  function frame(source, label, extraClass='', eager=false) {
    const wrap = make('div', `art-frame ${extraClass}`);
    const placeholder = make('div','placeholder');
    placeholder.setAttribute('aria-hidden','true');
    attach(placeholder, make('span','placeholder-path',source || '이미지 준비 중'));
    wrap.appendChild(placeholder);
    const image = make('img');
    image.alt = label || 'Artwork';
    image.loading = eager ? 'eager' : 'lazy';
    if (eager) image.setAttribute('fetchpriority','high');
    image.setAttribute('data-art-image','');
    const show = () => { if(image.naturalWidth>0) image.classList.add('is-loaded'); };
    image.addEventListener('load',show);
    image.addEventListener('error',() => image.classList.remove('is-loaded'));
    const src = imgUrl(source);
    if (src) image.src = src;
    wrap.appendChild(image);
    if (image.complete) show();
    return wrap;
  }
  function caption(left,right,klass) {
    const div = make('div',klass);
    attach(div,make('span','',left),make('span','',right));
    return div;
  }
  async function load(name) {
    const response = await fetch(`data/${name}.json`,{cache:'no-cache'});
    if(!response.ok) throw Error(`data/${name}.json (${response.status})`);
    const data = await response.json();
    if(!Array.isArray(data)) throw Error(`${name}.json의 최상위 데이터는 배열이어야 합니다.`);
    const items = data.filter(item => item && item.id && item.title);
    return name === 'works' ? items : order(items);

  }
  function loadError(e) {
    console.error(e);
    return '자료를 불러오지 못했습니다. 파일을 더블클릭한 경우 VS Code의 Live Server로 열어주세요. 인터넷에 공개된 경우 data/ 폴더 업로드 여부를 확인해 주세요.';
  }

  async function home() {
    const cover=$('#home-cover-frame'),captionBox=$('#home-cover-caption'),grid=$('#home-selected-grid');
    if(!cover || !grid) return;
    try {
      const works=await load('works');
      const hero=works.find(w=>w.home_position==='cover') || works[0];
      if(hero){
        const coverImage=frame(hero.image,`${hero.title} by Doyeun Kim`,'home-cover-frame',true);
        coverImage.id='home-cover-frame';
        cover.replaceWith(coverImage);
        clear(captionBox);
        attach(captionBox,make('span','',hero.title),make('span','',hero.year));
      }
      clear(grid);
      works.filter(w=>w.home_position==='selected' && w.id!==(hero && hero.id)).slice(0,2).forEach(w => {
        const article=make('article','home-preview-card');
        const a=make('a');a.href=link('artwork',w);a.setAttribute('aria-label',`View ${w.title}`);
        attach(a,frame(w.image,`${w.title} by Doyeun Kim`),caption(w.title,w.year,'home-preview-caption'));
        attach(article,a);grid.appendChild(article);
      });
    } catch(e){message(cover,loadError(e));}
  }
  async function worksIndex(){
    const grid=$('#works-grid');if(!grid)return;
    try {
      const works=await load('works'); clear(grid);
      if(!works.length) return attach(grid,make('p','cms-empty','등록된 작품이 없습니다.'));

/* Works — year filter */

const yearFilter = make('nav', 'works-year-filter');
yearFilter.setAttribute('aria-label', 'Filter artworks by year');

const years = [...new Set(
  works.map(w => String(w.year ?? '').trim()).filter(Boolean)
)].sort((a, b) => Number(b) - Number(a));

function chooseYear(selected) {
  grid.querySelectorAll('.work-card').forEach(card => {
    card.hidden = selected !== 'All' &&
                  card.dataset.year !== selected;
  });

  yearFilter.querySelectorAll('button').forEach(btn => {
    btn.setAttribute(
      'aria-pressed',
      String(btn.dataset.year === selected)
    );
  });
}

['All', ...years].forEach(year => {
  const button = make('button', 'works-year-button', year);
  button.type = 'button';
  button.dataset.year = year;
  button.addEventListener('click', () => chooseYear(year));
  yearFilter.appendChild(button);
});


/* Works — List / Grid view switch */

const viewSwitch = make('div', 'works-view-switch');
viewSwitch.setAttribute('role', 'group');
viewSwitch.setAttribute('aria-label', 'Artwork view');

function setView(view) {
  grid.classList.toggle('is-grid-view', view === 'grid');

  viewSwitch.querySelectorAll('button').forEach(button => {
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.view === view)
    );
  });
}

[
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' }
].forEach(item => {
  const button = make('button', 'works-view-button', item.label);
  button.type = 'button';
  button.dataset.view = item.value;
  button.addEventListener('click', () => setView(item.value));
  viewSwitch.appendChild(button);
});

const heading = $('.works-heading');

if (heading) {
  heading.querySelector('.works-controls')?.remove();
  heading.querySelector('.works-year-filter')?.remove();

  const controls = make('div', 'works-controls');
  controls.append(yearFilter, viewSwitch);
  heading.appendChild(controls);
}

setView('list');
chooseYear('All');


      works.forEach(w=>{
        const article=make('article','work-card');

article.dataset.year = String(w.year ?? '').trim();

        const a=make('a','work-link'); a.href=link('artwork',w);a.setAttribute('aria-label',`${w.title} — open artwork page`);
        attach(a,frame(w.image,`${w.title} (${w.year}) by Doyeun Kim`),caption(w.title,w.year,'work-caption'));
        attach(article,a);grid.appendChild(article);
      });
    }catch(e){message(grid,loadError(e));}
  }
  async function exhibitionsIndex(){
    const list=$('#exhibition-list');if(!list)return;
    try {
      const items=await load('exhibitions');clear(list);
      if(!items.length) return attach(list,make('p','cms-empty','등록된 전시가 없습니다.'));
      items.forEach((x, index)=>{
        const article=make('article','exhibition-feature');
        const a=make('a','exhibition-feature-link');a.href=link('exhibition',x);a.setAttribute('aria-label',`View ${x.title} exhibition page`);
        attach(a,frame(x.image,`Installation view, ${x.title}`,'exhibition-feature-frame', index === 0),caption(x.title,`${x.year} · ${x.venue || ''}${x.city ? ', '+x.city : ''}`,'exhibition-feature-caption'));
        attach(article,a);list.appendChild(article);
      });
    }catch(e){message(list,loadError(e));}
  }
  function backline(href,text,tag){
    const bar=make('div','detail-topline'); const a=make('a','',text);a.href=href;
    attach(bar,a,make('span','',tag));return bar;
  }
  function imageGallery(target,title,photos,label){
    if(!photos.length)return;
    const section=make('section','cms-gallery-section');const head=make('h2','',title);const list=make('div','cms-gallery-list');
    photos.forEach((src,i)=>{
      const fig=make('figure','cms-gallery-figure');const img=make('img');img.src=src;img.alt=`${label} ${i+1}`;img.loading='lazy';
      // Omit missing optional photos instead of leaving blank gaps.
      img.addEventListener('error',()=>fig.remove());
      attach(fig,img);list.appendChild(fig);
    });
    attach(section,head,list);target.appendChild(section);
  }
  function bottomNav(parent,items,i,type,indexLabel){
    const nav=make('nav','detail-bottom-nav cms-detail-nav'); nav.setAttribute('aria-label',`Browse ${type}s`);
    const previous=items[(i-1+items.length)%items.length];
    const next=items[(i+1)%items.length];
    const prevLink=make('a','',`← Previous ${type}`);prevLink.href=link(type,previous);
    const mid=make('a','',`All ${indexLabel}`);mid.href=`${indexLabel.toLowerCase()}.html`;
    const nextLink=make('a','',`Next ${type} →`);nextLink.href=link(type,next);
    if(items.length===1)attach(nav,mid);
    else attach(nav,prevLink,mid,nextLink);
    parent.appendChild(nav);
  }
  async function artworkDetail(){
    const target=$('#work-detail');if(!target)return;
    try {
      const list=await load('works');const key=new URLSearchParams(window.location.search).get('id');const i=list.findIndex(w=>w.id===key);
      if(i<0){return message(target,'해당 작품을 찾을 수 없습니다. Works에서 다시 선택해 주세요.');}
      const item=list[i];document.title=`${item.title} — DOYEUN KIM`;
      clear(target);
      target.appendChild(backline('works.html','← All Works',`${item.year} / Painting`));
      const fig=make('figure','detail-main-image');
      fig.appendChild(frame(item.image,`${item.title} by Doyeun Kim`,'detail-art-frame',true));target.appendChild(fig);
      const info=make('section','detail-information');info.setAttribute('aria-label','Artwork information');
      const h=make('div');attach(h,make('h1','',item.title));
      const facts=make('div','detail-facts');
      [item.material,item.size,item.year].filter(Boolean).forEach(t=>facts.appendChild(make('p','',t)));
      if(item.description) facts.appendChild(make('p','cms-description',item.description));
      attach(info,h,facts);target.appendChild(info);
      imageGallery(target,'Details',galleryItems(item.detail_images),`${item.title} — detail view`);
      imageGallery(target,'Process',galleryItems(item.process_images),`${item.title} — process photograph`);
      bottomNav(target,list,i,'artwork','Works');
    }catch(e){message(target,loadError(e));}
  }
  async function exhibitionDetail(){
    const target=$('#exhibition-detail');if(!target)return;
    try {
      const list=await load('exhibitions');const key=new URLSearchParams(window.location.search).get('id');const i=list.findIndex(x=>x.id===key);
      if(i<0){return message(target,'해당 전시를 찾을 수 없습니다. Exhibitions에서 다시 선택해 주세요.');}
      const item=list[i];document.title=`${item.title} — DOYEUN KIM`;clear(target);
      target.appendChild(backline('exhibitions.html','← All Exhibitions',`${item.year} / ${item.kind || 'Exhibition'}`));
      const fig=make('figure','exhibition-detail-cover');fig.appendChild(frame(item.image,`Installation view, ${item.title}`,'exhibition-detail-frame',true));target.appendChild(fig);
      const info=make('section','exhibition-detail-information');info.setAttribute('aria-label','Exhibition information');
      const main=make('div');attach(main,make('h1','',item.title),make('p','exhibition-type',item.kind));
      const listFacts=make('dl','exhibition-details-list');
      [['Dates',item.dates],['Venue',`${item.venue||''}${item.city?', '+item.city:''}`],['Year',item.year]].forEach(([label,value])=>{
        const row=make('div');attach(row,make('dt','',label),make('dd','',value));listFacts.appendChild(row);
      });
      attach(info,main,listFacts);target.appendChild(info);
      if(item.description){
        const about=make('section','exhibition-about');
        attach(about,make('h2','','About the exhibition'),make('p','cms-description',item.description));
        target.appendChild(about);
      }
      imageGallery(target,'Installation views',galleryItems(item.gallery),`${item.title} — installation view`);
      /* Exhibition photography credit */
      const photographer = String(item.photo_credit || "").trim();
      if (photographer) {
        const credit = document.createElement("p");
        credit.className = "exhibition-photo-credit";
        credit.textContent = "Installation photography: " + photographer;
        target.appendChild(credit);
      }

      bottomNav(target,list,i,'exhibition','Exhibitions');
    }catch(e){message(target,loadError(e));}
  }
  home(); worksIndex(); exhibitionsIndex(); artworkDetail(); exhibitionDetail();
})();
