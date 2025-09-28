"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.QueryAuthorDto = void 0;
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var QueryAuthorDto = /** @class */ (function () {
    function QueryAuthorDto() {
        this.page = 1;
        this.limit = 10;
    }
    __decorate([
        swagger_1.ApiPropertyOptional({ description: 'Search by author name' }),
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], QueryAuthorDto.prototype, "search");
    __decorate([
        swagger_1.ApiPropertyOptional({ description: 'Page number (default: 1)' }),
        class_validator_1.IsOptional(),
        class_transformer_1.Type(function () { return Number; }),
        class_validator_1.IsInt(),
        class_validator_1.Min(1)
    ], QueryAuthorDto.prototype, "page");
    __decorate([
        swagger_1.ApiPropertyOptional({
            description: 'Number of items per page (default: 10)'
        }),
        class_validator_1.IsOptional(),
        class_transformer_1.Type(function () { return Number; }),
        class_validator_1.IsInt(),
        class_validator_1.Min(1)
    ], QueryAuthorDto.prototype, "limit");
    return QueryAuthorDto;
}());
exports.QueryAuthorDto = QueryAuthorDto;
