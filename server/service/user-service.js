const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = ('./token-service.js')
const UserDto = require('../dtos/user-dto');

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if (candidate) {
            throw new Error(`User with email: ${email}, already registered`)
        } 
        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4() // v34fa-asdfas-adege3-sa-sf

        const user = await UserModel.create({email, password: hashPassword, activationLink})
        await mailService.sendActivationMail(email, activationLink)

        const userDto = new UserDto(user); // id, email, isActivated
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        


        return {
            ...tokens,
            user: userDto
        }
    }
}

module.exports = new UserService();