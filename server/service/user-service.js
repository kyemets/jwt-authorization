const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
    async registration(email, password) {
        if (typeof email !== "string") {
            throw ApiError.BadRequest("Invalid email format");
        }
        const candidate = await UserModel.findOne({ email: { $eq: email } })
        if (candidate) {
            throw ApiError.BadRequest(`The user with the email address ${email} already exists`)
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

        const user = await UserModel.create({email, password: hashPassword, activationLink})
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user); // id, email, isActivated
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({ activationLink: { $eq: activationLink } })
        if (!user) {
            throw ApiError.BadRequest(`Error link`)
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        if (typeof email !== "string") {
            throw ApiError.BadRequest("Invalid email format");
        }
        const user = await UserModel.findOne({ email: { $eq: email } });
        if (!user) {
            throw ApiError.BadRequest(`The user with this email ${email} was not found!`)
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest(`Invalid password`)
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }
    
    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user); // id, email, isActivated
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }
}

module.exports = new UserService();