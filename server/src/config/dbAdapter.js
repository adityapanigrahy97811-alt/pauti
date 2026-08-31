const bcrypt = require('bcryptjs');

// In-Memory persistent data store for local dev fallback when external PostgreSQL is not running
class MemoryStore {
  constructor() {
    this.users = [];
    this.collectors = [];
    this.donors = [];
    this.collections = [];
    this.expenses = [];
    this.auditLogs = [];
    this.settings = null;
    this.counters = {};
    this.isSeeded = false;
  }

  seedDefaults() {
    if (this.isSeeded) return;
    this.isSeeded = true;

    // 1. Settings
    this.settings = {
      id: 'default',
      mandalName: 'अष्टविनायक मित्र मंडळ',
      mandalNameEn: 'Ashtavinayak Mitra Mandal',
      establishedYear: 1987,
      festivalYear: '३९ वा गणेशोत्सव',
      location: 'रोहित कॉलनी, बोईसर',
      locationEn: 'Rohit Colony, Boisar',
      brandingText: '|| गणपती बाप्पा मोरया ||',
      receiptPrefix: 'MNDL',
      receiptStartingNo: 1,
      receiptFooterMarathi: 'आपल्या सहकार्याबद्दल मनःपूर्वक धन्यवाद.',
      receiptFooterEnglish: 'Thank you for your generous contribution.',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      authorizedSignatoryTitle: 'कार्याध्यक्ष / खजिनदार',
      updatedAt: new Date()
    };

    // 2. Users (Admin & Treasurer with login credentials)
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('Admin@123', salt);
    const treasurerHash = bcrypt.hashSync('Treasurer@123', salt);

    const admin = {
      id: 'usr_admin_1',
      name: 'Aditya Patil (Admin)',
      username: 'admin',
      email: 'admin@ashtavinayak-boisar.org',
      mobile: '9822001122',
      password: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      mustChangePassword: false,
      lastLogin: new Date(),
      createdAt: new Date('2026-08-01T00:00:00Z'),
      updatedAt: new Date()
    };

    const treasurer = {
      id: 'usr_treasurer_1',
      name: 'Santosh Sawant (Treasurer)',
      username: 'treasurer',
      email: 'treasurer@ashtavinayak-boisar.org',
      mobile: '9833445566',
      password: treasurerHash,
      role: 'TREASURER',
      status: 'ACTIVE',
      mustChangePassword: false,
      lastLogin: new Date(),
      createdAt: new Date('2026-08-01T00:00:00Z'),
      updatedAt: new Date()
    };

    this.users.push(admin, treasurer);

    // 3. Dedicated Collectors (No login accounts, plain collection representatives)
    this.collectors = [
      {
        id: 'coltr_1',
        name: 'Sachin Jadhav',
        mobile: '9877889900',
        isActive: true,
        createdAt: new Date('2026-08-01T00:00:00Z'),
        updatedAt: new Date()
      },
      {
        id: 'coltr_2',
        name: 'Amit Patil',
        mobile: '9822112233',
        isActive: true,
        createdAt: new Date('2026-08-01T00:00:00Z'),
        updatedAt: new Date()
      },
      {
        id: 'coltr_3',
        name: 'Rahul More',
        mobile: '9890123456',
        isActive: true,
        createdAt: new Date('2026-08-01T00:00:00Z'),
        updatedAt: new Date()
      },
      {
        id: 'coltr_4',
        name: 'Sagar Shinde',
        mobile: '9833441122',
        isActive: true,
        createdAt: new Date('2026-08-01T00:00:00Z'),
        updatedAt: new Date()
      }
    ];

    // 4. Donors (Empty - Ready for real data entry)
    this.donors = [];

    // 5. Collections (Empty - Ready for real data entry)
    this.collections = [];

    // 6. Expenses (Empty - Ready for real data entry)
    this.expenses = [];

    // 7. Counters (Starting from 0)
    this.counters['receipt_2026'] = 0;
    this.counters['expense_2026'] = 0;

    // 8. Audit Log
    this.auditLogs = [
      {
        id: 'aud_1',
        userId: admin.id,
        userName: admin.name,
        role: 'ADMIN',
        action: 'INITIALIZE_SYSTEM',
        entity: 'System',
        entityId: 'default',
        description: 'Ashtavinayak Mitra Mandal System initialized for 39th Ganeshotsav 2026.',
        ipAddress: '127.0.0.1',
        details: JSON.stringify({ version: '1.0.0', year: 2026, mandal: 'अष्टविनायक मित्र मंडळ' }),
        createdAt: new Date()
      }
    ];
  }
}

