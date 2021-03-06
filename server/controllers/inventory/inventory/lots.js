
var db = require('../../../lib/db');

exports.getInventoryLotsById = getInventoryLotsById;

/**
* Find all lots with stock remaining (postive quantiity) for a given inventory
* item.
*
* @function getInvetoryLotsById
* @returns {Promise} The database query
*/
function getInventoryLotsById(uuid) {
  'use strict';

  var sql;

  sql =
    `SELECT s.lot_number, s.quantity - IF(c.canceled, 0, IFNULL(c.quantity, 0)) AS quantity
    FROM stock AS s LEFT JOIN consumption AS c ON
      s.tracking_number = c.tracking_number
    WHERE s.inventory_uuid = ?`;

  return db.exec(sql, [uuid]);
}
