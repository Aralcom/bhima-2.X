angular.module('bhima.controllers')
.controller('CashPaymentRegistryController', CashPaymentRegistryController);

// dependencies injection
CashPaymentRegistryController.$inject = [
  'CashService', 'NotifyService', 'SessionService', 'ModalService',
  'uiGridConstants',  'uiGridGroupingConstants', 'LanguageService'
];

/**
 * Cash Payment Registry Controller
 * This controller is responsible to display all cash payment made and provides
 * print and search utilities for the registry
 */
function CashPaymentRegistryController(Cash, Notify, Session, Modal, uiGridConstants, uiGridGroupingConstants, Languages) {
  var vm = this;

  var initFilter = { identifiers: {}, display: {} };

  // global variables
  vm.filters = { lang: Languages.key };
  vm.formatedFilters = [];
  vm.gridOptions = {};
  vm.loading = false;
  vm.enterprise = Session.enterprise;

  // expose to the view
  vm.showReceipt = showReceipt;
  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;

  // grid default options
  vm.gridOptions.appScopeProvider  = vm;
  vm.gridOptions.showColumnFooter  = true;
  vm.gridOptions.enableColumnMenus = false;
  vm.gridOptions.enableFiltering   = vm.filterEnabled;
  vm.gridOptions.columnDefs        = [
    { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE',
      headerCellFilter: 'translate',
      aggregationType: uiGridConstants.aggregationTypes.count
    },
    { field : 'date', displayName : 'TABLE.COLUMNS.DATE',
      headerCellFilter: 'translate',
      cellFilter : 'date:"mediumDate"',
      customTreeAggregationFinalizerFn: timeAggregation
    },
    { field : 'debtor_name', displayName : 'TABLE.COLUMNS.CLIENT',
      headerCellFilter: 'translate'
    },
    { field : 'description', displayName : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter: 'translate'
    },
    { field : 'amount', displayName : 'TABLE.COLUMNS.AMOUNT',
      headerCellFilter: 'translate',
      cellTemplate: 'partials/finance/reports/cash_payment/templates/amount.grid.html'
    },
    { field : 'cashbox_label', displayName : 'TABLE.COLUMNS.CASHBOX',
      headerCellFilter: 'translate'
    },
    { field : 'display_name', displayName : 'TABLE.COLUMNS.USER',
      headerCellFilter: 'translate'
    },
    { field : 'action', displayName : '...',
      cellTemplate: 'partials/finance/reports/cash_payment/templates/action.grid.html',
      enableFiltering: false
    }
  ];

  // search
  function search() {
    Modal.openSearchCashPayment()
    .then(function (filters) {
      if (!filters) { return; }

      reload(filters);
    })
    .catch(Notify.handleError);
  }

  // on remove one filter
  function onRemoveFilter(key) {
    if (key === 'dateFrom' ||  key === 'dateTo') {
      // remove all dates filters if one selected
      delete vm.filters.identifiers.dateFrom;
      delete vm.filters.identifiers.dateTo;
      delete vm.filters.display.dateFrom;
      delete vm.filters.display.dateTo;
    } else {
      // remove the key
      delete vm.filters.identifiers[key];
      delete vm.filters.display[key];
    }
    reload(vm.filters);
  }

  // remove a filter with from the filter object, save the filters and reload
  function clearFilters() {
    reload(initFilter);
  }

  // reload with filter
  function reload(filters) {
    vm.filters = filters;
    vm.formatedFilters = Cash.formatFilterParameters(filters.display);
    load(filters.identifiers);
  }

  // showReceipt
  function showReceipt(uuid) {
    var url = '/reports/finance/cash/' + uuid;
    var params = { renderer: 'pdf', lang: Languages.key };
    Modal.openReports({ url: url, params: params });
  }

  // Time Aggregation
  function timeAggregation(aggregation) {
    var date = new Date(aggregation.groupVal);
    var time = date.getHours() + ':' + date.getMinutes();
    aggregation.rendered = aggregation.groupVal ? date.toDateString().concat('  (', time, ')') : null;
  }

  // load cash
  function load(filters) {
    Cash.search(filters)
    .then(function (list) {
      vm.gridOptions.data = list;
    })
    .catch(Notify.handleError);
  }

  // startup
  load();

}