const memoryStore = new MemoryStore();
memoryStore.seedDefaults();

function filterList(list, where) {
  if (!where) return [...list];
  return list.filter(item => {
    for (const key of Object.keys(where)) {
      if (key === 'OR') {
        const matchesOr = where.OR.some(subCondition => {
          for (const subKey of Object.keys(subCondition)) {
            const cond = subCondition[subKey];
            const val = item[subKey] || '';
            if (cond && typeof cond === 'object' && cond.contains) {
              if (cond.mode === 'insensitive') {
                if (!String(val).toLowerCase().includes(cond.contains.toLowerCase())) return false;
              } else {
                if (!String(val).includes(cond.contains)) return false;
              }
            } else if (val !== cond) {
              return false;
            }
          }
          return true;
        });
        if (!matchesOr) return false;
        continue;
      }

      const cond = where[key];
      const val = item[key];

      if (cond && typeof cond === 'object' && !Array.isArray(cond) && !(cond instanceof Date)) {
        if (cond.gte && new Date(val) < new Date(cond.gte)) return false;
        if (cond.lte && new Date(val) > new Date(cond.lte)) return false;
        if (cond.lt && new Date(val) >= new Date(cond.lt)) return false;
        if (cond.gt && new Date(val) <= new Date(cond.gt)) return false;
        if (cond.contains) {
          if (cond.mode === 'insensitive') {
            if (!String(val || '').toLowerCase().includes(cond.contains.toLowerCase())) return false;
          } else {
            if (!String(val || '').includes(cond.contains)) return false;
          }
        }
        if (cond.startsWith && !String(val || '').startsWith(cond.startsWith)) return false;
        if (cond.in && !cond.in.includes(val)) return false;
      } else if (val !== cond) {
        return false;
      }
    }
    return true;
  });
}

function sortList(list, orderBy) {
  if (!orderBy) return list;
  const key = Object.keys(orderBy)[0];
  const direction = orderBy[key] === 'desc' ? -1 : 1;
  return [...list].sort((a, b) => {
    let valA = a[key];
    let valB = b[key];
    if (valA instanceof Date) valA = valA.getTime();
    if (valB instanceof Date) valB = valB.getTime();
    if (valA < valB) return -1 * direction;
    if (valA > valB) return 1 * direction;
    return 0;
  });
}

