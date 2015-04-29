var db = require('../dbs/db.js');
var Template = require('../models/Template.js');

Template.remove({}, function(err, template){
  if (err){
    console.error("Ran into error", err);
  } else {
    console.log('datbase deleted');
    Template.create({
      questions: [
        {
          type: 'text',
          question: 'Name of Tenant'
        },
        {
          type: 'date',
          question: 'What is the start date?'
        },
        {
          type: 'date',
          question: 'What is the end date?'
        },
        {
          type: 'binary',
          question: 'Pets allowed',
          choices: ['yes', 'no']
        },
        {
          type: 'multiChoice',
          question: 'What are you subletting?',
          choices: ['Shared Room', 'Private Room', 'Couch', 'Floor']
        },
        {
          type: 'multiAnswer',
          question: 'Which utilities are included?',
          choices: ['electric', 'gas', 'internet', 'water']
        },
        {
          type: 'amountPerCycle',
          question: 'What is the rent amount?',
          cycles: ['hours', 'week', 'day', 'month']
        }
      ],
       version: '0.1',
       state: 'CA'
    }, function(err, template){
      if (!err){
        console.log('template created');
      } else {
        console.error('Error creating', err);
      }
    });
  }
});
