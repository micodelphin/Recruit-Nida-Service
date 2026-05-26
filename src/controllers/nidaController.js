const prisma = require('../config/db');

/**
 * GET /api/nida/:nationalId
 * Fetch NIDA profile by national ID
 */
const getNIDAProfile = async (req, res) => {
  try {
    const { nationalId } = req.params;

    const profile = await prisma.nidaProfile.findUnique({
      where: { nationalId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No NIDA profile found for this National ID.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'NIDA profile fetched successfully.',
      data: profile,
    });
  } catch (error) {
    console.error('Get NIDA profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching NIDA profile.',
    });
  }
};

/**
 * GET /api/nida/verify-email/:email
 * Fetch NIDA profile by email
 * Used by recruitment-backend to verify user on register
 */
const getNIDAByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const profile = await prisma.nidaProfile.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No NIDA profile found for this email.',
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Get NIDA by email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching NIDA profile.',
    });
  }
};

/**
 * POST /api/nida
 * Create a new NIDA profile
 */
const createNIDAProfile = async (req, res) => {
  try {
    const {
      nationalId,
      fullName,
      gender,
      dob,
      placeOfBirth,
      nationality,
      fatherName,
      motherName,
      address,
      province,
      district,
      phone,
      email,
    } = req.body;

    const existing = await prisma.nidaProfile.findUnique({
      where: { nationalId },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A NIDA profile with this National ID already exists.',
      });
    }

    const profile = await prisma.nidaProfile.create({
      data: {
        nationalId,
        fullName,
        gender,
        dob: new Date(dob),
        placeOfBirth,
        nationality,
        fatherName,
        motherName,
        address,
        province,
        district,
        phone: phone || null,
        email: email ? email.toLowerCase() : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'NIDA profile created successfully.',
      data: profile,
    });
  } catch (error) {
    console.error('Create NIDA profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating NIDA profile.',
    });
  }
};

/**
 * GET /api/nida
 * Get all NIDA profiles
 */
const getAllNIDAProfiles = async (req, res) => {
  try {
    const profiles = await prisma.nidaProfile.findMany({
      orderBy: { fullName: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: profiles,
      meta: { total: profiles.length },
    });
  } catch (error) {
    console.error('Get all NIDA profiles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching NIDA profiles.',
    });
  }
};

module.exports = {
  getNIDAProfile,
  getNIDAByEmail,
  createNIDAProfile,
  getAllNIDAProfiles,
};