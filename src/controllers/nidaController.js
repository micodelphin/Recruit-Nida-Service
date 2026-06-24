const prisma = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Multer setup ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/photos');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `nida_photo_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, JPG and WEBP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB max
});

// Export multer middleware for use in routes
const uploadPhoto = upload.single('photo');

// ── Controllers ─────────────────────────────────────────────

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

    // Build full photo URL if photo exists
    const profileWithPhoto = {
      ...profile,
      photoUrl: profile.photoPath
        ? `http://localhost:8001/uploads/photos/${path.basename(profile.photoPath)}`
        : null,
    };

    return res.status(200).json({
      success: true,
      message: 'NIDA profile fetched successfully.',
      data: profileWithPhoto,
    });
  } catch (error) {
    console.error('Get NIDA profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching NIDA profile.',
    });
  }
};

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

    const profileWithPhoto = {
      ...profile,
      photoUrl: profile.photoPath
        ? `http://localhost:8001/uploads/photos/${path.basename(profile.photoPath)}`
        : null,
    };

    return res.status(200).json({
      success: true,
      data: profileWithPhoto,
    });
  } catch (error) {
    console.error('Get NIDA by email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching NIDA profile.',
    });
  }
};

const createNIDAProfile = async (req, res) => {
  try {
    const {
      nationalId, fullName, gender, dob, placeOfBirth,
      nationality, fatherName, motherName, address,
      province, district, phone, email,
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
        photoPath: null,
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

// PATCH /api/nida/:nationalId/photo — upload or update photo for a profile
const uploadNIDAPhoto = async (req, res) => {
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided.',
      });
    }

    // Delete old photo from disk if it exists
    if (profile.photoPath && fs.existsSync(profile.photoPath)) {
      fs.unlinkSync(profile.photoPath);
    }

    // Save new photo path
    await prisma.nidaProfile.update({
      where: { nationalId },
      data: { photoPath: req.file.path },
    });

    const photoUrl = `http://localhost:8001/uploads/photos/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully.',
      data: { photoUrl },
    });
  } catch (error) {
    console.error('Upload NIDA photo error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading photo.',
    });
  }
};

const getAllNIDAProfiles = async (req, res) => {
  try {
    const profiles = await prisma.nidaProfile.findMany({
      orderBy: { fullName: 'asc' },
    });

    const profilesWithPhoto = profiles.map((p) => ({
      ...p,
      photoUrl: p.photoPath
        ? `http://localhost:8001/uploads/photos/${path.basename(p.photoPath)}`
        : null,
    }));

    return res.status(200).json({
      success: true,
      data: profilesWithPhoto,
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
  uploadNIDAPhoto,
  uploadPhoto,
};