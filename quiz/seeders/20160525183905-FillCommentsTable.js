'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Comments',
      [ {text: 'Desde la consola', QuizId: 1, AuthorId: 1, createdAt: new Date(), updatedAt: new Date()}
      ]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Comments', null, {});
  }
};
