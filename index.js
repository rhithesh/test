const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/restaurantRatings", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  cuisine: { type: String, required: true },
});

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
});

const User = mongoose.model("User", userSchema);
const Restaurant = mongoose.model("Restaurant", restaurantSchema);
const Rating = mongoose.model("Rating", ratingSchema);

app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.post("/restaurants", async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.status(201).send(restaurant);
  } catch (err) {
    res.status(400).send(err.message);
  }
});


app.post("/ratings", async (req, res) => {
  try {
    const { user, restaurant, rating, comment } = req.body;

    const foundUser = await User.findById(user);
    const foundRestaurant = await Restaurant.findById(restaurant);
    if (!foundUser || !foundRestaurant) {
      return res.status(404).send("User or Restaurant not found.");
    }

    const newRating = new Rating({ user, restaurant, rating, comment });
    await newRating.save();
    res.status(201).send(newRating);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get("/restaurants/:restaurantId/ratings", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const ratings = await Rating.find({ restaurant: restaurantId }).populate("user", "name email");
    res.send(ratings);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
