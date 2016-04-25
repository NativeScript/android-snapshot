"use strict";
var core_1 = require('angular2/core');
var observable_1 = require('data/observable');
var text_value_accessor_1 = require('nativescript-angular/value-accessors/text-value-accessor');
var checked_value_accessor_1 = require('nativescript-angular/value-accessors/checked-value-accessor');
var TemplatedComponent = (function () {
    function TemplatedComponent() {
        this.renderChild = false;
        this.text = "Hello, external templates";
    }
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], TemplatedComponent.prototype, "renderChild", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], TemplatedComponent.prototype, "text", void 0);
    TemplatedComponent = __decorate([
        core_1.Component({
            selector: 'templated-component',
            directives: [TemplatedComponent],
            templateUrl: 'title.html'
        }), 
        __metadata('design:paramtypes', [])
    ], TemplatedComponent);
    return TemplatedComponent;
}());
exports.TemplatedComponent = TemplatedComponent;
var ProgressComponent = (function () {
    function ProgressComponent(element) {
        this.element = element;
    }
    ProgressComponent.prototype.ngOnInit = function () {
        this.element.nativeElement.value = 90;
    };
    ProgressComponent = __decorate([
        core_1.Directive({
            selector: 'Progress',
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], ProgressComponent);
    return ProgressComponent;
}());
exports.ProgressComponent = ProgressComponent;
var RendererTest = (function () {
    function RendererTest() {
        this.buttonText = "";
        this.showDetails = false;
        this.detailsText = "";
        this.moreDetailsText = "";
        this.detailLines = [];
        this.isValid = true;
        this.buttonText = 'Save...';
        this.showDetails = true;
        this.detailsText = 'plain ng-if directive \ndetail 1-2-3...';
        this.moreDetailsText = 'More details:';
        this.model = new observable_1.Observable({
            'test': 'Jack',
            'testBoolean': false,
            'deliveryDate': new Date(),
            'deliveryTime': new Date(),
            'sliderTest': 0,
            'search': null,
            'selectedIndex': 0,
            'listPickerItems': [
                1, 2, 3, 4, 5
            ],
            'segmentedBarItems': [
                { 'title': 'first' },
                { 'title': 'second' },
                { 'title': 'third' }
            ]
        });
        this.detailLines = [
            "ngFor inside a ngIf 1",
            "ngFor inside a ngIf 2",
        ];
    }
    RendererTest.prototype.onSave = function ($event, name, $el) {
        console.log('onSave event ' + $event + ' name ' + name);
        alert(name);
    };
    RendererTest.prototype.testLoaded = function ($event) {
        console.log("testLoaded called with event args: " + $event);
    };
    RendererTest.prototype.onToggleDetails = function () {
        console.log('onToggleDetails current: ' + this.showDetails);
        this.showDetails = !this.showDetails;
    };
    RendererTest.prototype.setUpperCase = function ($event) {
        if ($event.value && $event.value.toUpperCase) {
            return $event.value.toUpperCase();
        }
        if (typeof $event === "string") {
            return $event.toUpperCase();
        }
        return $event;
    };
    RendererTest = __decorate([
        core_1.Component({
            selector: 'renderer-test',
            directives: [TemplatedComponent, ProgressComponent, text_value_accessor_1.TextValueAccessor, checked_value_accessor_1.CheckedValueAccessor],
            templateUrl: 'renderer-test.html'
        }), 
        __metadata('design:paramtypes', [])
    ], RendererTest);
    return RendererTest;
}());
exports.RendererTest = RendererTest;
//# sourceMappingURL=renderer-test.js.map