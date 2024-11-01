(function($) {
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds.
function wcsdmDebounce(func, wait) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;
    var later = function () {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function wcsdmToggleButtons(args) {
  var data = wcsdmGetButtons(args);
  $('#wcsdm-buttons').remove();
  $('#btn-ok').hide().after(wp.template('wcsdm-buttons')(data));
}

function wcsdmGetButtons(args) {
  var buttonLabels = wcsdmBackendVars.i18n.buttons;

  var leftButtonDefaultId = 'add-rate';
  var leftButtonDefaultLabel = wcsdmI18n('Add New Rate');

  var leftButtonDefault = {
    id: leftButtonDefaultId,
    label: leftButtonDefaultLabel
  };

  var rightButtonDefaultId = 'save-settings';
  var rightButtonDefaultLabel = wcsdmI18n('Save Changes');

  var rightButtonDefault = {
    id: rightButtonDefaultId,
    label: rightButtonDefaultLabel
  };

  var selected = {};
  var leftButton;
  var rightButton;

  if (_.has(args, 'left')) {
    leftButton = _.defaults(args.left, leftButtonDefault);

    if (_.has(buttonLabels, leftButton.label)) {
      leftButton.label = buttonLabels[leftButton.label];
    }

    selected.btn_left = leftButton;
  }

  if (_.has(args, 'right')) {
    rightButton = _.defaults(args.right, rightButtonDefault);

    if (_.has(buttonLabels, rightButton.label)) {
      rightButton.label = buttonLabels[rightButton.label];
    }

    selected.btn_right = rightButton;
  }

  if (_.isEmpty(selected)) {
    leftButton = _.defaults({}, leftButtonDefault);

    if (_.has(buttonLabels, leftButton.label)) {
      leftButton.label = buttonLabels[leftButton.label];
    }

    selected.btn_left = leftButton;

    rightButton = _.defaults({}, rightButtonDefault);

    if (_.has(buttonLabels, rightButton.label)) {
      rightButton.label = buttonLabels[rightButton.label];
    }

    selected.btn_right = rightButton;
  }

  return selected;
}

function wcsdmI18n(path) {
  return _.get(wcsdmBackendVars.i18n, path, path);
}

function wcsdmSprintf() {
  //  discuss at: https://locutus.io/php/sprintf/
  // original by: Ash Searle (https://hexmen.com/blog/)
  // improved by: Michael White (https://getsprink.com)
  // improved by: Jack
  // improved by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Dj
  // improved by: Allidylls
  //    input by: Paulo Freitas
  //    input by: Brett Zamir (https://brett-zamir.me)
  // improved by: Rafał Kukawski (https://kukawski.pl)
  //   example 1: sprintf("%01.2f", 123.1)
  //   returns 1: '123.10'
  //   example 2: sprintf("[%10s]", 'monkey')
  //   returns 2: '[    monkey]'
  //   example 3: sprintf("[%'#10s]", 'monkey')
  //   returns 3: '[####monkey]'
  //   example 4: sprintf("%d", 123456789012345)
  //   returns 4: '123456789012345'
  //   example 5: sprintf('%-03s', 'E')
  //   returns 5: 'E00'
  //   example 6: sprintf('%+010d', 9)
  //   returns 6: '+000000009'
  //   example 7: sprintf('%+0\'@10d', 9)
  //   returns 7: '@@@@@@@@+9'
  //   example 8: sprintf('%.f', 3.14)
  //   returns 8: '3.140000'
  //   example 9: sprintf('%% %2$d', 1, 2)
  //   returns 9: '% 2'

  var regex = /%%|%(?:(\d+)\$)?((?:[-+#0 ]|'[\s\S])*)(\d+)?(?:\.(\d*))?([\s\S])/g
  var args = arguments
  var i = 0
  var format = args[i++]

  var _pad = function (str, len, chr, leftJustify) {
    if (!chr) {
      chr = ' '
    }
    var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr)
    return leftJustify ? str + padding : padding + str
  }

  var justify = function (value, prefix, leftJustify, minWidth, padChar) {
    var diff = minWidth - value.length
    if (diff > 0) {
      // when padding with zeros
      // on the left side
      // keep sign (+ or -) in front
      if (!leftJustify && padChar === '0') {
        value = [
          value.slice(0, prefix.length),
          _pad('', diff, '0', true),
          value.slice(prefix.length)
        ].join('')
      } else {
        value = _pad(value, minWidth, padChar, leftJustify)
      }
    }
    return value
  }

  var _formatBaseX = function (value, base, leftJustify, minWidth, precision, padChar) {
    // Note: casts negative numbers to positive ones
    var number = value >>> 0
    value = _pad(number.toString(base), precision || 0, '0', false)
    return justify(value, '', leftJustify, minWidth, padChar)
  }

  // _formatString()
  var _formatString = function (value, leftJustify, minWidth, precision, customPadChar) {
    if (precision !== null && precision !== undefined) {
      value = value.slice(0, precision)
    }
    return justify(value, '', leftJustify, minWidth, customPadChar)
  }

  // doFormat()
  var doFormat = function (substring, argIndex, modifiers, minWidth, precision, specifier) {
    var number, prefix, method, textTransform, value

    if (substring === '%%') {
      return '%'
    }

    // parse modifiers
    var padChar = ' ' // pad with spaces by default
    var leftJustify = false
    var positiveNumberPrefix = ''
    var j, l

    for (j = 0, l = modifiers.length; j < l; j++) {
      switch (modifiers.charAt(j)) {
        case ' ':
        case '0':
          padChar = modifiers.charAt(j)
          break
        case '+':
          positiveNumberPrefix = '+'
          break
        case '-':
          leftJustify = true
          break
        case "'":
          if (j + 1 < l) {
            padChar = modifiers.charAt(j + 1)
            j++
          }
          break
      }
    }

    if (!minWidth) {
      minWidth = 0
    } else {
      minWidth = +minWidth
    }

    if (!isFinite(minWidth)) {
      throw new Error('Width must be finite')
    }

    if (!precision) {
      precision = (specifier === 'd') ? 0 : 'fFeE'.indexOf(specifier) > -1 ? 6 : undefined
    } else {
      precision = +precision
    }

    if (argIndex && +argIndex === 0) {
      throw new Error('Argument number must be greater than zero')
    }

    if (argIndex && +argIndex >= args.length) {
      throw new Error('Too few arguments')
    }

    value = argIndex ? args[+argIndex] : args[i++]

    switch (specifier) {
      case '%':
        return '%'
      case 's':
        return _formatString(value + '', leftJustify, minWidth, precision, padChar)
      case 'c':
        return _formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, padChar)
      case 'b':
        return _formatBaseX(value, 2, leftJustify, minWidth, precision, padChar)
      case 'o':
        return _formatBaseX(value, 8, leftJustify, minWidth, precision, padChar)
      case 'x':
        return _formatBaseX(value, 16, leftJustify, minWidth, precision, padChar)
      case 'X':
        return _formatBaseX(value, 16, leftJustify, minWidth, precision, padChar)
          .toUpperCase()
      case 'u':
        return _formatBaseX(value, 10, leftJustify, minWidth, precision, padChar)
      case 'i':
      case 'd':
        number = +value || 0
        // Plain Math.round doesn't just truncate
        number = Math.round(number - number % 1)
        prefix = number < 0 ? '-' : positiveNumberPrefix
        value = prefix + _pad(String(Math.abs(number)), precision, '0', false)

        if (leftJustify && padChar === '0') {
          // can't right-pad 0s on integers
          padChar = ' '
        }
        return justify(value, prefix, leftJustify, minWidth, padChar)
      case 'e':
      case 'E':
      case 'f': // @todo: Should handle locales (as per setlocale)
      case 'F':
      case 'g':
      case 'G':
        number = +value
        prefix = number < 0 ? '-' : positiveNumberPrefix
        method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(specifier.toLowerCase())]
        textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(specifier) % 2]
        value = prefix + Math.abs(number)[method](precision)
        return justify(value, prefix, leftJustify, minWidth, padChar)[textTransform]()
      default:
        // unknown specifier, consume that char and return empty
        return ''
    }
  }

  try {
    return format.replace(regex, doFormat)
  } catch (err) {
    return false
  }
}

(function (w) {
  'use strict';

  var A, F, O, consoleMethods, fixConsoleMethod, consoleOn,
    allHandlers, methodObj;

  A = [];
  F = function () { return; };
  O = {};

  // All possible standard methods to provide an interface for
  consoleMethods = [
    'assert', 'clear', 'count', 'debug',
    'dir', 'dirxml', 'error', 'exception',
    'group', 'groupCollapsed', 'groupEnd',
    'info', 'log', 'profile', 'profileEnd',
    'table', 'time', 'timeEnd', 'timeStamp',
    'trace', 'warn'
  ];

  // Holds handlers to be executed for every method
  allHandlers = [];

  // Holds handlers per method
  methodObj = {};

  // Overrides the existing console methods, to call any stored handlers first
  fixConsoleMethod = (function () {
    var func, empty;

    empty = function () {
      return F;
    };

    if (w.console) {
      // If `console` is even available
      func = function (methodName) {
        var old;
        if (methodName in console && (old = console[methodName])) {
          // Checks to see if `methodName` is defined on `console` and has valid function to execute
          // (and stores the old handler)
          // This is important so that undefined methods aren't filled in
          console[methodName] = function () {
            // Overwrites current console method with this function
            var args, argsForAll, i, j;
            // Copy all arguments passed to handler
            args = A.slice.call(arguments, 0);
            for (i = 0, j = methodObj[methodName].handlers.length; i < j; i++) {
              // Loop over all stored handlers for this specific method and call them
              F.apply.call(methodObj[methodName].handlers[i], console, args);
            }
            for (i = 0, j = allHandlers.length; i < j; i++) {
              // Loop over all stored handlers for ALL events and call them
              argsForAll = [methodName];
              A.push.apply(argsForAll, args);
              F.apply.call(allHandlers[i], console, argsForAll);
            }
            // Calls old
            F.apply.call(old, console, args);
          };
        }
        return console[methodName] || empty;
      };
    } else {
      func = empty;
    }

    return func;
  }());

  // Loop through all standard console methods and add a wrapper function that calls stored handlers
  (function () {
    var i, j, cur;
    for (i = 0, j = consoleMethods.length; i < j; i++) {
      // Loop through all valid console methods
      cur = consoleMethods[i];
      methodObj[cur] = {
        handlers: []
      };
      fixConsoleMethod(cur);
    }
  }());

  // Main handler exposed
  consoleOn = function (methodName, callback) {
    var key, cur;
    if (O.toString.call(methodName) === '[object Object]') {
      // Object literal provided as first argument
      for (key in methodName) {
        // Loop through all keys in object literal
        cur = methodName[key];
        if (key === 'all') {
          // If targeting all events
          allHandlers.push(cur);
        } else if (key in methodObj) {
          // If targeting specific valid event
          methodObj[key].handlers.push(cur);
        }
      }
    } else if (typeof methodName === 'function') {
      // Function provided as first argument
      allHandlers.push(methodName);
    } else if (methodName in methodObj) {
      // Valid String event provided
      methodObj[methodName].handlers.push(callback);
    }
  };

  // Actually expose an interface
  w.ConsoleListener = {
    on: consoleOn
  };
}(this));

/**
 * Map Picker
 */

function createSearchInput() {
  const searchInput = document.createElement("input");

  // Set CSS for the control.
  searchInput.type = "text";
  searchInput.id = "wcsdm-map-search-input";

  return searchInput;
}


var wcsdmMapPicker = {
  params: {},
  origin_lat: '',
  origin_lng: '',
  origin_address: '',
  zoomLevel: 16,
  apiKeyError: '',
  editingAPIKey: false,
  init: function (params) {
    wcsdmMapPicker.params = params;
    wcsdmMapPicker.apiKeyError = '';
    wcsdmMapPicker.editingAPIKey = false;

    ConsoleListener.on('error', function (errorMessage) {
      if (errorMessage.toLowerCase().indexOf('google') !== -1) {
        wcsdmMapPicker.apiKeyError = errorMessage;
      }

      if ($('.gm-err-message').length) {
        $('.gm-err-message').replaceWith('<p style="text-align:center">' + wcsdmMapPicker.convertError(errorMessage) + '</p>');
      }
    });

    // Show Store Location Picker
    $(document).off('click', '.wcsdm-btn--map-show', wcsdmMapPicker.showLocationPicker);
    $(document).on('click', '.wcsdm-btn--map-show', wcsdmMapPicker.showLocationPicker);

    // Hide Store Location Picker
    $(document).off('click', '#wcsdm-btn--map-cancel', wcsdmMapPicker.hideLocationPicker);
    $(document).on('click', '#wcsdm-btn--map-cancel', wcsdmMapPicker.hideLocationPicker);

    // Apply Store Location
    $(document).off('click', '#wcsdm-btn--map-apply', wcsdmMapPicker.applyLocationPicker);
    $(document).on('click', '#wcsdm-btn--map-apply', wcsdmMapPicker.applyLocationPicker);
  },
  showLocationPicker: function (event) {
    event.preventDefault();

    $(this).blur();

    wcsdmMapPicker.destroyMap();

    var modalContentMaxHeight = parseFloat($('.wc-modal-shipping-method-settings').css('max-height'));
    var modalContentPaddingTop = parseFloat($('.wc-modal-shipping-method-settings').css('padding-top'));
    var modalContentPaddingBottom = parseFloat($('.wc-modal-shipping-method-settings').css('padding-bottom'));
    var modalContentHeight = parseFloat(modalContentMaxHeight) - parseFloat(modalContentPaddingTop) - parseFloat(modalContentPaddingBottom);

    $('.wc-modal-shipping-method-settings').find('form').hide().after(wp.template('wcsdm-map-wrap')({
      height: modalContentHeight + 'px'
    }));

    wcsdmMapPicker.apiKeyError = '';

    var api_key_picker = $('#woocommerce_wcsdm_api_key_picker').val();

    wcsdmToggleButtons({
      left: {
        id: 'map-cancel',
        label: wcsdmI18n('Cancel'),
      },
      right: {
        id: 'map-apply',
        label: wcsdmI18n('Apply Changes'),
      }
    });

    $('.modal-close-link').hide();

    $('.wc-backbone-modal-header').find('h1').append('<span>' + wcsdmI18n('Store Location Picker') + '</span>');

    wcsdmMapPicker.initMap(api_key_picker);
  },
  hideLocationPicker: function (e) {
    e.preventDefault();

    wcsdmMapPicker.destroyMap();

    wcsdmToggleButtons();

    $('.modal-close-link').show();

    $('.wc-backbone-modal-header').find('h1 span').remove();

    $('.wc-modal-shipping-method-settings').find('form').show();
  },
  applyLocationPicker: function (e) {
    e.preventDefault();

    if (!wcsdmMapPicker.apiKeyError) {
      $('#woocommerce_wcsdm_origin_lat').val(wcsdmMapPicker.origin_lat);
      $('#woocommerce_wcsdm_origin_lng').val(wcsdmMapPicker.origin_lng);
      $('#woocommerce_wcsdm_origin_address').val(wcsdmMapPicker.origin_address);
    }

    wcsdmMapPicker.hideLocationPicker(e);
  },
  initMap: function (apiKey) {
    if (_.isEmpty(apiKey)) {
      apiKey = 'InvalidKey';
    }

    var script = document.createElement('script');
    script.id = 'wcsdm-google-maps-api';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&callback=initMap&loading=async&libraries=geometry,places';
    script.async = true;

    window.initMap = wcsdmMapPicker.renderMap;

    document.head.appendChild(script);
  },
  renderMap: function () {
    wcsdmMapPicker.origin_lat = $('#woocommerce_wcsdm_origin_lat').val();
    wcsdmMapPicker.origin_lng = $('#woocommerce_wcsdm_origin_lng').val();

    var currentLatLng = {
      lat: _.isEmpty(wcsdmMapPicker.origin_lat) ? parseFloat(wcsdmMapPicker.params.defaultLat) : parseFloat(wcsdmMapPicker.origin_lat),
      lng: _.isEmpty(wcsdmMapPicker.origin_lng) ? parseFloat(wcsdmMapPicker.params.defaultLng) : parseFloat(wcsdmMapPicker.origin_lng)
    };

    var map = new window.google.maps.Map(
      document.getElementById('wcsdm-map-canvas'),
      {
        mapTypeId: 'roadmap',
        center: currentLatLng,
        zoom: wcsdmMapPicker.zoomLevel,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }
    );

    var marker = new window.google.maps.Marker({
      map: map,
      position: currentLatLng,
      draggable: true,
      icon: wcsdmMapPicker.params.marker
    });

    var infoWindow = new window.google.maps.InfoWindow({ maxWidth: 350 });

    if (_.isEmpty(wcsdmMapPicker.origin_lat) || _.isEmpty(wcsdmMapPicker.origin_lng)) {
      infoWindow.setContent(wcsdmI18n('Please drag this marker or enter your address in the input field above.'));
      infoWindow.open(map, marker);
    } else {
      wcsdmMapPicker.setLatLng(marker.position, marker, map, infoWindow);
    }

    window.google.maps.event.addListener(marker, 'dragstart', function () {
      infoWindow.close();
    });

    window.google.maps.event.addListener(marker, 'dragend', function (event) {
      wcsdmMapPicker.setLatLng(event.latLng, marker, map, infoWindow);
    });

    const searchInputWrapper = document.createElement("div");

    // Create the control.
    const searchInput = createSearchInput(map);

    // Append the control to the DIV.
    searchInputWrapper.appendChild(searchInput);

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchInputWrapper);

    var mapSearchBox = new window.google.maps.places.SearchBox(searchInput);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
      mapSearchBox.setBounds(map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve more details for that place.
    mapSearchBox.addListener('places_changed', function () {

      var places = mapSearchBox.getPlaces();

      if (places.length === 0) {
        return;
      }

      // For each place, get the icon, name and location.
      var bounds = new window.google.maps.LatLngBounds();

      places.forEach(function (place) {
        if (!place.geometry) {
          console.log('Returned place contains no geometry');
          return;
        }

        if (marker && marker.setMap) {
          marker.setMap(null);
        }

        marker = new window.google.maps.Marker({
          map: map,
          position: place.geometry.location,
          draggable: true,
          icon: wcsdmMapPicker.params.marker
        });

        window.google.maps.event.addListener(marker, 'dragstart', function () {
          infoWindow.close();
        });

        window.google.maps.event.addListener(marker, 'dragend', function (event) {
          wcsdmMapPicker.setLatLng(event.latLng, marker, map, infoWindow);
        });

        wcsdmMapPicker.setLatLng(place.geometry.location, marker, map, infoWindow, place.formatted_address);

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });

      map.fitBounds(bounds);
    });
  },
  destroyMap: function () {
    if (window.google && window.google.maps) {
      window.google.maps = null;
    }

    $('wcsdm-google-maps-api').remove();
    $('#wcsdm-map-wrap').remove();
  },
  setLatLng: function (location, marker, map, infoWindow, formatted_address) {
    var geocoder = new window.google.maps.Geocoder();

    if (formatted_address) {
      wcsdmMapPicker.setInfoWindow(infoWindow, map, marker, location.lat().toString(), location.lng().toString(), formatted_address);

      wcsdmMapPicker.origin_lat = location.lat();
      wcsdmMapPicker.origin_lng = location.lng();
      wcsdmMapPicker.origin_address = formatted_address;
    } else {
      geocoder.geocode(
        {
          latLng: location
        },
        function (results, status) {
          if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
            wcsdmMapPicker.setInfoWindow(infoWindow, map, marker, location.lat().toString(), location.lng().toString(), results[0].formatted_address);

            wcsdmMapPicker.origin_lat = location.lat();
            wcsdmMapPicker.origin_lng = location.lng();
            wcsdmMapPicker.origin_address = results[0].formatted_address;
          }
        }
      );
    }

    $('#wcsdm-map-search-input').val('');

    map.setCenter(location);
  },
  setInfoWindow: function (infoWindow, map, marker, latitude, longitude, formatted_address) {
    var infoWindowContents = [
      '<div class="wcsdm-info-window-container">',
      '<div class="wcsdm-info-window-item">' + wcsdmI18n('Latitude') + '</div>',
      '<div class="wcsdm-info-window-item">' + latitude + '</div>',
      '<div class="wcsdm-info-window-item">' + wcsdmI18n('Longitude') + '</div>',
      '<div class="wcsdm-info-window-item">' + longitude + '</div>',
      '<div class="wcsdm-info-window-item">' + wcsdmI18n('Address') + '</div>',
      '<div class="wcsdm-info-window-item">' + formatted_address + '</div>',
      '</div>'
    ];

    infoWindow.setContent(infoWindowContents.join(''));
    infoWindow.open(map, marker);

    marker.addListener('click', function () {
      infoWindow.open(map, marker);
    });
  },
  convertError: function (text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, "<a href='$1' target='_blank'>$1</a>");
  },
};

