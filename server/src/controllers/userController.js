const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { logAudit } = require('../middleware/audit');

/**
 * List all users (Admin only)
 */
async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: {
            collectionsCreated: true,
            collectionsAsCollector: true,
            expensesCreated: true
          }
        }
      }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('listUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
}

/**
 * Create a new user (Admin only)
 */
async function createUser(req, res) {
  try {
    const { name, username, email, mobile, password, role = 'COLLECTOR' } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ success: false, message: 'Name, username, and password are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          ...(email ? [{ email: email.trim().toLowerCase() }] : [])
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Username or email is already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: email ? email.trim().toLowerCase() : null,
        mobile: mobile ? mobile.trim() : null,
        password: hashedPassword,
        role,
        status: 'ACTIVE',
        mustChangePassword: true
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    await logAudit({
      req,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: newUser.id,
      description: `New user ${newUser.name} (@${newUser.username}) with role ${newUser.role} created by ${req.user.name}.`
    });

    res.status(201).json({ success: true, message: 'User created successfully.', data: newUser });
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
}

/**
 * Update user details (Admin only)
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, mobile, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name ? name.trim() : existing.name,
        email: email ? email.trim().toLowerCase() : existing.email,
        mobile: mobile !== undefined ? mobile : existing.mobile,
        role: role || existing.role
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        mobile: true,
        role: true,
        status: true
      }
    });

    await logAudit({
      req,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: id,
      description: `User @${existing.username} details updated by ${req.user.name}.`
    });

    res.json({ success: true, message: 'User updated successfully.', data: updated });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
}

/**
 * Toggle user status ACTIVE/INACTIVE
 */
async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deactivating own account
    if (req.user.id === targetUser.id) {
      return res.status(400).json({ success: false, message: 'You cannot change the status of your own account.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status }
    });

    await logAudit({
      req,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: id,
      description: `User @${targetUser.username} status set to ${status} by ${req.user.name}.`
    });

    res.json({ success: true, message: `User status changed to ${status}.`, data: updated });
  } catch (error) {
    console.error('toggleUserStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
}

/**
 * Reset User Password
 */
async function resetPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword: true
      }
    });

    await logAudit({
      req,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: id,
      description: `Password for user @${targetUser.username} was reset by ${req.user.name}.`
    });

    res.json({ success: true, message: `Password reset successfully for @${targetUser.username}.` });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
}

/**
 * Collector Performance and Analytics
 */
async function getCollectorsStats(req, res) {
  try {
    const collectors = await prisma.user.findMany({
      where: { role: { in: ['COLLECTOR', 'ADMIN', 'TREASURER'] }, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        username: true,
        mobile: true,
        role: true,
        status: true
      }
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    const stats = await Promise.all(
      collectors.map(async (c) => {
        const [totalAgg, todayAgg, monthAgg] = await Promise.all([
          prisma.collection.aggregate({
            where: { collectorId: c.id, status: 'ACTIVE' },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.collection.aggregate({
            where: { collectorId: c.id, status: 'ACTIVE', collectionDate: { gte: todayStart } },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.collection.aggregate({
            where: { collectorId: c.id, status: 'ACTIVE', collectionDate: { gte: monthStart } },
            _sum: { amount: true },
            _count: { id: true }
          })
        ]);

        return {
          ...c,
          totalCollection: totalAgg._sum.amount || 0,
          totalCount: totalAgg._count.id || 0,
          todayCollection: todayAgg._sum.amount || 0,
          todayCount: todayAgg._count.id || 0,
          monthCollection: monthAgg._sum.amount || 0,
          monthCount: monthAgg._count.id || 0
        };
      })
    );

    stats.sort((a, b) => b.totalCollection - a.totalCollection);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('getCollectorsStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch collector statistics.' });
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetPassword,
  getCollectorsStats
};
