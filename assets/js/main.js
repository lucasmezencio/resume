document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('body').className = 'fadein'
    document.querySelector('#year').innerHTML = (new Date()).getFullYear().toString()
})
