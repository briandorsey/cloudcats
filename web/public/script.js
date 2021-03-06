var nub = PUBNUB.init({
  subscribe_key: subscribeKey,
  ssl: true
});

var dogs = 0;
var cats = 0;
var other = 0;
var total = 0;
var count = 0;
var queue = [];

var dogDiv = document.getElementById('dogs');
var catDiv = document.getElementById('cats');

nub.subscribe({
  channel: 'cloudcats',
  message: function(m) {
    console.log(m);
    queue.push(m);
  }
});

var addButton = document.getElementById('add');
var progress = document.getElementById('progress');
var main = document.querySelector('main');
var snackbar = document.getElementById('snackbar');
addButton.addEventListener('click', function() {
  main.classList.add('cover2');
  main.classList.remove('cover');
  progress.style.display = 'block';
  dogs = 0;
  cats = 0;
  other = 0;
  total = 0;
  count = 0;
  fetch(apiEndpoint, { mode: 'no-cors' });
  snackbar.MaterialSnackbar.showSnackbar({
    message: "Let's get started!"
  });
});

var dialog = document.querySelector('dialog');
dialog.querySelector('.close').addEventListener('click', function() {
  dialog.close();
});  

function showDialog(data) {
  var dialogContent = document.getElementById('dialogContent');
  var dialogTitle = document.getElementById('dialogTitle');

  if (data.winner == 'tie') {
    dialogContent.innerText = 'There was a tie!? That was unfulfilling.';
    dialogTitle.innerText = 'TIE! TIE! TIE!'  
  } else {
    dialogContent.innerText = 'It looks like the Internet really likes ' + data.winner + '. Who knew?';
    dialogTitle.innerText = data.winner + ' WIN!'
  }
  progress.style.display = 'none';
  dialog.showModal();
}

function processMessage(m) {

  if (m.data.type === 'fin') {
    total = m.data.total;
    console.log('total!: ' + total);
  } else {
    var pic = document.createElement('div');
    pic.style.backgroundImage = 'url(' + m.data.url + ')';
    var container = null;
    switch (m.data.type) {
      case "other":
        other++;
        break;
      case "dog":
        dogs++;
        dogDiv.insertBefore(pic, dogDiv.firstChild);
        break;
      case "cat":
        cats++;
        catDiv.insertBefore(pic, catDiv.firstChild);
        break;
      case "both":
        cats++;
        dogs++;
        dogDiv.insertBefore(pic, dogDiv.firstChild);
        catDiv.insertBefore(pic, catDiv.firstChild);
        break;
    }
    count++;
  }

  if (count === total) {
    var winner;
    console.log('we are DONE');
    if (cats > dogs) {
      winner = 'CATS';
    } else if (dogs > cats) {
      winner = 'DOGS';
    } else {
      winner = 'tie';
    }

    showDialog({
      winner: winner,
      dogs: dogs,
      cats: cats,
      other: other,
      total: total
    });
  }
}

setInterval(function() {
  if (queue.length > 0) {
    processMessage(queue.shift());
  }
}, 500)

