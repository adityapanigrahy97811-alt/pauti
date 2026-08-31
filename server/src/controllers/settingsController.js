const prisma = require('../config/prisma');
const { logAudit } = require('../middleware/audit');

/**
 * Get Mandal & Receipt Settings
 */
async function getSettings(req, res) {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 'default' }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
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
          receiptFooterEnglish: 'Thank you for your generous contribution.'
        }
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('getSettings error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve settings.' });
  }
}

/**
 * Update Mandal & Receipt Settings (Admin only)
 */
async function updateSettings(req, res) {
  try {
    const {
      mandalName,
      mandalNameEn,
      establishedYear,
      festivalYear,
      location,
      locationEn,
      brandingText,
      receiptPrefix,
      receiptFooterMarathi,
      receiptFooterEnglish,
      authorizedSignatoryTitle
    } = req.body;

    const updated = await prisma.settings.upsert({
      where: { id: 'default' },
      update: {
        ...(mandalName && { mandalName }),
        ...(mandalNameEn && { mandalNameEn }),
        ...(establishedYear && { establishedYear: parseInt(establishedYear, 10) }),
        ...(festivalYear && { festivalYear }),
        ...(location && { location }),
        ...(locationEn && { locationEn }),
        ...(brandingText && { brandingText }),
        ...(receiptPrefix && { receiptPrefix }),
        ...(receiptFooterMarathi && { receiptFooterMarathi }),
        ...(receiptFooterEnglish && { receiptFooterEnglish }),
        ...(authorizedSignatoryTitle && { authorizedSignatoryTitle })
      },
      create: {
        id: 'default',
        mandalName: mandalName || 'अष्टविनायक मित्र मंडळ',
        mandalNameEn: mandalNameEn || 'Ashtavinayak Mitra Mandal',
        establishedYear: establishedYear ? parseInt(establishedYear, 10) : 1987,
        festivalYear: festivalYear || '३९ वा गणेशोत्सव',
        location: location || 'रोहित कॉलनी, बोईसर',
        locationEn: locationEn || 'Rohit Colony, Boisar',
        brandingText: brandingText || '|| गणपती बाप्पा मोरया ||',
        receiptPrefix: receiptPrefix || 'MNDL',
        receiptFooterMarathi: receiptFooterMarathi || 'आपल्या सहकार्याबद्दल मनःपूर्वक धन्यवाद.',
        receiptFooterEnglish: receiptFooterEnglish || 'Thank you for your generous contribution.',
        authorizedSignatoryTitle: authorizedSignatoryTitle || 'कार्याध्यक्ष / खजिनदार'
      }
    });

    await logAudit({
      req,
      action: 'CHANGE_SETTINGS',
      entity: 'Settings',
      entityId: 'default',
      description: `Mandal settings updated by ${req.user.name}.`,
      details: req.body
    });

    res.json({ success: true, message: 'Settings updated successfully. सेटिंग्ज जतन केल्या.', data: updated });
  } catch (error) {
    console.error('updateSettings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
}

module.exports = {
  getSettings,
  updateSettings
};
