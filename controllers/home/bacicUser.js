// packages
const path = require("path");
const fs = require("fs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// imports
const Product = require("../../models/product");
const User = require("../../models/user");

// init
const url = process.env.API_URL;

// routers
const addProduct = async (req, res) => {
  try {
    const pathsArray = req.files.map((obj) => obj.path);
    const {
      userId,
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
    const existingUser = await User.findOne({ _id: userId });
    if (existingUser) {
      let product = new Product({
        title,
        price,
        description,
        images: pathsArray,
        location: {
          name: locationName,
          location: {
            type: "Point",
            coordinates: [coordinatesX, coordinatesY],
          },
        },
        discount,
        remain,
        brand,
        category,
      });
      product = await product.save();
      list = existingUser.myProduct;
      let p = true;
      for (let i = 0; i < list.length; i++) {
        if (list[i] == product._id) {
          p = false;
        }
      }
      if (p) {
        list.push(product._id);
      }
      await User.updateOne({ _id: userId }, { $set: { myProduct: list } });
      return res.status(200).json({ product, message: "product created.." });
    } else {
      return res.status(400).json({ message: "user not exist" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
    const pathsArray = req.files.map((obj) => obj.path);
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
    const existingProduct = await Product.findOne({ _id: productId });
    console.log(existingProduct);
    if (existingProduct) {
      const query = {};
      if (title) query.title = title;
      if (price) query.price = price;
      if (description) query.description = description;
      if (locationName || coordinatesX || coordinatesY) {
        if (!locationName) {
          return res.status(400).json({ message: "please enter locationName" });
        }
        if (!coordinatesX) {
          return res.status(400).json({ message: "please enter coordinatesX" });
        }
        if (!coordinatesY) {
          return res.status(400).json({ message: "please enter coordinatesY" });
        }
        query.location = {
          name: locationName,
          location: {
            type: "Point",
            coordinates: [coordinatesX, coordinatesY],
          },
        };
      }
      if (discount) query.discount = discount;
      if (remain) query.remain = remain;
      if (brand) query.brand = brand;
      if (category) query.category = category;
      if (pathsArray.length != 0) query.images = pathsArray;
      console.log(query);
      await Product.updateOne({ _id: productId }, { $set: query });
      const existingProduct = await Product.findOne({ _id: productId });
      console.log(existingProduct);
      return res.status(200).json({ message: "product edited.." });
    } else {
      return res.status(400).json({ message: "product not exist" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;
    const existingUser = await User.findOne({ _id: userId });
    if (existingUser) {
      const existingProduct = await Product.findOne({ _id: productId });
      if (existingProduct) {
        for (let i = 0; i < existingProduct.images.length; i++) {
          fs.unlinkSync(
            path.join(__dirname, `../../${existingProduct.images[i]}`)
          );
        }
        await Product.deleteOne({ _id: productId });
        const indexToRemove = existingUser.myProduct.indexOf(productId);
        if (indexToRemove !== -1) {
          const list = existingUser.myProduct.splice(indexToRemove, 1);
          await User.updateOne({ _id: userId }, { $set: { myProduct: list } });
        }
        return res.status(200).json({ message: "product deleted.." });
      } else {
        return res.status(400).json({ message: "product not exist" });
      }
    } else {
      return res.status(400).json({ message: "user not exist" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }
    let list = [];
    for (let i = 0; i < existingUser.cart.length; i++) {
      let existingProduct = await Product.findOne({
        _id: existingUser.cart[i],
      });
      list.push(existingProduct);
    }
    return res.status(200).json({ list });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }
    let list = [];
    for (let i = 0; i < existingUser.favorite.length; i++) {
      let existingProduct = await Product.findOne({
        _id: existingUser.favorite[i],
      });
      list.push(existingProduct);
    }
    return res.status(200).json({ list });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }
    list = existingUser.cart;
    let p = true;
    for (let i = 0; i < list.length; i++) {
      if (list[i] == productId) {
        p = false;
      }
    }
    if (p) {
      list.push(productId);
    }
    await User.updateOne({ _id: userId }, { $set: { cart: list } });
    return res.status(200).json({ message: "add to cart successfuly" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }
    list = existingUser.favorite;
    let p = true;
    for (let i = 0; i < list.length; i++) {
      if (list[i] == productId) {
        p = false;
      }
    }
    if (p) {
      list.push(productId);
    }
    await User.updateOne({ _id: userId }, { $set: { favorite: list } });
    return res.status(200).json({ message: "add to favorite successfuly" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }
    const indexToRemove = existingUser.cart.indexOf(productId);
    if (indexToRemove !== -1) {
      const list = existingUser.cart.splice(indexToRemove, 1);
      await User.updateOne({ _id: userId }, { $set: { cart: list } });
    }
    return res.status(200).json({ message: "delete from cart successfuly" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }
    const indexToRemove = existingUser.favorite.indexOf(productId);
    if (indexToRemove !== -1) {
      const list = existingUser.favorite.splice(indexToRemove, 1);
      await User.updateOne({ _id: userId }, { $set: { favorite: list } });
    }
    return res
      .status(200)
      .json({ message: "delete from favorite successfuly" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addRate = async (req, res) => {
  try {
    const { productId, rating } = req.body;
    const existingProduct = await Product.findOne({ _id: productId });
    if (existingProduct) {
      number = Math.trunc(existingProduct.rating);
      fnumber = existingProduct.rating - number;
      result = (fnumber * 10 + rating) / 20 + (number + 1);
      await Product.updateOne({ _id: productId }, { $set: { rating: result } });
      return res.status(200).json({ message: "rated successfuly" });
    } else {
      return res.status(400).json({ message: "product not exist" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBuyAgain = async (req, res) => {
  try {
    const userId = req.userId;
    const existingUser = await User.findOne({ _id: userId });
    if (existingUser) {
      let list = [];
      for (let i = 0; i < existingUser.buyAgain.length; i++) {
        let existingProduct = await Product.findOne({
          _id: existingUser.buyAgain[i],
        });
        list.push(existingProduct);
      }
      return res.status(200).json({ list });
    } else {
      return res.status(400).json({ message: "user not exist" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// const checkout = async (req, res) => {
//   try {
//     const { userId, products } = req.body;
//     const existingUser = await User.findOne({ _id: userId });
//     if (existingUser) {
//       const list = products.map((x) => ({
//         price_data: {
//           currency: "usd",
//           product_data: {
//             name: x.product.title,
//           },
//           unit_amount: Math.round(x.product.price * 100),
//         },
//         quantity: x.quantity,
//       }));
//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         line_items: list,
//         mode: "payment",
//         success_url:
//           "http://localhost:3000/api/v1/user/complete?session_id={CHECKOUT_SESSION_ID}",
//         cancel_url: "http://localhost:3000/api/v1/user/cancel",
//       });
//       res.redirect(session.url);
//       console.log("here1");
//       // if (session) {
//       //   let buyList = existingUser.buyAgain;
//       //   products.forEach(async (x) => {
//       //     buyList.push(x.product._id);
//       //   });
//       //   await User.updateOne({ _id: userId }, { $set: { buyAgain: buyList } });
//       //   return res.status(200).json({ message: "payment successfuly" });
//       // } else {
//       //   return res.status(400).json({ message: "payment failed" });
//       // }
//     } else {
//       return res.status(400).json({ message: "user not exist" });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

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
  // checkout,
};
