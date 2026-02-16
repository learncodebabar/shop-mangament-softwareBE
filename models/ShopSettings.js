const mongoose = require("mongoose");

const ShopSettingsSchema = new mongoose.Schema(
  {
    shopName: { type: String, default: "My Shop" },
    address: { type: String, default: "Main Bazar, City" },
    location: { type: String, default: "Lahore, Punjab" },
    phone: { type: String, default: "03xx-xxxxxxx" },
    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
    about: { type: String, default: "" },
    logo: { type: String, default: "" },

    theme: {
      mode: { type: String, enum: ["light", "dark"], default: "light" },
      primary: { type: String, default: "#0d6efd" },
      secondary: { type: String, default: "#6c757d" },
    },
  },
  { timestamps: true },
);

ShopSettingsSchema.statics.getInstance = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("ShopSettings", ShopSettingsSchema);
