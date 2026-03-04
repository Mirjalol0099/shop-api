const prisma = require('../../prismaClient.js');

exports.createOrder = async (userId, items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const err = new Error('Order items required');
    err.status = 400;
    throw err;
  }

  // 1) Duplicate productId'larni jamlaymiz: [{productId:1, quantity:1}, {productId:1, quantity:2}] => {1:3}
  const qtyByProductId = new Map();
  for (const it of items) {
    const pid = Number(it.productId);
    const qty = Number(it.quantity);

    if (!Number.isInteger(pid) || pid <= 0) {
      const err = new Error('Invalid productId');
      err.status = 400;
      throw err;
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      const err = new Error('Quantity must be greater than 0');
      err.status = 400;
      throw err;
    }

    qtyByProductId.set(pid, (qtyByProductId.get(pid) || 0) + qty);
  }

  const normalizedItems = Array.from(qtyByProductId.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  return await prisma.$transaction(async (tx) => {
    const productIds = normalizedItems.map((i) => i.productId);

    // 2) Productlarni transaction ichida olamiz
    const products = await tx.product.findMany({
      where: {
        id: { in: productIds },
        isDeleted: false,
      },
      select: { id: true, price: true, stock: true, name: true },
    });

    if (products.length !== normalizedItems.length) {
      const err = new Error('Some products not found');
      err.status = 404;
      throw err;
    }

    for (const it of normalizedItems) {
      const updated = await tx.product.updateMany({
        where: {
          id: it.productId,
          isDeleted: false,
          stock: { gte: it.quantity },
        },
        data: {
          stock: { decrement: it.quantity },
        },
      });

      if (updated.count !== 1) {
        const p = products.find((x) => x.id === it.productId);
        const err = new Error(`Not enough stock for product ${p?.name?.['uz-Latn'] ?? p?.name ?? it.productId}`);
        err.status = 400;
        throw err;
      }
    }

    // 4) totalPrice + orderItems tayyorlaymiz
    let totalPrice = 0;
    const orderItems = normalizedItems.map((it) => {
      const product = products.find((p) => p.id === it.productId);
      totalPrice += product.price * it.quantity;

      return {
        productId: product.id,
        quantity: it.quantity,
        price: product.price,
      };
    });

    // 5) Order yaratamiz
    const order = await tx.order.create({
      data: {
        userId,
        totalPrice,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    return order;
  });
};

exports.getAllOrders = async () => {
  return prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// USER o'z orderlari
exports.getMyOrders = async (userId) => {
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

// ADMIN: status update
exports.updateStatus = async (id, status) => {
  const allowed = ['PENDING', 'PAID', 'CANCELED'];
  if (!allowed.includes(status)) {
    const err = new Error('Invalid status');
    err.status = 400;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    // Order + items ni olamiz
    const order = await tx.order.findUnique({
      where: { id },
      include: {
        items: true, // productId, quantity, price
      },
    });

    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    // Status o'zgarmayotgan bo'lsa, shu holicha qaytaramiz
    if (order.status === status) {
      return tx.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      });
    }

    // Agar oldin cancel bo'lgan bo'lsa, qayta "ochish"ni taqiqlaymiz (xohlasangiz keyin ruxsat beramiz)
    if (order.status === 'CANCELED' && status !== 'CANCELED') {
      const err = new Error('Canceled order cannot be reopened');
      err.status = 400;
      throw err;
    }

    // CANCELED bo'layotganda stock qaytaramiz (faqat birinchi marta)
    if (status === 'CANCELED' && order.status !== 'CANCELED') {
      // Duplicate productId bo'lsa jamlab yuboramiz
      const qtyByProductId = new Map();
      for (const it of order.items) {
        qtyByProductId.set(it.productId, (qtyByProductId.get(it.productId) || 0) + it.quantity);
      }

      // Stock increment
      for (const [productId, qty] of qtyByProductId.entries()) {
        await tx.product.update({
          where: { id: productId },
          data: { stock: { increment: qty } },
        });
      }
    }

    // Status update
    const updated = await tx.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { product: true } } },
    });

    return updated;
  });
};

// ADMIN: delete (FK muammosiz)
exports.deleteOrder = async (id) => {
  return prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { orderId: id } });
    await tx.order.delete({ where: { id } });
    return true;
  });
};