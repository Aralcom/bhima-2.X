/**
* The /employees HTTP API endpoint
*
* @module admin/employees
*
* @description This controller is responsible for implementing all crud on the
* employees table through the `/employees` endpoint.
*
* @requires lib/db
*
* NOTE: This api does not handle the deletion of employees because
* that subject is not in the actuality.
*/

'use strict';

var db = require('./../../lib/db');
var uuid = require('node-uuid');

/**
* Returns an array of each employee in the database
*
* @param {object} request The express request object
* @param {object} response The express response object
* @param {object} next The express middleware next object
*
* @example
* // GET /employees : Get list of employees
* var employees = require('admin/employees');
* employees.list(request, response, next);
*/
exports.list = function (req, res, next) {
  var sql =
    'SELECT ' +
    'employee.id, employee.code AS code_employee, employee.prenom, employee.name, ' +
    'employee.postnom, employee.sexe, employee.dob, employee.date_embauche, employee.service_id, ' +
    'employee.nb_spouse, employee.nb_enfant, employee.grade_id, employee.locked, grade.text, grade.basic_salary, ' +
    'fonction.id AS fonction_id, fonction.fonction_txt, ' +
    'employee.phone, employee.email, employee.adresse, employee.bank, employee.bank_account, employee.daily_salary, employee.location_id, ' +
    'grade.code AS code_grade, debitor.uuid as debitor_uuid, debitor.text AS debitor_text,debitor.group_uuid as debitor_group_uuid, ' +
    'creditor.uuid as creditor_uuid, creditor.text AS creditor_text, creditor.group_uuid as creditor_group_uuid, creditor_group.account_id ' +
    'FROM employee ' +
    ' JOIN grade ON employee.grade_id = grade.uuid ' +
    ' JOIN fonction ON employee.fonction_id = fonction.id ' +
    ' JOIN debitor ON employee.debitor_uuid = debitor.uuid ' +
    ' JOIN creditor ON employee.creditor_uuid = creditor.uuid ' +
    ' JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid ' +
    ' ORDER BY employee.name ASC, employee.postnom ASC, employee.prenom ASC';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

/**
* Get list of availaible holidays for an employee
*/
exports.listHolidays = function (req, res, next) {
  var pp = JSON.parse(req.params.pp);
  var sql =
    'SELECT holiday.id, holiday.label, holiday.dateFrom, holiday.percentage, holiday.dateTo ' +
    'FROM holiday WHERE ' +
    '((holiday.dateFrom >= ? AND holiday.dateFrom <= ?) OR ' +
    '(holiday.dateTo >= ? AND holiday.dateTo <= ?) OR ' +
    '(holiday.dateFrom <= ? AND holiday.dateTo >a ?)) AND ' +
    'holiday.employee_id = ? ;';

  var data = [
    pp.dateFrom, pp.dateTo,
    pp.dateFrom, pp.dateTo,
    pp.dateFrom, pp.dateFrom,
    req.params.employee_id
  ];

  db.exec(sql, data)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

/**
* Check an existing holiday
*/
exports.checkHoliday = function (req, res, next) {
  var sql =
    'SELECT id, employee_id, label, dateTo, percentage, dateFrom FROM holiday WHERE employee_id = ?' +
    ' AND ((dateFrom >= ?) OR (dateTo >= ?) OR (dateFrom >= ?) OR (dateTo >= ?))' +
    ' AND ((dateFrom <= ?) OR (dateTo <= ?) OR (dateFrom <= ?) OR (dateTo <= ?))';

  var data = [
    req.query.employee_id,
    req.query.dateFrom, req.query.dateFrom, req.query.dateTo, req.query.dateTo,
    req.query.dateFrom, req.query.dateFrom, req.query.dateTo, req.query.dateTo
  ];

  if (req.query.line !== '') {
    sql += ' AND id <> ?';
    data.push(req.query.line);
  }

  db.exec(sql, data)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

/**
* Check an existing offday
*/
exports.checkOffday = function checkHoliday(req, res, next) {
  var sql ='SELECT * FROM offday WHERE date = ? AND id <> ?';
  db.exec(sql, [req.query.date, req.query.id])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

function lookupEmployee(id, codes) {
  'use strict';

  var sql =
    'SELECT employee.id, employee.code AS code_employee, employee.prenom, employee.name, ' +
      'employee.postnom, employee.sexe, employee.dob, employee.date_embauche, employee.service_id, ' +
      'employee.nb_spouse, employee.nb_enfant, employee.grade_id, employee.locked, grade.text, grade.basic_salary, ' +
      'fonction.id AS fonction_id, fonction.fonction_txt, service.name AS service_txt, ' +
      'employee.phone, employee.email, employee.adresse, employee.bank, employee.bank_account, ' +
      'employee.daily_salary, employee.location_id, grade.code AS code_grade, debitor.uuid as debitor_uuid, ' +
      'debitor.text AS debitor_text,debitor.group_uuid as debitor_group_uuid, ' +
      'creditor.uuid as creditor_uuid, creditor.text AS creditor_text, ' +
      'creditor.group_uuid as creditor_group_uuid, creditor_group.account_id ' +
    'FROM employee ' +
      'JOIN grade ON employee.grade_id = grade.uuid ' +
      'JOIN fonction ON employee.fonction_id = fonction.id ' +
      'JOIN debitor ON employee.debitor_uuid = debitor.uuid ' +
      'JOIN creditor ON employee.creditor_uuid = creditor.uuid ' +
      'JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid ' +
      'LEFT JOIN service ON service.id = employee.service_id ' +
    'WHERE employee.id = ? ';

  return db.exec(sql, [id])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new codes.ERR_NOT_FOUND();
    }

    return rows[0];
  });
}



/**
* Returns an object of details of an employee referenced by an `id` in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express middleware next object
*
* @example
* // GET /employees/:id : Get details of an employee
* var employees = require('admin/employees');
* employees.details(req, res, next);
*/
exports.detail = function detail(req, res, next) {
  lookupEmployee(req.params.id, req.codes)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();  
};

/**
* Update details of an employee referenced by an `id` in the database
*
* @param {object} request The express request object
* @param {object} response The express response object
* @param {object} next The express middleware next object
*
* @example
* // PUT /employees/:id : Update details of an employee
* var employees = require('admin/employees');
* employees.update(req, res, next);
*/
exports.update = function update(req, res, next) {
  var employee = req.body;

  var transaction;

  var creditor = {
    uuid : employee.creditor_uuid,
    group_uuid : employee.creditor_group_uuid,
    text : 'Crediteur [' + employee.prenom + ' - ' + employee.name + ' - ' + employee.postnom + ']'
  };

  var debitor = {
    uuid : employee.debitor_uuid,
    group_uuid : employee.debitor_group_uuid,
    text : 'Debiteur [' + employee.prenom + ' - ' + employee.name + ' - ' + employee.postnom + ']'
  };  


  if (employee.dob) {
    employee.dob = new Date(employee.dob);
  }
  if (employee.date_embauche) {
    employee.date_embauche = new Date(employee.date_embauche);
  }

  var clean = {
    prenom : employee.prenom,
    name : employee.name, 
    postnom : employee.postnom,
    sexe : employee.sexe,
    dob : employee.dob,
    date_embauche : employee.date_embauche,
    service_id : employee.service_id,
    nb_spouse : employee.nb_spouse,
    nb_enfant : employee.nb_enfant,
    grade_id : employee.grade_id,
    locked : employee.locked,
    fonction_id : employee.fonction_id,
    phone : employee.phone,
    email : employee.email,
    adresse : employee.adresse,
    bank : employee.bank,
    bank_account : employee.bank_account,
    daily_salary : employee.daily_salary,
    location_id : employee.location_id,
    code : employee.code
  };

  var updateCreditor = 'UPDATE creditor SET ? WHERE creditor.uuid = ?';
  var updateDebitor = 'UPDATE debitor SET ? WHERE debitor.uuid = ?';
  var sql = 'UPDATE employee SET ? WHERE employee.id = ?';

  transaction = db.transaction();

  transaction
    .addQuery(updateCreditor, [creditor, creditor.uuid])
    .addQuery(updateDebitor, [debitor, debitor.uuid])
    .addQuery(sql, [clean, req.params.id]);

  transaction.execute()
    .then(function (results) {
      if (!results[2].affectedRows) {
        throw new req.codes.ERR_NOT_FOUND();
      }

      return lookupEmployee(req.params.id, req.codes);
    })
    .then(function (rows) {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
};

/**
* This function is responsible for creating a new employee in the database
*
* @param {object} request The express request object
* @param {object} response The express response object
* @param {object} next The express middleware next object
*
* @example
* // POST /employees/ : Create a new employee
* var employees = require('admin/employees');
* employees.create(req, res, next);
*/
exports.create = function create(req, res, next) {
  var creditorUuid = uuid.v4();
  var debitorUuid = uuid.v4();
  var transaction;
  var employee = req.body;

  var creditor = {
    uuid : creditorUuid,
    group_uuid : employee.creditor_group_uuid,
    text : 'Crediteur [' + employee.prenom + ' - ' + employee.name + ' - ' + employee.postnom + ']'
  };

  var debitor = {
    uuid : debitorUuid,
    group_uuid : employee.debitor_group_uuid,
    text : 'Debiteur [' + employee.prenom + ' - ' + employee.name + ' - ' + employee.postnom + ']'
  };  

  employee.creditor_uuid = creditorUuid; 
  employee.debitor_uuid = debitorUuid; 

  delete(employee.debitor_group_uuid);
  delete(employee.creditor_group_uuid);

  var writeCreditor = "INSERT INTO creditor SET ?";
  var writeDebitor = "INSERT INTO debitor SET ?";
  var sql = 'INSERT INTO employee SET ?';

  // ensure dates are MySQL-parseable.
  if (employee.dob) {
    employee.dob = new Date(employee.dob);
  }
  if (employee.date_embauche) {
    employee.date_embauche = new Date(employee.date_embauche);
  }

  transaction = db.transaction();

  transaction
    .addQuery(writeCreditor, [creditor])
    .addQuery(writeDebitor, [debitor])
    .addQuery(sql, [employee]);

  transaction.execute()
    .then(function (results) {

      res.status(201).json({ id: results[2].insertId });
    })
    .catch(next)
    .done();
};

/**
*This function is responsible for looking for employee by names or code
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express middleware next object
*
* @example
* // GET /employees/names/x
* var employees = require('admin/employees');
* employees.search(req, res, next);
**/

exports.search = function search(req, res, next){
  
  var searchOption = '', sql = '';
  var keyValue = '%' + req.params.value + '%';

  if (req.params.key === 'code'){
    searchOption = 'LOWER(employee.code)';
  }else if(req.params.key === 'names'){
    searchOption = 'LOWER(CONCAT(employee.prenom, employee.name, employee.postnom))';
  }else{
    return next(new req.codes.ERR_BAD_VALUE());
  }

  sql = 'SELECT ' +
    'employee.id, employee.code AS code_employee, employee.prenom, employee.name, ' +
    'employee.postnom, employee.locked, employee.bank, employee.bank_account, ' + 
    'creditor.uuid as creditor_uuid, creditor.group_uuid as creditor_group_uuid, ' +
    'creditor_group.account_id FROM employee ' +
    'JOIN creditor ON employee.creditor_uuid = creditor.uuid ' +
    'JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid ' +
    'WHERE ' + searchOption + ' LIKE ? LIMIT 10';

    db.exec(sql, [keyValue])
    .then(function (rows){
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
};


