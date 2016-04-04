/* global element, by, browser */

var chai    = require('chai');
var expect  = chai.expect;

var helpers = require('../shared/helpers');
helpers.configure(chai);

var FormUtils = require('../shared/FormUtils');
var components = require('../shared/components');

describe('Debtor Groups', function () {

  var PATH = '#/debtor_groups';

  var groupUuid = '4de0fe47-177f-4d30-b95f-cff8166400b4';

  var debtorGroup = {
    name : '(E2E) Debtor Group',
    account_id : 3638,
    location_id : '03a329b2-03fe-4f73-b40f-56a2870cc7e6',
    phone : '0811838662',
    email : 'debtorgroup@info.com',
    note : '(E2E) Nouveau debtor group de test',
    max_credit : 2500
  };

  var update = {
    name : '(E2E) Debtor Group (updated)',
    account_id : 3638,
    location_id : '03a329b2-03fe-4f73-b40f-56a2870cc7e6',
    phone : '0818061031',
    email : 'debtorgroup@info.com (updated)',
    note : '(E2E) Nouveau debtor group de test (updated)',
    max_credit : 5500
  };

  /** navigate to the debtor group module */
  beforeEach(function () {
    browser.get(PATH);
  });

  it('creates a new debtor group', function () {
    FormUtils.buttons.create();

    /** debtor group info */
    FormUtils.input('DebtorGroupCtrl.debtorGroup.name', debtorGroup.name);

    FormUtils.input('DebtorGroupCtrl.debtorGroup.account_id', debtorGroup.account_id);
    var option = element.all(by.repeater('match in matches track by $index')).first();
    option.click();

    element.all(by.options('price.uuid as price.label for price in DebtorGroupCtrl.prices.data')).enabled().first().click();
    FormUtils.input('DebtorGroupCtrl.debtorGroup.max_credit', debtorGroup.max_credit);

    /** debtor group characteristics */
    element(by.model('DebtorGroupCtrl.debtorGroup.is_convention')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.locked')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.apply_subsidies')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.apply_discounts')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.apply_billing_services')).click();

    /** contact */
    FormUtils.input('DebtorGroupCtrl.debtorGroup.phone', debtorGroup.phone);
    FormUtils.input('DebtorGroupCtrl.debtorGroup.email', debtorGroup.email);
    FormUtils.input('DebtorGroupCtrl.debtorGroup.note', debtorGroup.note);


    /** location Kele in Bas-Congo */
    var locations = [
     'dbe330b6-5cde-4830-8c30-dc00eccd1a5f', // Democratic Republic of the Congo
     'f6fc7469-7e58-45cb-b87c-f08af93edade', // Bas Congo,
     '0404e9ea-ebd6-4f20-b1f8-6dc9f9313450', // Tshikapa,
     '1f162a10-9f67-4788-9eff-c1fea42fcc9b' // kele
    ];

    components.locationSelect.set(locations);

    FormUtils.buttons.submit();

    FormUtils.exists(by.id('create_success'), true);
  });

  it('updates an existing debtor group', function () {
    element(by.name('group-' + groupUuid)).click();

    /** debtor group info */
    FormUtils.input('DebtorGroupCtrl.debtorGroup.name', update.name);
    FormUtils.input('DebtorGroupCtrl.debtorGroup.account_id', update.account_id);
    var option = element.all(by.repeater('match in matches track by $index')).first();
    option.click();

    element.all(by.options('price.uuid as price.label for price in DebtorGroupCtrl.prices.data')).enabled().first().click();

    FormUtils.input('DebtorGroupCtrl.debtorGroup.max_credit', update.max_credit);

    /** debtor group characteristics */
    element(by.model('DebtorGroupCtrl.debtorGroup.is_convention')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.locked')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.apply_subsidies')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.apply_discounts')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.apply_billing_services')).click();

    /** contact */
    FormUtils.input('DebtorGroupCtrl.debtorGroup.phone', update.phone);
    FormUtils.input('DebtorGroupCtrl.debtorGroup.email', update.email);
    FormUtils.input('DebtorGroupCtrl.debtorGroup.note', update.note);

    /** location Plateau in Kasai  */
    var locations = [
     'dbe330b6-5cde-4830-8c30-dc00eccd1a5f', // Democratic Republic of the Congo
     '5cf83463-2718-4a65-abdd-f9ad2fe4e195', // Kasai Occidental,
     'ecd22221-88ad-49e2-84b2-c8161ad39f53', // Kananga,
     'f9d555de-434d-47ac-86bb-b0fcfd3bc75f' // Plateau
    ];

    components.locationSelect.set(locations);

    FormUtils.buttons.submit();

    FormUtils.exists(by.id('update_success'), true);
  });

  it('form blocks when missing data', function () {
    FormUtils.buttons.create();
    FormUtils.buttons.submit();
    FormUtils.exists(by.id('error-feedback'), true);
  });
});