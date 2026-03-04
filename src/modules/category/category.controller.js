const service = require('./category.service.js');
const { normalizeLang } = require('../../services/translate.service.js');

function pickI18n(val, lang) {
  if (!val) return null;
  return val[lang] ?? val['uz-Latn'] ?? val['ru'] ?? val['uz-Cyrl'] ?? null;
}

exports.getAll = async (req, res, next) => {
  try {
    const rows = await service.getAll();
    const lang = normalizeLang(req.lang || 'uz-Latn');

    res.json(rows.map(c => ({
      id: c.id,
      name: pickI18n(c.name, lang),
      createdAt: c.createdAt,
    })));
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const name = (req.body?.name || '').trim();
    const sourceLang = normalizeLang(req.body?.sourceLang || 'uz-Latn');

    // if (!name) return res.status(400).json({ message: 'name is required' });

    const created = await service.create(name, sourceLang);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    // if (!Number.isFinite(id)) return res.status(400).json({ message: 'invalid id' });

    const name = req.body?.name;
    const sourceLang = normalizeLang(req.body?.sourceLang || 'uz-Latn');

    // Agar name string bo‘lsa bo‘shligini tekshiramiz
    if (typeof name === 'string' && !name.trim()) {
      return res.status(400).json({ message: 'name is required' });
    }

    const updated = await service.update(id, name, sourceLang);
    res.json(updated);
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    // if (!Number.isFinite(id)) return res.status(400).json({ message: 'invalid id' });

    await service.remove(id);
    res.json({ message: 'Category deleted' });
  } catch (e) {
    next(e);
  }
};
