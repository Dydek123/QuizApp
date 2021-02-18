const hamburger = document.querySelector('.hamburger');
const close = document.querySelector('.closeAside');
const aside = document.querySelector('aside')
const show = () => {
    aside.classList.add('show');
    aside.classList.remove('hide');
}
const hide = () => {
    aside.classList.remove('show');
    aside.classList.add('hide');
}

hamburger.addEventListener('click', show)
close.addEventListener('click', hide)
