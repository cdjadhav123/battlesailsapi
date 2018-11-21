/**
 * Project1/Battles.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  datastore:'myMongoDb',
  tableName:'battles',
  migrate: 'safe',
  schema : true,
  attributes: {
      id: {
        type: 'string',
        columnName: '_id'
      },
      name: {
        type: 'string'
      },
      year: {
        type: 'number'
      },
      battle_number:{
        type : "number"
      },
      attacker_king:{
        type : "ref"
      },
      defender_king:{
        type : "ref"
      },
    attacker_1:{
        type : "ref"
      },
    attacker_2:{
        type : "ref"
      },
    attacker_3:{
        type : "ref"
      },
    attacker_4:{
        type : "ref"
      },
    defender_1:{
        type : "ref"
      },
    defender_2:{
        type : "ref"
      },
    defender_3:{
        type : "ref"
      },
    defender_4:{
        type : "ref"
      },
    attacker_outcome:{
        type : "ref"
      },
    battle_type:{
        type : "ref"
      },
    major_death:{
        type : "ref"
      },
    major_capture:{
        type : "ref"
      },
    attacker_size:{
        type : "ref"
      },
    defender_size:{
        type : "ref"
      },
    attacker_commander:{
        type : "ref"
      },
    defender_commander:{
        type : "ref"
      },
    summer:{
        type : "ref"
      },
    location:{
        type : "ref"
      },
    region:{
        type : "ref"
      },
    note:{
        type : "ref"
      },
  },

};

