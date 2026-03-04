// const {PrismaClient} = require('@prisma/client');

const prisma = require('../../prismaClient.js')
const {hashPassword, comparePassword} = require('../../utils/hash');
const {generateToken} = require('../../utils/jwt');
const { error } = require('console');

exports.register = async ({name, email, password, role}) => {
    
    const existingUser = await prisma.user.findUnique({where: {email}});
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {name, email, password: hashedPassword, role},
    });

    const token = generateToken({id: user.id, role: user.role});
    return {user, token};
};

exports.login = async ({email, password}) => {
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) throw new Error('Invalid credentials');

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    const token = generateToken({id:user.id, role:user.role});
    return {user, token};
}