const service = require('./brand.service.js');
const { normalizeLang } = require('../../services/translate.service.js');

function pickI18n(val, lang) {
  if (!val) return null;
  return val[lang] ?? val['uz-Latn'] ?? val['ru'] ?? val['uz-Cyrl'] ?? null;
}

exports.getAll = async (req, res, next) => {
  try {
    const rows = await service.getAll();
    const lang = normalizeLang(req.lang || 'uz-Latn');

    res.json(rows.map(b => ({
      id: b.id,
      name: pickI18n(b.name, lang),
      createdAt: b.createdAt,
    })));
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const name = (req.body?.name || '').trim();
    const sourceLang = req.body?.sourceLang || 'uz-Latn';

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
    const sourceLang = req.body?.sourceLang || 'uz-Latn';

    if (typeof name === 'string' && !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    res.json(await service.update(id, name, sourceLang));
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    // if (!Number.isFinite(id)) return res.status(400).json({ message: 'invalid id' });

    await service.remove(id);
    res.json({ message: 'Brand deleted' });
  } catch (e) {
    next(e);
  }
};
