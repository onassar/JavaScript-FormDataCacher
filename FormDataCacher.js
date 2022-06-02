
/**
 * FormDataCacher
 * 
 * @todo    Detect max content size (2mb) and don't save any input when that
 *          happens (otherwise risking storing partial data, which could be
 *          worse)
 * @access  public
 * @var     Object
 */
var FormDataCacher = (function() {

    /**
     * Properties
     * 
     */

    /**
     * __config
     * 
     * @access  private
     * @var     Object
     */
    var __config = {

        /**
         * changeInterval
         * 
         * @access  private
         * @var     Number (default: 1000)
         */
        changeInterval: 1000,

        /**
         * selector
         * 
         * @access  private
         * @var     String (default: '[data-form-data-cacher-id]')
         */
        selector: '[data-form-data-cacher-id]',

        /**
         * storageMethod
         * 
         * @access  private
         * @var     String (default: 'localStorage')
         */
        storageMethod: 'localStorage'
    };

    /**
     * __string
     * 
     * @access  private
     * @var     String (default: 'FormDataCacher')
     */
    var __string = 'FormDataCacher';

    /**
     * __trackedForms
     * 
     * @access  private
     * @var     Array (default: [])
     */
    var __trackedForms = [];

    /**
     * Methods
     * 
     */

    /**
     * __cacheData
     * 
     * @access  private
     * @param   String key
     * @param   mixed value
     * @return  void
     */
    var __cacheData = function(key, value) {
        localStorage.setItem(key, value);
    };

    /**
     * __getCachedData
     * 
     * @access  private
     * @param   String key
     * @return  mixed
     */
    var __getCachedData = function(key) {
        var data = localStorage.getItem(key);
        return data;
    };

    /**
     * __getCachedFormDataObject
     * 
     * @access  private
     * @param   HTMLFormElement $element
     * @return  undefined|Object
     */
    var __getCachedFormDataObject = function($element) {
        var id = $element.getAttribute('data-form-data-cacher-id'),
            key = 'FormDataCacher:' + __getCacheKeyVersion() + ':' + (id),
            data = __getCachedData(key);
        if (data === null) {
            return undefined;
        }
        data = JSON.parse(data);
        return data;
    };

    /**
     * __getCacheKeyVersion
     * 
     * @access  private
     * @return  String
     */
    var __getCacheKeyVersion = function() {
        var version = '12-11-2021';
        return version;
    };

    /**
     * __getPageFormDataObject
     * 
     * @access  private
     * @param   HTMLFormElement $element
     * @return  Object
     */
    var __getPageFormDataObject = function($element) {
        var $elements = $element.elements,
            pageFormData = {};
        for (var $element of $elements) {
            var name = $element.name,
                value = $element.value;
            pageFormData[name] = value;
        }
        return pageFormData;
    };

    /**
     * __scan
     * 
     * @access  private
     * @return  void
     */
    var __scan = function() {
        var selector = __config.selector,
            $elements = document.querySelectorAll(selector);
        for (var $element of $elements) {
            if (__trackedForms.includes($element) === true) {
                continue;
            }
            __trackedForms.push($element);
            __setPageFormElementValues($element);
            setInterval(function() {
                __trackChanges($element);
            }, __config.changeInterval);
        }
    };

    /**
     * __setCachedFormDataObject
     * 
     * @access  private
     * @param   HTMLFormElement $element
     * @param   Object data
     * @return  Boolean
     */
    var __setCachedFormDataObject = function($element, data) {
        var id = $element.getAttribute('data-form-data-cacher-id'),
            key = 'FormDataCacher:' + __getCacheKeyVersion() + ':' + (id);
        __cacheData(key, JSON.stringify(data));
        return true;
    };

    /**
     * __setPageFormElementValues
     * 
     * @access  private
     * @param   HTMLFormElement $element
     * @return  Boolean
     */
    var __setPageFormElementValues = function($element) {
        var pageFormData = __getPageFormDataObject($element),
            cachedFormData = __getCachedFormDataObject($element);
        if (JSON.stringify(pageFormData) === JSON.stringify(cachedFormData)) {
            return false;
        }
        if (cachedFormData === undefined) {
            return false;
        }
        var $elements = $element.elements;
        for (var $element of $elements) {
            var name = $element.name,
                value = cachedFormData[name];
            $element.value = value;
        }
        return true;
    };

    /**
     * __trackChanges
     * 
     * @access  private
     * @param   HTMLFormElement $element
     * @return  Boolean
     */
    var __trackChanges = function($element) {
        var pageFormData = __getPageFormDataObject($element),
            cachedFormData = __getCachedFormDataObject($element);
        if (JSON.stringify(pageFormData) === JSON.stringify(cachedFormData)) {
            return false;
        }
        __setCachedFormDataObject($element, pageFormData);
        return true;
    };

    /**
     * Public methods
     */
    return {

        /**
         * init
         * 
         * @access  public
         * @return  Boolean
         */
        init: function() {
            __scan();
            return true;
        },

        /**
         * setConfig
         * 
         * @access  public
         * @param   Object|String key
         * @param   undefined|String value
         * @return  Boolean
         */
        setConfig: function(key, value) {
            if (typeof key === 'object') {
                var config = key;
                __config = config;
                return true;
            }
            __config[key] = value;
            return true;
        }
    };
})();
