const userService = require('../service/user-service');
const {validationResult} = require('express-validator');


class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {email, password} = req.body;
            const userData = await userService.registration(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {

        } catch (e) {

        }
    }

    async logout(req, res, next) {
        try {
            
        } catch (e) {

        }
    }

    async activate(req, res, next) {
        try {
            
        } catch (e) {

        }
    }

    async refresh(req, res, next) {
        try {
            
        } catch (e) {

        }
    }

    async getUsers(req, res, next) {
        try {
            res.json(['123', '456']);
        } catch (e) {

        }
    }
}

module.exports = new UserController();