/**
 * Table Rates
 */
var wcsdmTableRates = {
  params: {},
  errorId: 'wcsdm-errors-rate-fields',
  sortableTimer: null,
  init: function (params) {
    wcsdmTableRates.params = params;

    wcsdmTableRates.hideAdvancedRate();

    // Show advanced rate form
    $(document).off('click', '.wcsdm-action-link--show_advanced_rate', wcsdmTableRates.showAdvancedRate);
    $(document).on('click', '.wcsdm-action-link--show_advanced_rate', wcsdmTableRates.showAdvancedRate);

    // Close advanced rate form
    $(document).off('click', '#wcsdm-btn--cancel-advanced', wcsdmTableRates.closeAdvancedRate);
    $(document).on('click', '#wcsdm-btn--cancel-advanced', wcsdmTableRates.closeAdvancedRate);

    // Apply advanced rate
    $(document).off('click', '#wcsdm-btn--apply-advanced', wcsdmTableRates.applyAdvanced);
    $(document).on('click', '#wcsdm-btn--apply-advanced', wcsdmTableRates.applyAdvanced);

    // Add rate row
    $(document).off('click', '#wcsdm-btn--add-rate', wcsdmTableRates.addRate);
    $(document).on('click', '#wcsdm-btn--add-rate', wcsdmTableRates.addRate);

    // Delete rate row
    $(document).off('click', '#wcsdm-btn--delete-rate-select', wcsdmTableRates.showDeleteRateRowsForm);
    $(document).on('click', '#wcsdm-btn--delete-rate-select', wcsdmTableRates.showDeleteRateRowsForm);

    // Cancel delete rate row
    $(document).off('click', '#wcsdm-btn--delete-rate-cancel', wcsdmTableRates.deleteRateCancel);
    $(document).on('click', '#wcsdm-btn--delete-rate-cancel', wcsdmTableRates.deleteRateCancel);

    // Confirm delete rate row
    $(document).off('click', '#wcsdm-btn--delete-rate-confirm', wcsdmTableRates.deleteRateConfirm);
    $(document).on('click', '#wcsdm-btn--delete-rate-confirm', wcsdmTableRates.deleteRateConfirm);

    // Toggle selected rows
    $(document).off('change', '#wcsdm-table--table_rates--dummy thead .select-item', wcsdmTableRates.selectItemHead);
    $(document).on('change', '#wcsdm-table--table_rates--dummy thead .select-item', wcsdmTableRates.selectItemHead);

    // Toggle selected row
    $(document).off('change', '#wcsdm-table--table_rates--dummy tbody .select-item', wcsdmTableRates.selectItemBody);
    $(document).on('change', '#wcsdm-table--table_rates--dummy tbody .select-item', wcsdmTableRates.selectItemBody);

    // Handle change event dummy rate field
    $(document).off('focus', '.wcsdm-field--context--dummy.wcsdm-field--context--dummy--max_distance');
    $(document).on('focus', '.wcsdm-field--context--dummy.wcsdm-field--context--dummy--max_distance', function () {
      $(this).data('value', $(this).val());
    });

    $(document).off('blur', '.wcsdm-field--context--dummy.wcsdm-field--context--dummy--max_distance');
    $(document).on('blur', '.wcsdm-field--context--dummy.wcsdm-field--context--dummy--max_distance', function () {
      $(this).data('value', undefined);
    });

    $(document).off('input', '.wcsdm-field--context--dummy:not(a)');
    $(document).on('input', '.wcsdm-field--context--dummy:not(a)', wcsdmDebounce(function (e) {
      wcsdmTableRates.handleRateFieldDummy(e);
    }, 800));

    var validateDummyFieldsTimer;

    $(document.body).on('wc_add_error_tip', function (event, $input) {
      if (event.type !== 'wc_add_error_tip' || !$input.is('.wcsdm-field--context--dummy')) {
        return;
      }

      clearTimeout(validateDummyFieldsTimer);

      validateDummyFieldsTimer = setTimeout(function () {
        $input.trigger('input');

        if ($input.val().length) {
          wcsdmTableRates.sortRateRows();
        }
      }, 800);
    });

    // Toggle selected row
    $(document).off('change', '#woocommerce_wcsdm_distance_unit', wcsdmTableRates.initForm);
    $(document).on('change', '#woocommerce_wcsdm_distance_unit', wcsdmTableRates.initForm);

    wcsdmTableRates.initForm();

    if (!$('#wcsdm-table--table_rates--dummy tbody tr').length) {
      wcsdmTableRates.addRateRow();
    }

    wcsdmTableRates.sortRateRows();
  },
  initForm: function () {
    var distanceUnit = $('#woocommerce_wcsdm_distance_unit').val();
    var $distanceUnitFields = $('#woocommerce_wcsdm_distance_unit').data('fields');

    if (_.has($distanceUnitFields, 'label')) {
      var targets = $distanceUnitFields.label.targets;
      var value = $distanceUnitFields.label.value;
      _.each(targets, function (target) {
        $(target).text(value[distanceUnit]);
      });
    }

    if (_.has($distanceUnitFields, 'attribute')) {
      var targets = $distanceUnitFields.attribute.targets;
      var value = $distanceUnitFields.attribute.value;
      _.each(targets, function (target) {
        $(target).attr('data-unit', value[distanceUnit]);
      });
    }
  },
  addRate: function (e) {
    e.preventDefault();
    $(e.currentTarget).prop('disabled', true);

    wcsdmTableRates.addRateRow();
    wcsdmTableRates.sortRateRows();

    $(e.currentTarget).prop('disabled', false);
  },
  handleRateFieldDummy: function (e) {
    e.preventDefault();

    var $field = $(e.target);
    var $row = $field.closest('tr');
    $row.find('.wcsdm-field--context--hidden[data-id=' + $field.data('id') + ']').val(e.target.value);

    if ($field.hasClass('wcsdm-field--context--dummy--max_distance')) {
      $row.addClass('editing');

      if ($field.val() !== $field.data('value')) {
        wcsdmTableRates.sortRateRows($field);
      }
    }

    wcsdmTableRates.validateRows();
  },
  showAdvancedRate: function (e) {
    e.preventDefault();

    var $advancedRateFieldGroup = $('#woocommerce_wcsdm_field_group_advanced_rate');
    $advancedRateFieldGroup.nextAll('h3, p, .wc-shipping-zone-method-fields, table.form-table').show();
    $advancedRateFieldGroup.prevAll('h3, p, .wc-shipping-zone-method-fields, table.form-table, .wcsdm-notice').hide();

    var $row = $(e.currentTarget).closest('tr').addClass('editing');

    $row.find('.wcsdm-field--context--hidden').each(function () {
      $('.wcsdm-field--context--advanced[data-id=' + $(this).data('id') + ']').val($(this).val());
    });

    wcsdmToggleButtons({
      left: {
        id: 'cancel-advanced',
        label: wcsdmI18n('Cancel'),
      },
      right: {
        id: 'apply-advanced',
        label: wcsdmI18n('Apply Changes'),
      }
    });

    $('.modal-close-link').hide();

    $('.wc-backbone-modal-header').find('h1').append('<span>' + $advancedRateFieldGroup.text() + '</span>');
  },
  applyAdvanced: function (e) {
    e.preventDefault();

    $('.wcsdm-field--context--advanced').each(function () {
      var fieldId = $(this).data('id');
      var fieldValue = $(this).val();

      $('#wcsdm-table--table_rates--dummy tbody tr.editing .wcsdm-field--context--dummy[data-id=' + fieldId + ']:not(a)').val(fieldValue);
      $('#wcsdm-table--table_rates--dummy tbody tr.editing .wcsdm-field--context--hidden[data-id=' + fieldId + ']:not(a)').val(fieldValue);
    });

    wcsdmTableRates.closeAdvancedRate();
  },
  closeAdvancedRate: function () {
    wcsdmTableRates.hideAdvancedRate();

    wcsdmToggleButtons();

    $('.wc-backbone-modal-header').find('h1 span').remove();

    $('.modal-close-link').show();

    $('#wcsdm-table--table_rates--dummy tbody tr.selected').each(function () {
      $(this).find('.select-item').trigger('change');
    });

    wcsdmTableRates.scrollToTableRate();
    wcsdmTableRates.sortRateRows();
    wcsdmTableRates.validateRows();
  },
  hideAdvancedRate: function () {
    var $advancedRateFieldGroup = $('#woocommerce_wcsdm_field_group_advanced_rate');
    $advancedRateFieldGroup.hide().nextAll('h3, p, .wc-shipping-zone-method-fields, table.form-table').hide();
    $advancedRateFieldGroup.prevAll('h3, p, .wc-shipping-zone-method-fields, table.form-table, .wcsdm-notice').show();
  },
  highlightRow: function () {
    var $row = $('#wcsdm-table--table_rates--dummy tbody tr.editing').removeClass('editing');

    if ($row.length) {
      $row.addClass('highlighted');

      setTimeout(function () {
        $row.removeClass('highlighted');
      }, 1500);
    }
  },
  addRateRow: function () {
    var $lastRow = $('#wcsdm-table--table_rates--dummy tbody tr:last-child');

    $('#wcsdm-table--table_rates--dummy tbody').append(wp.template('wcsdm-dummy-row'));

    if ($lastRow) {
      $lastRow.find('.wcsdm-field--context--hidden:not(a)').each(function () {
        var $field = $(this);
        var fieldId = $field.data('id');
        var fieldValue = fieldId === 'woocommerce_wcsdm_max_distance' ? Math.ceil((parseInt($field.val(), 10) * 1.8)) : $field.val();
        $('#wcsdm-table--table_rates--dummy tbody tr:last-child .wcsdm-field[data-id=' + fieldId + ']').val(fieldValue);
      });
    }

    wcsdmTableRates.setRowNumber();
    wcsdmTableRates.scrollToTableRate();

    wcsdmTableRates.initForm();
  },
  showDeleteRateRowsForm: function (e) {
    e.preventDefault();

    var $heading = $('#woocommerce_wcsdm_field_group_table_rates');

    $heading.hide().prevAll().hide();
    $heading.next('p').hide();

    $('.wc-backbone-modal-header').find('h1').append('<span>' + $heading.text() + '</span><span>Delete</span>');
    $('#wcsdm-table--table_rates--dummy tbody tr:not(.selected)').hide();
    $('#wcsdm-table--table_rates--dummy').find('.select-item').prop('disabled', true);

    wcsdmToggleButtons({
      left: {
        id: 'delete-rate-cancel',
        label: wcsdmI18n('Cancel'),
      },
      right: {
        id: 'delete-rate-confirm',
        label: wcsdmI18n('Confirm Delete'),
      }
    });

    wcsdmTableRates.hideError();
  },
  deleteRateCancel: function (e) {
    e.preventDefault();

    var $heading = $('#woocommerce_wcsdm_field_group_table_rates');

    $heading.show().prevAll().show();
    $heading.next('p').show();

    $('.wc-backbone-modal-header').find('h1 span').remove();
    $('#wcsdm-table--table_rates--dummy tbody tr').show();
    $('#wcsdm-table--table_rates--dummy').find('.select-item').prop('disabled', false);

    $('#wcsdm-table--table_rates--dummy tbody tr.selected').each(function () {
      $(this).find('.select-item:checked').trigger('change');
    });

    wcsdmTableRates.sortRateRows();
    wcsdmTableRates.scrollToTableRate();
    wcsdmTableRates.validateRows();
  },
  deleteRateConfirm: function (e) {
    e.preventDefault();

    $('#wcsdm-table--table_rates--dummy tbody .select-item:checked').closest('tr').remove();

    if (!$('#wcsdm-table--table_rates--dummy tbody tr').length) {
      $('#wcsdm-table--table_rates--dummy thead .select-item:checked').prop('checked', false).trigger('change');
      wcsdmTableRates.addRateRow();
    }

    wcsdmToggleButtons();

    wcsdmTableRates.setRowNumber();

    wcsdmTableRates.deleteRateCancel(e);
  },
  selectItemHead: function (e) {
    e.preventDefault();

    var isChecked = $(e.target).is(':checked');

    $('#wcsdm-table--table_rates--dummy tbody tr').each(function () {
      wcsdmTableRates.toggleRowSelected($(this), isChecked);
    });

    if (isChecked) {
      wcsdmToggleButtons({
        left: {
          id: 'delete-rate-select',
          label: wcsdmI18n('Delete Selected Rates'),
        }
      });
    } else {
      wcsdmToggleButtons();
    }
  },
  selectItemBody: function (e) {
    e.preventDefault();

    var $field = $(e.target);
    var $row = $(e.target).closest('tr');

    wcsdmTableRates.toggleRowSelected($row, $field.is(':checked'));

    if ($('#wcsdm-table--table_rates--dummy tbody .select-item:checked').length) {
      wcsdmToggleButtons({
        left: {
          id: 'delete-rate-select',
          label: wcsdmI18n('Delete Selected Rates'),
        }
      });
    } else {
      wcsdmToggleButtons();
    }

    var isBulkChecked = $('#wcsdm-table--table_rates--dummy tbody .select-item').length === $('#wcsdm-table--table_rates--dummy tbody .select-item:checked').length;

    $('#wcsdm-table--table_rates--dummy thead .select-item').prop('checked', isBulkChecked);
  },
  toggleRowSelected: function ($row, isChecked) {
    $row.find('.wcsdm-field--context--dummy').prop('disabled', isChecked);

    if (isChecked) {
      $row.addClass('selected').find('.select-item').prop('checked', isChecked);
      $row.find('.wcsdm-action-link').addClass('wcsdm-disabled');
    } else {
      $row.removeClass('selected').find('.select-item').prop('checked', isChecked);
      $row.find('.wcsdm-action-link').removeClass('wcsdm-disabled');
    }
  },
  sortRateRows: function ($fieldFocus) {

    var rows = $('#wcsdm-table--table_rates--dummy > tbody > tr').get().sort(function (a, b) {

      var aMaxDistance = $(a).find('.wcsdm-field--context--dummy--max_distance').val();
      var bMaxDistance = $(b).find('.wcsdm-field--context--dummy--max_distance').val();

      var aIndex = $(a).find('.wcsdm-field--context--dummy--max_distance').index();
      var bIndex = $(b).find('.wcsdm-field--context--dummy--max_distance').index();

      if (isNaN(aMaxDistance) || !aMaxDistance.length) {
        return 2;
      }

      aMaxDistance = parseFloat(aMaxDistance);
      bMaxDistance = parseFloat(bMaxDistance);

      if (aMaxDistance < bMaxDistance) {
        return -1;
      }

      if (aMaxDistance > bMaxDistance) {
        return 1;
      }

      if (aIndex < bIndex) {
        return -1;
      }

      if (aIndex > bIndex) {
        return 1;
      }

      return 0;
    });

    var maxDistances = {};

    $.each(rows, function (index, row) {
      var maxDistance = $(row).find('.wcsdm-field--context--dummy--max_distance').val();

      if (!maxDistances[maxDistance]) {
        maxDistances[maxDistance] = [];
      }

      maxDistances[maxDistance].push($(row));

      $(row).addClass('wcsdm-rate-row-index--' + index).attr('data-max-distance', maxDistance).appendTo($('#wcsdm-table--table_rates--dummy').children('tbody')).fadeIn('slow');
    });

    _.each(maxDistances, function (rows) {
      _.each(rows, function (row) {
        if (rows.length > 1) {
          $(row).addClass('wcsdm-sort-enabled');
          $(row).find('.wcsdm-action-link--sort_rate').removeClass('wcsdm-action-link--sort_rate--disabled');
        } else {
          $(row).removeClass('wcsdm-sort-enabled');
          $(row).find('.wcsdm-action-link--sort_rate').addClass('wcsdm-action-link--sort_rate--disabled');
        }
      });
    });

    clearTimeout(wcsdmTableRates.sortableTimer);

    wcsdmTableRates.sortableTimer = setTimeout(function () {
      wcsdmTableRates.setRowNumber();
      wcsdmTableRates.highlightRow();

      if ($('#wcsdm-table--table_rates--dummy > tbody').sortable('instance')) {
        $('#wcsdm-table--table_rates--dummy > tbody').sortable('destroy');
      }

      $('#wcsdm-table--table_rates--dummy tbody').sortable({
        scroll: false,
        cursor: 'move',
        axis: 'y',
        placeholder: 'ui-state-highlight',
        items: 'tr.wcsdm-sort-enabled',
        start: function (event, ui) {
          if (ui.item.hasClass('wcsdm-sort-enabled')) {
            $(event.currentTarget).find('tr').each(function () {
              if (ui.item.attr('data-max-distance') === $(this).attr('data-max-distance')) {
                $(this).addClass('sorting');
              } else {
                $(this).removeClass('sorting');
              }
            });

            $('#wcsdm-table--table_rates--dummy > tbody').sortable('option', 'items', 'tr.wcsdm-sort-enabled.sorting').sortable('refresh');
          } else {
            $('#wcsdm-table--table_rates--dummy > tbody').sortable('cancel');
          }
        },
        stop: function () {
          $('#wcsdm-table--table_rates--dummy > tbody').sortable('option', 'items', 'tr.wcsdm-sort-enabled').sortable('refresh').find('tr').removeClass('sorting');
          wcsdmTableRates.setRowNumber();
        },
      }).disableSelection();

      if ($fieldFocus) {
        $fieldFocus.focus();
      }
    }, 100);
  },
  scrollToTableRate: function () {
    $('.wc-modal-shipping-method-settings').scrollTop($('.wc-modal-shipping-method-settings').find('form').outerHeight());
  },
  validateRows: function () {
    wcsdmTableRates.hideError();

    var uniqueKeys = {};
    var ratesData = [];

    $('#wcsdm-table--table_rates--dummy > tbody > tr').each(function () {
      var $row = $(this);
      var rowIndex = $row.index();
      var rowData = {
        index: rowIndex,
        error: false,
        fields: {},
      };

      var uniqueKey = [];

      $row.find('input.wcsdm-field--context--hidden').each(function () {
        var $field = $(this);
        var fieldTitle = $field.data('title');
        var fieldKey = $field.data('key');
        var fieldId = $field.data('id');
        var fieldValue = $field.val().trim();

        var fieldData = {
          title: fieldTitle,
          value: fieldValue,
          key: fieldKey,
          id: fieldId,
        };

        if ($field.hasClass('wcsdm-field--is-required') && fieldValue.length < 1) {
          fieldData.error = wcsdmTableRates.rateRowError(rowIndex, wcsdmSprintf(wcsdmI18n('%s field is required.'), fieldTitle));
        }

        if (!fieldData.error && fieldValue.length) {
          if ($field.data('type') === 'number' && isNaN(fieldValue)) {
            fieldData.error = wcsdmTableRates.rateRowError(rowIndex, wcsdmSprintf(wcsdmI18n('%s field value must be numeric.'), fieldTitle));
          }

          var fieldValueInt = parseInt(fieldValue, 10);

          if (typeof $field.attr('min') !== 'undefined' && fieldValueInt < parseInt($field.attr('min'), 10)) {
            fieldData.error = wcsdmTableRates.rateRowError(rowIndex, wcsdmSprintf(wcsdmI18n('%1$s field value cannot be lower than %2$.d'), fieldTitle, $field.attr('min')));
          }

          if (typeof $field.attr('max') !== 'undefined' && fieldValueInt > parseInt($field.attr('max'), 10)) {
            fieldData.error = wcsdmTableRates.rateRowError(rowIndex, wcsdmSprintf(wcsdmI18n('%1$s field value cannot be greater than %2$d'), fieldTitle, $field.attr('max')));
          }
        }

        if ($field.data('is_rule') && fieldValue.length) {
          uniqueKey.push(wcsdmSprintf('%s__%s', fieldKey, fieldValue));
        }

        rowData.fields[fieldKey] = fieldData;
      });

      if (uniqueKey.length) {
        var uniqueKeyString = uniqueKey.join('___');

        if (_.has(uniqueKeys, uniqueKeyString)) {
          var duplicateKeys = [];

          for (var i = 0; i < uniqueKey.length; i++) {
            var keySplit = uniqueKey[i].split('__');
            var title = $row.find('input.wcsdm-field--context--hidden[data-key="' + keySplit[0] + '"]').data('title');

            duplicateKeys.push(title);
          }

          rowData.error = wcsdmTableRates.rateRowError(rowIndex, wcsdmSprintf(wcsdmI18n('Shipping rules combination duplicate with rate row #%1$d: %2$s.'), wcsdmTableRates.indexToNumber(uniqueKeys[uniqueKeyString]), duplicateKeys.join(', ')));
        } else {
          uniqueKeys[uniqueKeyString] = rowIndex;
        }
      }

      ratesData.push(rowData);
    });

    var errorText = '';

    _.each(ratesData, function (rowData) {
      if (rowData.error) {
        errorText += wcsdmSprintf('<p>%s</p>', rowData.error.message);
      }

      _.each(rowData.fields, function (field) {
        if (field.error) {
          errorText += wcsdmSprintf('<p>%s</p>', field.error.message);
        }
      });
    });

    if (!errorText) {
      return true;
    }

    $('#woocommerce_wcsdm_field_group_table_rates').next('p').after('<div class="error notice wcsdm-notice">' + errorText + '</div>');
  },
  rateRowError: function (rowIndex, errorMessage) {
    return new Error(wcsdmSprintf(wcsdmI18n('Table rate row #%1$d: %2$s.'), wcsdmTableRates.indexToNumber(rowIndex), errorMessage));
  },
  hideError: function () {
    $('#woocommerce_wcsdm_field_group_table_rates').next('p').next('.wcsdm-notice').remove();
  },
  setRowNumber: function () {
    $('#wcsdm-table--table_rates--dummy > tbody > tr').each(function () {
      $(this).find('.wcsdm-col--type--row_number').text(($(this).index() + 1));
    });
  },
  indexToNumber: function (rowIndex) {
    return (rowIndex + 1);
  },
};

