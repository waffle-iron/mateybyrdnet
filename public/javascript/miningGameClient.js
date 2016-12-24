/**
 * Created by nickbelzer on 23/12/2016.
 */

var countUpOptions = {
  useEasing : true,
  useGrouping : true,
  separator : ',',
  decimal : '.',
  prefix : '',
  suffix : ''
};

/**
 * MiningGame Object, stores all data that has to do with the game.
 */
var MiningGame = function() {

  var workers, personalCrystals, totalCrystals;

  /**
   * Function that starts the game, it does this by loading the game in to
   * view and downloading all the session data from the server.
   */
  this.startGame = function() {
    $('#mining-game').load('/mining', function() {
      workers = new CountUp('personalWorkers', 0, 0, 0, 1, countUpOptions);
      personalCrystals = new CountUp('personalCrystals', 0, 0, 0, 1, countUpOptions);
      totalCrystals = new CountUp('totalCrystals', 0, 0, 0, 1, countUpOptions);
    });

    $.get('/mining/checkSession', function() {
      $.getJSON('/mining/sessionData', updatePersonal);

      holdConnection();
    });

    // Make sure we let the server know we are still connected.
    setInterval(holdConnection, 5000);
  };

  /**
   * Method used to let the server know we are still conencted.
   */
  function holdConnection() {
    $.getJSON('/mining/connected', updateTotalCount);
  };

  /**
   * Updates the total count of resources mined.
   *
   * @param data The data json that contains the total amount of crystals mined.
   */
  function updateTotalCount(data) {
    totalCrystals.update(data['crystals']);

    // Because updateTotalCount is called each 5 seconds it is a good moment
    // to also update the personal data of this session.
    $.getJSON('/mining/sessionData', updatePersonal);
  };

  /**
   * Updates the personal data of the session like amount of workers and
   * amount of crystals mined.
   *
   * @param data The data json that contains the session specific data.
   */
  function updatePersonal(data) {
    personalCrystals.update(data['crystals']);
    workers.update(data['workers']);
  };
};

function loadGame() {
  var miningGame = new MiningGame();
  miningGame.startGame();
}

$(document).ready();