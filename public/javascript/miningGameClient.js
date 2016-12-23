/**
 * Created by nickbelzer on 23/12/2016.
 */

function main() {
  $('#mining-game').load('/mining');

  $.get('/mining/checkSession', function() {
    $.getJSON('/mining/sessionData', updatePersonal);
  });

  holdConnection();
  setInterval(holdConnection, 5000);
}

function holdConnection() {
  $.getJSON('/mining/connected', updateTotalCount);
}

function updateTotalCount(data) {
  $('#totalCrystals').text(data['crystals']);

  $.getJSON('/mining/sessionData', updatePersonal);
}

function updatePersonal(data) {
  $('#personalWorkers').text(data['workers']);
  $('#personalCrystals').text(data['crystals']);
}

$(document).ready(main);