(function ($, wcsdmBackendVars) {
  /**
 * Backend Scripts
 */

  function submitForm(e) {
    e.preventDefault();

     if (!wcsdmTableRates.validateRows()) {
      window.alert(wcsdmI18n('Table rates data is incomplete or invalid!'));
    } else {
      $('#btn-ok').trigger('click');
    }
  }

  function toggleStoreOriginFields(e) {
    e.preventDefault();

    var selected = $(this).val();
    var fields = $(this).data('fields');
    _.each(fields, function (fieldIds, fieldValue) {
      _.each(fieldIds, function (fieldId) {
        if (fieldValue !== selected) {
          if ($('#' + fieldId).closest('tr').length) {
            $('#' + fieldId).closest('tr').hide();
          } else {
            $('label[for="' + fieldId + '"]').hide().next().hide();
          }
        } else {
          if ($('#' + fieldId).closest('tr').length) {
            $('#' + fieldId).closest('tr').show();
          } else {
            $('label[for="' + fieldId + '"]').show().next().show();
          }
        }
      });
    });
  }

  function removeEmptyRows() {
    $('.wc-modal-shipping-method-settings table.form-table:empty').remove();
    $('.wc-shipping-zone-method-fields:empty').remove();
  }

  function renderForm() {
    if (!$('#woocommerce_wcsdm_origin_type') || !$('#woocommerce_wcsdm_origin_type').length) {
      return;
    }

    removeEmptyRows();

    // Submit form
    $(document).off('click', '#wcsdm-btn--save-settings', submitForm);
    $(document).on('click', '#wcsdm-btn--save-settings', submitForm);

    // Toggle Store Origin Fields
    $(document).off('change', '#woocommerce_wcsdm_origin_type', toggleStoreOriginFields);
    $(document).on('change', '#woocommerce_wcsdm_origin_type', toggleStoreOriginFields);

    $('#woocommerce_wcsdm_origin_type').trigger('change');

    var params = _.mapObject(wcsdmBackendVars, function (val, key) {
      switch (key) {
        case 'default_lat':
        case 'default_lng':
        case 'test_destination_lat':
        case 'test_destination_lng':
          return parseFloat(val);

        default:
          return val;
      }
    });

    wcsdmTableRates.init(params);
    wcsdmMapPicker.init(params);

    wcsdmToggleButtons();
  }

  function initForm() {
    // Init form
    $(document.body).off('wc_backbone_modal_loaded', renderForm);
    $(document.body).on('wc_backbone_modal_loaded', renderForm);
  }

  var initFormTimeout;

  function initFormDebounce() {
    if (initFormTimeout) {
      clearTimeout(initFormTimeout);
    }

    initFormTimeout = setTimeout(initForm, 100);
  }

  $(document).ready(initForm);

  $(window).on('resize orientationchange', initFormDebounce);
})(jQuery, window.wcsdmBackendVars);
}(jQuery));
