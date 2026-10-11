const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Product = require("../../models/product");
const User = require("../../models/user");

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? require("stripe")(stripeKey) : null;
const url = process.env.API_URL || "/api/v1";

const addProduct = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "User authentication required" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      title,
      price,
      description,
      locationName,
      coordinatesX,
      coordinatesY,
      discount,
      remain,
      brand,
      category,
    } = req.body;

    if (!title || price === undefined || !description) {
      return res.status(400).json({
        message: "Title, price, and description are required fields",
      });
    }

    const pathsArray =
      req.files && req.files.length > 0
        ? req.files.map((obj) => obj.path.replace(/\\/g, "/"))
        : [];

    const coordX = parseFloat(coordinatesX) || 0;
    const coordY = parseFloat(coordinatesY) || 0;

    const product = new Product({
      title: title.trim(),
      price: parseFloat(price) || 0,
      description: description.trim(),
      images: pathsArray,
      location: {
        name: locationName || "General",
        location: {
          type: "Point",
          coordinates: [coordX, coordY],
        },
      },
      discount: parseFloat(discount) || 0,
      remain: parseInt(remain, 10) || 0,
      sold: 0,
      brand: brand || "Generic",
      category: category || "General",
    });

    const savedProduct = await product.save();

    await User.updateOne(
      { _id: userId },
      { $addToSet: { myProduct: savedProduct._id.toString() } }
    );

    return res.status(201).json({
      product: savedProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      productId,
      title,
      price,
      description,
      locationName,
      coordinatesX,
      coordinatesY,
      discount,
      remain,
      brand,
      category,
    } = req.body;

    const targetId = productId || req.params.productId;
    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Valid product ID is required" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingProduct = await Product.findById(targetId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    // Authorization: User must own the product or be an admin
    const ownsProduct = existingUser.myProduct.includes(targetId);
    if (!ownsProduct && existingUser.type !== "admin") {
      return res.status(403).json({
        message: "You do not have permission to modify this product",
      });
    }

    const query = {};
    if (title) query.title = title.trim();
    if (price !== undefined) query.price = parseFloat(price);
    if (description) query.description = description.trim();

    if (locationName || coordinatesX !== undefined || coordinatesY !== undefined) {
      query.location = {
        name: locationName || existingProduct.location?.name || "General",
        location: {
          type: "Point",
          coordinates: [
            coordinatesX !== undefined
              ? parseFloat(coordinatesX)
              : existingProduct.location?.location?.coordinates?.[0] || 0,
            coordinatesY !== undefined
              ? parseFloat(coordinatesY)
              : existingProduct.location?.location?.coordinates?.[1] || 0,
          ],
        },
      };
    }

    if (discount !== undefined) query.discount = parseFloat(discount);
    if (remain !== undefined) query.remain = parseInt(remain, 10);
    if (brand) query.brand = brand;
    if (category) query.category = category;

    if (req.files && req.files.length > 0) {
      query.images = req.files.map((obj) => obj.path.replace(/\\/g, "/"));
    }

    await Product.updateOne({ _id: targetId }, { $set: query });
    const updatedProduct = await Product.findById(targetId);

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const targetId = req.params.productId || req.query.productId || req.body.productId;

    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Valid product ID is required" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingProduct = await Product.findById(targetId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    // Authorization check
    const ownsProduct = existingUser.myProduct.includes(targetId);
    if (!ownsProduct && existingUser.type !== "admin") {
      return res.status(403).json({
        message: "You do not have permission to delete this product",
      });
    }

    // Clean up associated image files
    if (existingProduct.images && Array.isArray(existingProduct.images)) {
      for (const imgPath of existingProduct.images) {
        const fullPath = path.join(__dirname, "../../", imgPath);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
          } catch (err) {
            console.warn("Could not delete image file:", err.message);
          }
        }
      }
    }

    await Product.deleteOne({ _id: targetId });

    // Clean references
    await User.updateOne({ _id: userId }, { $pull: { myProduct: targetId } });
    await User.updateMany({}, { $pull: { cart: targetId, favorite: targetId } });

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const list = await Product.find({ _id: { $in: existingUser.cart || [] } });
    return res.status(200).json({ count: list.length, list });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const list = await Product.find({ _id: { $in: existingUser.favorite || [] } });
    return res.status(200).json({ count: list.length, list });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid product ID is required" });
    }

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    await User.updateOne({ _id: userId }, { $addToSet: { cart: productId } });
    return res.status(200).json({ message: "Added to cart successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid product ID is required" });
    }

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    await User.updateOne({ _id: userId }, { $addToSet: { favorite: productId } });
    return res.status(200).json({ message: "Added to favorites successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.productId || req.query.productId || req.body.productId;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    await User.updateOne({ _id: userId }, { $pull: { cart: productId } });
    return res.status(200).json({ message: "Removed from cart successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.productId || req.query.productId || req.body.productId;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    await User.updateOne({ _id: userId }, { $pull: { favorite: productId } });
    return res.status(200).json({ message: "Removed from favorites successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addRate = async (req, res) => {
  try {
    const { productId, rating } = req.body;

    if (!productId || rating === undefined) {
      return res.status(400).json({ message: "Product ID and rating are required" });
    }

    const numRating = parseFloat(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    }

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    const currentRating = existingProduct.rating || 3.0;
    const newRating = Math.min(5, Math.max(1, (currentRating * 4 + numRating) / 5));
    const roundedRating = Math.round(newRating * 10) / 10;

    await Product.updateOne({ _id: productId }, { $set: { rating: roundedRating } });
    return res.status(200).json({
      message: "Product rated successfully",
      rating: roundedRating,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBuyAgain = async (req, res) => {
  try {
    const userId = req.userId;
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const list = await Product.find({ _id: { $in: existingUser.buyAgain || [] } });
    return res.status(200).json({ count: list.length, list });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const checkout = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(501).json({
        message: "Stripe payment integration is not configured. Please set STRIPE_SECRET_KEY.",
      });
    }

    const userId = req.userId;
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartProducts = await Product.find({ _id: { $in: existingUser.cart || [] } });
    if (cartProducts.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const lineItems = cartProducts.map((p) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: p.title,
          description: p.description.slice(0, 200),
        },
        unit_amount: Math.round(p.price * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}${url}/user/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get("host")}${url}/user/cancel`,
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
  editProduct,
  deleteProduct,
  getCart,
  getFavorite,
  addCart,
  addFavorite,
  deleteCart,
  deleteFavorite,
  addRate,
  getBuyAgain,
  checkout,
};
