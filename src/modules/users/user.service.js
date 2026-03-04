const prisma = require('../../prismaClient.js');

exports.getAll = () => {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            // updatedAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};