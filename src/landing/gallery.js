if (new URLSearchParams(location.search).get('demo') === 'form') {
  location.replace('/thanh-toan?demo=form');
}
const covers = [...document.querySelectorAll('.lp-cover')];
let currentCover = 0;
for (const button of document.querySelectorAll('.lp-controls button')) {
  button.onclick = () => {
    currentCover = (currentCover + Number(button.dataset.step) + covers.length) % covers.length;
    covers.forEach((cover, i) => {
      cover.dataset.position = (i - currentCover + covers.length) % covers.length;
    });
    document.getElementById('cover-name').textContent = covers[currentCover].dataset.name;
  };
}