const mockPrisma = {
  settings: {
    async findUnique({ where }) {
      await memoryStore.seedDefaults();
      return { ...memoryStore.settings };
    },
    async create({ data }) {
      memoryStore.settings = { ...data, updatedAt: new Date() };
      return { ...memoryStore.settings };
    },
    async upsert({ where, update, create }) {
      if (!memoryStore.settings) {
        memoryStore.settings = { ...create, updatedAt: new Date() };
      } else {
        memoryStore.settings = { ...memoryStore.settings, ...update, updatedAt: new Date() };
      }
      return { ...memoryStore.settings };
    },
    async update({ where, data }) {
      memoryStore.settings = { ...memoryStore.settings, ...data, updatedAt: new Date() };
      return { ...memoryStore.settings };
    }
  },

  user: {
    async findUnique({ where } = {}) {
      if (!where) return null;
      await memoryStore.seedDefaults();
      const user = memoryStore.users.find(u => (where.id && u.id === where.id) || (where.username && u.username === where.username) || (where.email && u.email === where.email));
      return user ? { ...user } : null;
    },
    async findFirst({ where } = {}) {
      await memoryStore.seedDefaults();
      const matches = filterList(memoryStore.users, where);
      return matches.length > 0 ? { ...matches[0] } : null;
    },
    async findMany({ where, orderBy, select } = {}) {
      await memoryStore.seedDefaults();
      let res = filterList(memoryStore.users, where);
      res = sortList(res, orderBy);
      return res.map(u => ({ ...u }));
    },
    async create({ data } = {}) {
      const newUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        status: 'ACTIVE',
        role: 'COLLECTOR',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      memoryStore.users.push(newUser);
      return { ...newUser };
    },
    async update({ where, data } = {}) {
      const idx = memoryStore.users.findIndex(u => (where.id && u.id === where.id) || (where.username && u.username === where.username));
      if (idx === -1) throw new Error('User not found');
      memoryStore.users[idx] = { ...memoryStore.users[idx], ...data, updatedAt: new Date() };
      return { ...memoryStore.users[idx] };
    },
    async upsert({ where, update, create } = {}) {
      let existing = await this.findUnique({ where });
      if (existing) {
        return this.update({ where, data: update });
      }
      return this.create({ data: create });
    }
  },

  collector: {
    async findUnique({ where, include } = {}) {
      if (!where) return null;
      await memoryStore.seedDefaults();
      const coltr = memoryStore.collectors.find(c => (where.id && c.id === where.id) || (where.name && c.name === where.name));
      if (!coltr) return null;
      const res = { ...coltr };
      if (include?.collections) {
        res.collections = memoryStore.collections.filter(col => col.collectorId === coltr.id);
      }
      return res;
    },
    async findFirst({ where, orderBy } = {}) {
      await memoryStore.seedDefaults();
      let res = filterList(memoryStore.collectors, where);
      res = sortList(res, orderBy);
      return res.length > 0 ? { ...res[0] } : null;
    },
    async findMany({ where, skip = 0, take = 100, orderBy, include } = {}) {
      await memoryStore.seedDefaults();
      let res = filterList(memoryStore.collectors, where);
      res = sortList(res, orderBy);
      res = res.slice(skip, skip + take);
      return res.map(c => {
        const item = { ...c };
        if (include?.collections) {
          item.collections = memoryStore.collections.filter(col => col.collectorId === c.id);
        }
        return item;
      });
    },
    async count(options = {}) {
      const where = options?.where;
      await memoryStore.seedDefaults();
      return filterList(memoryStore.collectors, where).length;
    },
    async create({ data }) {
      const newCollector = {
        id: `coltr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: data.name.trim(),
        mobile: data.mobile ? data.mobile.trim() : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.collectors.push(newCollector);
      return { ...newCollector };
    },
    async update({ where, data }) {
      const idx = memoryStore.collectors.findIndex(c => where.id && c.id === where.id);
      if (idx === -1) throw new Error('Collector not found');
      memoryStore.collectors[idx] = {
        ...memoryStore.collectors[idx],
        ...data,
        updatedAt: new Date()
      };
      return { ...memoryStore.collectors[idx] };
    }
  },

  donor: {
    async findUnique({ where } = {}) {
      if (!where) return null;
      await memoryStore.seedDefaults();
      const d = memoryStore.donors.find(item => (where.id && item.id === where.id) || (where.mobile && item.mobile === where.mobile));
      return d ? { ...d } : null;
    },
    async findFirst({ where } = {}) {
      await memoryStore.seedDefaults();
      const matches = filterList(memoryStore.donors, where);
      return matches.length > 0 ? { ...matches[0] } : null;
    },
    async findMany({ where, skip = 0, take = 50, orderBy, select } = {}) {
      await memoryStore.seedDefaults();
      let res = filterList(memoryStore.donors, where);
      res = sortList(res, orderBy);
      res = res.slice(skip, skip + take);
      return res.map(d => ({ ...d }));
    },
    async count(options = {}) {
      const where = options?.where;
      await memoryStore.seedDefaults();
      return filterList(memoryStore.donors, where).length;
    },
    async aggregate({ where, _sum } = {}) {
      await memoryStore.seedDefaults();
      const list = filterList(memoryStore.donors, where);
      let sum = 0;
      list.forEach(d => { sum += d.totalContribution || 0; });
      return { _sum: { totalContribution: sum } };
    },
    async create({ data } = {}) {
      const newD = {
        id: `dnr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        totalContribution: 0,
        donationCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      memoryStore.donors.push(newD);
      return { ...newD };
    },
    async update({ where, data } = {}) {
      const idx = memoryStore.donors.findIndex(d => (where.id && d.id === where.id) || (where.mobile && d.mobile === where.mobile));
      if (idx === -1) throw new Error('Donor not found');
      
      const current = memoryStore.donors[idx];
      let updatedTotal = data.totalContribution;
      if (data.totalContribution && typeof data.totalContribution === 'object' && data.totalContribution.increment !== undefined) {
        updatedTotal = (current.totalContribution || 0) + data.totalContribution.increment;
      }
      let updatedCount = data.donationCount;
      if (data.donationCount && typeof data.donationCount === 'object' && data.donationCount.increment !== undefined) {
        updatedCount = (current.donationCount || 0) + data.donationCount.increment;
      }

      memoryStore.donors[idx] = {
        ...current,
        ...data,
        ...(updatedTotal !== undefined && { totalContribution: updatedTotal }),
        ...(updatedCount !== undefined && { donationCount: updatedCount }),
        updatedAt: new Date()
      };
      return { ...memoryStore.donors[idx] };
    },
    async upsert({ where, update, create } = {}) {
      const existing = await this.findUnique({ where });
      if (existing) return this.update({ where, data: update });
      return this.create({ data: create });
    }
  },

  collection: {
    async findUnique({ where, include } = {}) {
      if (!where) return null;
      await memoryStore.seedDefaults();
      const c = memoryStore.collections.find(item => (where.id && item.id === where.id) || (where.receiptNo && item.receiptNo === where.receiptNo));
      if (!c) return null;
      const res = { ...c };
      if (include?.collector) {
        res.collector = memoryStore.collectors.find(u => u.id === c.collectorId) || null;
      }
      if (include?.donor) {
        res.donor = memoryStore.donors.find(d => d.id === c.donorId) || null;
      }
      if (include?.createdBy) {
        res.createdBy = memoryStore.users.find(u => u.id === c.createdById) || null;
      }
      return res;
    },
    async findFirst({ where, orderBy } = {}) {
      await memoryStore.seedDefaults();
      let res = filterList(memoryStore.collections, where);
      res = sortList(res, orderBy);
      return res.length > 0 ? { ...res[0] } : null;
    },
    async findMany({ where, skip = 0, take = 50, orderBy, include, select } = {}) {
      await memoryStore.seedDefaults();
      let res = filterList(memoryStore.collections, where);
      res = sortList(res, orderBy);
      res = res.slice(skip, skip + take);

      return res.map(c => {
        const item = { ...c };
        if (include?.collector) item.collector = memoryStore.collectors.find(u => u.id === c.collectorId) || null;
        if (include?.donor) item.donor = memoryStore.donors.find(d => d.id === c.donorId) || null;
        if (include?.createdBy) item.createdBy = memoryStore.users.find(u => u.id === c.createdById) || null;
        return item;
      });
    },
    async count(options = {}) {
      const where = options?.where;
      await memoryStore.seedDefaults();
      return filterList(memoryStore.collections, where).length;
    },
    async aggregate({ where, _sum, _count } = {}) {
      await memoryStore.seedDefaults();
      const list = filterList(memoryStore.collections, where);
      let sum = 0;
      list.forEach(c => { sum += c.amount || 0; });
      return {
        _sum: { amount: sum },
        _count: { id: list.length }
      };
    },
    async create({ data, include } = {}) {
      const newC = {
        id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        status: 'ACTIVE',
        paymentMode: 'CASH',
        purpose: 'Ganeshotsav Donation',
        collectionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      memoryStore.collections.push(newC);
      return this.findUnique({ where: { id: newC.id }, include });
    },
    async update({ where, data } = {}) {
      const idx = memoryStore.collections.findIndex(c => (where.id && c.id === where.id) || (where.receiptNo && c.receiptNo === where.receiptNo));
      if (idx === -1) throw new Error('Collection not found');
      memoryStore.collections[idx] = { ...memoryStore.collections[idx], ...data, updatedAt: new Date() };
      return { ...memoryStore.collections[idx] };
    },
    async upsert({ where, update, create } = {}) {
      const existing = await this.findUnique({ where });
      if (existing) return this.update({ where, data: update });
      return this.create({ data: create });
    }
  },

  expense: {
    async findUnique({ where, include } = {}) {
      if (!where) return null;
      await memoryStore.seedDefaults();
      const e = memoryStore.expenses.find(item => (where.id && item.id === where.id) || (where.expenseId && item.expenseId === where.expenseId));
      if (!e) return null;
      const res = { ...e };
      if (include?.createdBy) {
        res.createdBy = memoryStore.users.find(u => u.id === e.createdById) || null;
      }
      return res;
    },
    async findFirst({ where, orderBy } = {}) {
      await memoryStore.seedDefaults();
      let res = filterList(memoryStore.expenses, where);
      res = sortList(res, orderBy);
      return res.length > 0 ? { ...res[0] } : null;
    },
    async findMany({ where, skip = 0, take = 50, orderBy, include, select } = {}) {
      await memoryStore.seedDefaults();
      let res = filterList(memoryStore.expenses, where);
      res = sortList(res, orderBy);
      res = res.slice(skip, skip + take);

      return res.map(e => {
        const item = { ...e };
        if (include?.createdBy) item.createdBy = memoryStore.users.find(u => u.id === e.createdById) || null;
        return item;
      });
    },
    async count(options = {}) {
      const where = options?.where;
      await memoryStore.seedDefaults();
      return filterList(memoryStore.expenses, where).length;
    },
    async aggregate({ where, _sum, _count } = {}) {
      await memoryStore.seedDefaults();
      const list = filterList(memoryStore.expenses, where);
      let sum = 0;
      list.forEach(e => { sum += e.amount || 0; });
      return {
        _sum: { amount: sum },
        _count: { id: list.length }
      };
    },
    async groupBy({ by, where, _sum, _count } = {}) {
      await memoryStore.seedDefaults();
      const list = filterList(memoryStore.expenses, where);
      const groups = {};
      list.forEach(item => {
        const key = item.category;
        if (!groups[key]) groups[key] = { category: key, _sum: { amount: 0 }, _count: { id: 0 } };
        groups[key]._sum.amount += item.amount;
        groups[key]._count.id += 1;
      });
      return Object.values(groups);
    },
    async create({ data, include } = {}) {
      const newE = {
        id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        status: 'ACTIVE',
        paymentMode: 'CASH',
        expenseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      memoryStore.expenses.push(newE);
      return this.findUnique({ where: { id: newE.id }, include });
    },
    async update({ where, data } = {}) {
      const idx = memoryStore.expenses.findIndex(e => (where.id && e.id === where.id) || (where.expenseId && e.expenseId === where.expenseId));
      if (idx === -1) throw new Error('Expense not found');
      memoryStore.expenses[idx] = { ...memoryStore.expenses[idx], ...data, updatedAt: new Date() };
      return { ...memoryStore.expenses[idx] };
    },
    async upsert({ where, update, create } = {}) {
      const existing = await this.findUnique({ where });
      if (existing) return this.update({ where, data: update });
      return this.create({ data: create });
    }
  },

  auditLog: {
    async create({ data } = {}) {
      const newLog = {
        id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date(),
        ...data
      };
      memoryStore.auditLogs.push(newLog);
      return { ...newLog };
    },
    async findMany({ where, skip = 0, take = 50, orderBy, include } = {}) {
      await memoryStore.seedDefaults();
      let res = filterList(memoryStore.auditLogs, where);
      res = sortList(res, orderBy);
      res = res.slice(skip, skip + take);
      return res.map(l => ({ ...l }));
    },
    async count(options = {}) {
      const where = options?.where;
      await memoryStore.seedDefaults();
      return filterList(memoryStore.auditLogs, where).length;
    }
  },

  counter: {
    async findUnique({ where } = {}) {
      if (!where) return null;
      const val = memoryStore.counters[where.id];
      return val !== undefined ? { id: where.id, seq: val } : null;
    },
    async create({ data } = {}) {
      memoryStore.counters[data.id] = data.seq;
      return { id: data.id, seq: data.seq };
    },
    async update({ where, data } = {}) {
      let current = memoryStore.counters[where.id] || 0;
      if (data.seq && data.seq.increment) {
        current += data.seq.increment;
      } else if (typeof data.seq === 'number') {
        current = data.seq;
      }
      memoryStore.counters[where.id] = current;
      return { id: where.id, seq: current };
    },
    async upsert({ where, update, create } = {}) {
      if (memoryStore.counters[where.id] !== undefined) {
        return this.update({ where, data: update });
      }
      return this.create({ data: create });
    }
  },

  async $transaction(fn) {
    return fn(mockPrisma);
  },

  async $disconnect() {
    return;
  }
};

module.exports = {
  mockPrisma
};
