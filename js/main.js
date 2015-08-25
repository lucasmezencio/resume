document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('body').className = 'fadein';
    document.querySelector('#year').innerHTML = (new Date()).getFullYear();
});
