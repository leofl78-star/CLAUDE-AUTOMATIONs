// 9:16 copy patch, loaded after slides.js only for ?v=9x16.
// Stories have no comment box, no save button and advance by tap, so these lines point to the direct instead.
(() => {
  const slide = name => SLIDES.find(s => s.name === name);
  slide('capa').swipe = 'continua →';
  slide('salva-e-comenta').lines[1].text = 'Tira print pra um dia ruim.';
  Object.assign(slide('leo'), {
    ctaVerb: 'Manda',
    hint: 'no direct que eu<br>te mando o link',
    private: '',
  });
})();
