"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreateAuthorDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var CreateAuthorDto = /** @class */ (function () {
    function CreateAuthorDto() {
    }
    __decorate([
        swagger_1.ApiProperty({ description: 'Full name of the author' }),
        class_validator_1.IsNotEmpty(),
        class_validator_1.IsString()
    ], CreateAuthorDto.prototype, "name");
    __decorate([
        swagger_1.ApiPropertyOptional({ description: 'Biography of the author' }),
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateAuthorDto.prototype, "bio");
    __decorate([
        swagger_1.ApiProperty({ description: 'Literary period (e.g., Romanticism)' }),
        class_validator_1.IsNotEmpty(),
        class_validator_1.IsString()
    ], CreateAuthorDto.prototype, "litPeriod");
    __decorate([
        swagger_1.ApiProperty({ description: 'Author Image' }),
        class_validator_1.IsNotEmpty(),
        class_validator_1.IsString()
    ], CreateAuthorDto.prototype, "authorImage");
    __decorate([
        swagger_1.ApiProperty({ description: 'Birth date (YYYY-MM-DD)' }),
        class_validator_1.IsNotEmpty(),
        class_validator_1.IsString()
    ], CreateAuthorDto.prototype, "bornDate");
    __decorate([
        swagger_1.ApiPropertyOptional({ description: 'Death date (YYYY-MM-DD if applicable)' }),
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateAuthorDto.prototype, "deathDate");
    return CreateAuthorDto;
}());
exports.CreateAuthorDto = CreateAuthorDto;
