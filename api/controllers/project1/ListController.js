/**
 * ListController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  listbattles: async (req, res) => {
    var db = Battles.getDatastore().manager;
    let battleregion_query = await db.collection('battles').aggregate([{
      "$match": {
        "region": { "$exists": true, "$ne": null }
      }
    },{$group: {_id: "$region"}}]);

    var battles = await battleregion_query.toArray();
    battles = await battles.map(function(value){
      return value._id;
    });
    return res.status(200).json({status: 200, data: {regions:battles}});
  },

  listcount: async (req, res) => {
    const battlecount = await Battles.count();

    return res.status(200).json({status: 200, data: battlecount});
  },

  search: async (req, res) => {

    if(!req.query.hasOwnProperty('king')){
      return res.status(500).json({status:500,message:"Insufficient search parameters",body:{}});
    }
    else
    {
      var king = req.param('king').trim();
      if(req.query.hasOwnProperty('location') || req.query.hasOwnProperty('type'))
      {
          let location = req.query.hasOwnProperty('location') ? req.query.location.trim() : '';
          let type = req.query.hasOwnProperty('type') ? req.query.type.trim() : '';
          if(location.length <=0 || type.length <= 0 || king.length <= 0)
          {
            return res.status(500).json({status:500,message:"Insufficient search parameters",body:{}});
          }
          else {
            let list = await Battles.find({
              where: {
                or: [
                  {attacker_king: {contains: king}},
                  {defender_king: {contains: king}}
                ],
                and: [
                  {'location':location},
                  {'battle_type':type}
                ]
              }
            });
            if(list.length<=0)
            {
              return res.status(200).json({status:200,message:'Not record found with given parameters'});
            }
            else {
              return res.status(200).json({status:200,data:list});
            }
          }
        }
      else {
        if(king.length <=0)
        {
          return res.status(500).json({status:500,message:"Insufficient search parameters",body:{}});
        }else {
          let list = await Battles.find({
            where: {
              or: [
                {attacker_king: {contains: king}},
                {defender_king: {contains: king}}
              ]
            }
          });
          if(list.length<=0)
          {
            return res.status(200).json({status:200,message:'Not battles found for the king'});
          }
          else {
            return res.status(200).json({status:200,data:list});
          }
        }
      }

    }
  },

  listcount: async (req, res) => {
    const battlecount = await Battles.count();

    return res.status(200).json({status: 200, data: battlecount});
  },

  stats: async (req, res) => {
    var db = Battles.getDatastore().manager;

    let active_king_query = await db.collection('battles').aggregate([{$group: {_id: "$attacker_king", count: {$sum: 1}}},{$project: {name: "$_id", count: "$count", _id: 0}}]);
    let defender_king_query = await db.collection('battles').aggregate([{$group: {_id: "$defender_king", count: {$sum: 1}}},{$project: {name: "$_id", count: "$count", _id: 0}}]);
    let region_query = await db.collection('battles').aggregate([{$group: {_id: "$region", count: {$sum: 1}}},{$project: {name: "$_id", count: "$count", _id: 0}}]);
    let name_query = await db.collection('battles').aggregate([{$group: {_id: "$name", count: {$sum: 1}}},{$project: {name: "$_id", count: "$count", _id: 0}}]);
    let battletype_query = await db.collection('battles').aggregate([{
      "$match": {
        "battle_type": { "$exists": true, "$ne": null }
      }
    },{$group: {_id: "$battle_type"}}]);

    var defendersizeAvg = '';
    var defendersizeMax = '';
    var defendersizeMin = '';
    var defendersize = await Battles.find({defender_size:{'!=':null}});
    if(defendersize){

      var defendersizeArr = await defendersize.map(function(value){
        return parseInt(value.defender_size);
      });

      let sum = await defendersizeArr.reduce((prev,current)=> current += prev);
      defendersizeAvg = Math.round(sum / defendersizeArr.length);
      defendersizeMax = Math.max.apply(null, defendersizeArr);
      defendersizeMin = Math.min.apply(null, defendersizeArr);

    }
    var battleArr = await battletype_query.toArray();
    battleArr = await battleArr.map(function(value){
      return value._id;
    });
    let active_king = new Promise (function(resolve,reject){
      active_king_query.toArray(function (e, r) {
        let count = Math.max.apply(Math, r.map(function (o, index) {
          return o.count;
        }));
        let found = r.find(function (element) {
          if (element.count == count) return element.name;
        });
        resolve(found.name);
      });
    });

    let defender_king = new Promise (function(resolve,reject){
      defender_king_query.toArray(function (e, r) {
        let count = Math.max.apply(Math, r.map(function (o, index) {
          return o.count;
        }));
        let found = r.find(function (element) {
          if (element.count == count) return element.name;
        });
        resolve(found.name);
      });
    });

    let region = new Promise (function(resolve,reject){
      region_query.toArray(function (e, r) {
        let count = Math.max.apply(Math, r.map(function (o, index) {
          return o.count;
        }));
        let found = r.find(function (element) {
          if (element.count == count) return element.name;
        });
        resolve(found.name);
      });
    });

    let name = new Promise (function(resolve,reject){
      name_query.toArray(function (e, r) {
        let count = Math.max.apply(Math, r.map(function (o, index) {
          return o.count;
        }));
        let found = r.find(function (element) {
          if (element.count == count) return element.name;
        });
        resolve(found.name);
      });
    });

    let win = await Battles.count({attacker_outcome:'win'});
    let loss = await Battles.count({attacker_outcome:'loss'});



    Promise.all([active_king, defender_king, region, name]).then(function(values) {
      console.log(values);
      let most_active = {attacker_king: values[0],defender_king:values[1],region:values[2],name:values[3]};
      let attacker_outcome = {win:win,loss:loss};
      res.status(200).json({most_active:most_active,
        attacker_outcome:attacker_outcome,
        battle_type:battleArr,
        defender_size:{average:defendersizeAvg,min:defendersizeMin,max:defendersizeMax}
      });
    });

  },



};

