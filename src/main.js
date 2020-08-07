import './assets/css/main.css'

function show(content) {
    document.getElementById('app').innerText = 'Hello,' + content;
  }
  
show('webpack');