import mongoose, { Schema } from "mongoose";

const inspirationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    websiteLink: {
      type: String,
      required: true,
    },
    desktopScreenshotUrl: {
      type: String,
    },
    mobileScreenshotUrl: {
      type: String,
    },
    colorScheme: { type: [String] },

    fonts: { type: [String] },
    technologyStack: { type: [String] },
    categories: { type: [String] },
    niche: { type: String },
    slug: { type: String, unique: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    pageView: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Inspiration = mongoose.model("Inspiration ", inspirationSchema);
