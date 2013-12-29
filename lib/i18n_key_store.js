function I18nKeyStore(options){
  options = options || {}
  this.scope = options.scope;
  this.translations = {};
}

I18nKeyStore.prototype.set = function(key, value){
  if (key.indexOf('#') !== -1){
    key = key.replace('#', '');
  } else if (this.scope) {
    key = this.scope + '.' + key;
  }
  var path = key.split('.');
  var context = this.expandPath(path, key);
  var finalKey = path[path.length - 1];

  if (!context[finalKey]) {
    context[finalKey] = value;
  } else {
    if (typeof context[finalKey] === 'object') {
      throw new Error(key + ' used as both scope and a key');
    }
    throw new Error('cannot reuse key ' + key);
  }
};

I18nKeyStore.prototype.expandPath = function(path, originalKey){
  var trans = this.translations;

  path = path.slice(0, -1);

  path.forEach(function(key){
    if (typeof trans[key] === 'string') {
      throw new Error(originalKey + ' used as both scope and a key');
    }
    trans = trans[key] = trans[key] || {};
  });
  return trans;
};

export default I18nKeyStore;
