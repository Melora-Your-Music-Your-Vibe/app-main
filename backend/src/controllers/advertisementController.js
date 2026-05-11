const { Op } = require('sequelize');
const { Advertisement } = require('../models');
const { uploadImage, deleteResource } = require('../utils/cloudinaryUpload');

// @desc    Get all active advertisements (public)
// @route   GET /api/v1/advertisements/active
const getActiveAdvertisements = async (req, res, next) => {
  try {
    const now = new Date();
    const ads = await Advertisement.findAll({
      where: {
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
      },
      order: [['createdAt', 'DESC']],
      // Exclude 'type' from public response as per requirement
      attributes: { exclude: ['type', 'imagePublicId'] },
    });

    res.json({ success: true, data: ads });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all advertisements (admin)
// @route   GET /api/v1/admin/advertisements
const getAllAdvertisements = async (req, res, next) => {
  try {
    const ads = await Advertisement.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: ads });
  } catch (error) {
    next(error);
  }
};

// @desc    Create advertisement (admin)
// @route   POST /api/v1/admin/advertisements
const createAdvertisement = async (req, res, next) => {
  try {
    const { title, description, type, price, startDate, endDate } = req.body;

    if (!title || !description || !type || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, type, and end date are required',
      });
    }

    // Validate type
    const validTypes = ['commercial', 'brand', 'subscription'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be one of: commercial, brand, subscription',
      });
    }

    let imageResult = null;
    if (req.file) {
      imageResult = await uploadImage(req.file.buffer, 'melora/advertisements', {
        transformation: [
          { width: 1200, height: 600, crop: 'fill', quality: 'auto' },
        ],
      });
    }

    const ad = await Advertisement.create({
      title,
      description,
      type,
      price: price || null,
      startDate: startDate || new Date(),
      endDate: new Date(endDate),
      imageUrl: imageResult?.url || null,
      imagePublicId: imageResult?.publicId || null,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: ad,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update advertisement (admin)
// @route   PUT /api/v1/admin/advertisements/:id
const updateAdvertisement = async (req, res, next) => {
  try {
    const ad = await Advertisement.findByPk(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    const { title, description, type, price, startDate, endDate, isActive } = req.body;

    if (title) ad.title = title;
    if (description) ad.description = description;
    if (type) ad.type = type;
    if (price !== undefined) ad.price = price || null;
    if (startDate) ad.startDate = new Date(startDate);
    if (endDate) ad.endDate = new Date(endDate);
    if (isActive !== undefined) ad.isActive = isActive === 'true' || isActive === true;

    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      if (ad.imagePublicId) {
        await deleteResource(ad.imagePublicId).catch(console.error);
      }
      const imageResult = await uploadImage(req.file.buffer, 'melora/advertisements', {
        transformation: [
          { width: 1200, height: 600, crop: 'fill', quality: 'auto' },
        ],
      });
      ad.imageUrl = imageResult.url;
      ad.imagePublicId = imageResult.publicId;
    }

    await ad.save();

    res.json({
      success: true,
      message: 'Advertisement updated successfully',
      data: ad,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete advertisement (admin)
// @route   DELETE /api/v1/admin/advertisements/:id
const deleteAdvertisement = async (req, res, next) => {
  try {
    const ad = await Advertisement.findByPk(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    // Delete image from Cloudinary
    if (ad.imagePublicId) {
      await deleteResource(ad.imagePublicId).catch(console.error);
    }

    await ad.destroy();

    res.json({
      success: true,
      message: 'Advertisement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle advertisement active status (admin)
// @route   PATCH /api/v1/admin/advertisements/:id/toggle
const toggleAdvertisement = async (req, res, next) => {
  try {
    const ad = await Advertisement.findByPk(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    ad.isActive = !ad.isActive;
    await ad.save();

    res.json({
      success: true,
      message: `Advertisement ${ad.isActive ? 'activated' : 'deactivated'} successfully`,
      data: ad,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveAdvertisements,
  getAllAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  toggleAdvertisement,
};
