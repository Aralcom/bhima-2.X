/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

/*
 * The /prices API endpoint
 */
describe('(/prices ) Price List', function () {

  // constants
  const emptyPriceList = {
    uuid : 'da4be62a-4310-4088-97a4-57c14cab49c8',
    label : 'Test Empty Price List',
    description : 'A price list without items attached yet.'
  };

  const priceListItems = [{
    inventory_uuid : '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
    label : 'Test $11 reduction on an item',
    is_percentage : false,
    value : 10
  }, {
    inventory_uuid : 'c48a3c4b-c07d-4899-95af-411f7708e296',
    label : 'Test 13% reduction on an item',
    is_percentage : true,
    value : 12
  }];


  const priceListItems2 = [{
    inventory_uuid : '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
    label : 'Test $20 reduction on an item',
    is_percentage : false,
    value : 10
  }, {
    inventory_uuid : 'c48a3c4b-c07d-4899-95af-411f7708e296',
    label : 'Test 25% reduction on an item',
    is_percentage : true,
    value : 12
  }];

  var complexPriceList = {
    label : 'Test Price List w/ Two Items',
    description : 'A price list with two items attached.',
    items : priceListItems
  };

  var invalidPriceList = {
    label : 'An invalid price list',
    items :[{
      inventory_uuid : null,
      label : 'You cannot have a null inventory uuid, if you were wondering...',
      is_percentage : false,
      value : 1.2
    }]
  };

  const responseKeys = [
    'uuid', 'label', 'description', 'created_at', 'updated_at', 'items'
  ];

  it('GET /prices returns only one default record', function () {
    return agent.get('/prices')
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it('GET /prices/unknownId returns a 404 error', function () {
    return agent.get('/prices/unknownId')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });


  it('POST /prices should create a price list (without price list items)', function () {
    return agent.post('/prices')
      .send({ list : emptyPriceList })
      .then(function (res) {
        helpers.api.created(res);

        // attach the returned id
        emptyPriceList.uuid =  res.body.uuid;
        return agent.get('/prices/' + emptyPriceList.uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('PUT /prices should update the (empty) price list\'s label', function () {
    var newLabel = 'Test Empty Price List (updated)' ;
    return agent.put('/prices/' + emptyPriceList.uuid)
      .send({ list : { label : newLabel }})
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.all.keys(responseKeys);
        expect(res.body.label).to.equal(newLabel);
        expect(res.body.items).to.be.empty;
      })
      .catch(helpers.handler);
  });

  it('PUT /prices should update the (empty) price list with price list items', function () {
    return agent.put('/prices/' + emptyPriceList.uuid)
      .send({ list : { items : priceListItems2}})
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('GET /prices should return a list of two items', function () {
    return agent.get('/prices')
      .then(function (res) {
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });

  it('POST /prices should create a price list with two items', function () {
    return agent.post('/prices')
      .send({ list : complexPriceList })
      .then(function (res) {
        helpers.api.created(res);
        complexPriceList.uuid = res.body.uuid;
        return agent.get('/prices/' + complexPriceList.uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('GET /prices should return a list of three items', function () {
    return agent.get('/prices')
      .then(function (res) {
        helpers.api.listed(res, 3);
      })
      .catch(helpers.handler);
  });

  it('POST /prices with an invalid price list item should not create a dangling price list', function () {
    return agent.post('/prices')
      .send({ list : invalidPriceList })
      .then(function (res) {
        helpers.api.errored(res, 400);

        expect(res.body.code).to.equal('ERRORS.BAD_REQUEST');

        // make sure we didn't gain a price list!
        return agent.get('/prices');
      })
      .then(function (res) {
        helpers.api.listed(res, 3);
      })
      .catch(helpers.handler);
  });

  it('DELETE /prices/unknownid should return a 404 error.', function () {
    return agent.delete('/prices/unknownid')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /prices/:uuid should delete an existing price list', function () {
    return agent.delete('/prices/' + emptyPriceList.uuid)
      .then(function (res) {
        expect(res).to.have.status(204);
        return agent.get('/prices/' + emptyPriceList.uuid);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
