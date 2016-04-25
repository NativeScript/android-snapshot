var global = this;
var window = this;
global.__snapshot = true;

this.__extends = function (d, b) {
	for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	function __() { this.constructor = d; }
	__.prototype = b.prototype;
	d.prototype = new __();
};

this.__decorate = function (decorators, target, key, desc) {
	if (typeof global.Reflect === "object" && typeof global.Reflect.decorate === "function") {
		return global.Reflect.decorate(decorators, target, key, desc);
	}
	switch (arguments.length) {
		case 2: return decorators.reduceRight(function (o, d) { return (d && d(o)) || o; }, target);
		case 3: return decorators.reduceRight(function (o, d) { return (d && d(target, key)), void 0; }, void 0);
		case 4: return decorators.reduceRight(function (o, d) { return (d && d(target, key, o)) || o; }, desc);
	}
};

this.Deprecated = function (target, key, descriptor) {
	if (descriptor) {
		var originalMethod = descriptor.value;
		descriptor.value = function () {
			var args = [];
			for (var _i = 0; _i < arguments.length; _i++) {
				args[_i - 0] = arguments[_i];
			}
			return originalMethod.apply(this, args);
		};
		return descriptor;
	}
	else {
		return target;
	}
}
